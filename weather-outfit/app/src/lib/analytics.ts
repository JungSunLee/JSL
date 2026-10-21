import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AppState, Platform } from 'react-native';
import { API_BASE_URL } from './config';
import { DEMO_MODE } from './demo';

/**
 * 사용 로그 수집기.
 * - 화면 보기(screen_view), 버튼 누름(tap) 등을 모아 10초마다 또는 20건이 쌓이면 서버로 보낸다.
 * - 기기마다 익명 ID 를 만들어 DAU/MAU 를 셀 수 있게 하고, 로그인하면 토큰을 함께 보내 사용자와 연결한다.
 * - 개인정보(이름·키·몸무게 등)는 절대 넣지 않는다. 어떤 화면·버튼인지만 기록한다.
 * - 실패해도 앱 동작에 영향이 없어야 하므로 모든 오류는 삼킨다.
 */
interface Event {
  name: string;
  ts: string;
  screen?: string;
  target?: string;
  props?: Record<string, string | number | boolean>;
  sessionId: string;
}

const DEVICE_KEY = 'analytics.deviceId';
const FLUSH_MS = 10_000;
const BATCH = 20;

let deviceId: string | null = null;
let token: string | null = null;
let queue: Event[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let sessionId = newId();
let lastActive = Date.now();

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function ensureDeviceId() {
  if (deviceId) return deviceId;
  try {
    const saved = await AsyncStorage.getItem(DEVICE_KEY);
    if (saved) return (deviceId = saved);
    deviceId = newId();
    await AsyncStorage.setItem(DEVICE_KEY, deviceId);
  } catch {
    deviceId = deviceId ?? newId();
  }
  return deviceId;
}

async function flush() {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!queue.length || DEMO_MODE) {
    queue = [];
    return;
  }
  const events = queue;
  queue = [];
  try {
    await fetch(`${API_BASE_URL}/v1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({
        deviceId: await ensureDeviceId(),
        platform: Platform.OS,
        appVersion: Constants.expoConfig?.version ?? 'dev',
        events,
      }),
      keepalive: true,
    });
  } catch {
    // 네트워크 오류: 이번 묶음은 버린다 (사용 로그는 유실돼도 괜찮다)
  }
}

function enqueue(e: Omit<Event, 'ts' | 'sessionId'>) {
  // 30분 이상 쉬었다가 돌아오면 새 세션
  if (Date.now() - lastActive > 30 * 60_000) sessionId = newId();
  lastActive = Date.now();
  queue.push({ ...e, ts: new Date().toISOString(), sessionId });
  if (queue.length >= BATCH) void flush();
  else if (!timer) timer = setTimeout(() => void flush(), FLUSH_MS);
}

export const analytics = {
  /** 로그인 토큰이 바뀌면 알려준다 (로그아웃 시 null) */
  setToken(t: string | null) {
    token = t;
  },
  screen(screen: string) {
    enqueue({ name: 'screen_view', screen });
  },
  tap(screen: string, target: string, props?: Event['props']) {
    enqueue({ name: 'tap', screen, target, props });
  },
  event(name: string, screen?: string, props?: Event['props']) {
    enqueue({ name, screen, props });
  },
  flush,
};

// 앱이 백그라운드로 가면 쌓인 로그를 바로 보낸다
AppState.addEventListener('change', (state) => {
  if (state !== 'active') void flush();
});
if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => void flush());
}
