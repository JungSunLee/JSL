import { mockWeather, type UserProfile, type WeatherSnapshot } from '@wo/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Me, ProviderId } from './api';

/**
 * 데모 모드: 서버 없이 앱 전체 흐름(날씨 → 로그인 → 내 정보 → 옷차림)을 둘러볼 수 있다.
 * EXPO_PUBLIC_DEMO=1 로 빌드하면 켜진다. 로그인·프로필은 이 기기(브라우저)에만 저장된다.
 */
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO === '1';

const KEY = 'demo.me.v1';
export const DEMO_TOKEN = 'demo-token';

const NAMES: Record<ProviderId, string> = { kakao: '카카오 사용자', naver: '네이버 사용자', google: 'Google 사용자', dev: '테스트 사용자' };

async function load(): Promise<Me | null> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? (JSON.parse(raw) as Me) : null;
}

async function save(me: Me | null) {
  if (me) await AsyncStorage.setItem(KEY, JSON.stringify(me));
  else await AsyncStorage.removeItem(KEY);
}

/**
 * 데모 날씨 장면 미리보기용: 웹에서 ?scene=rain|snow|cloudy|night|clear 로 날씨를 바꿔 볼 수 있다.
 */
function sceneOverride(): Partial<WeatherSnapshot> {
  if (typeof window === 'undefined') return {};
  const q = new URLSearchParams(window.location.search).get('scene') ?? (() => { try { return window.sessionStorage.getItem('demo.scene'); } catch { return null; } })();
  if (!q) return {};
  try { window.sessionStorage.setItem('demo.scene', q); } catch { /* ignore */ }
  switch (q) {
    case 'rain': return { sky: 'cloudy', precipType: 'rain', precipProbMax: 80, temp: 9, tempMin: 7, tempMax: 12, windSpeed: 7 };
    case 'snow': return { sky: 'cloudy', precipType: 'snow', precipProbMax: 70, temp: -3, tempMin: -6, tempMax: 1 };
    case 'cloudy': return { sky: 'cloudy', precipType: 'none' };
    case 'hot': return { sky: 'clear', precipType: 'none', temp: 31, tempMin: 25, tempMax: 33, uvIndex: 8, humidity: 70 };
    case 'night': return { sky: 'clear', precipType: 'none' };
    default: return {};
  }
}

export const demoApi = {
  weather: async (): Promise<WeatherSnapshot> => ({ ...mockWeather(), locationName: '성남시 중원구 중앙동 (데모)', ...sceneOverride() }),
  providers: async () => (['kakao', 'naver', 'google'] as ProviderId[]).map((id) => ({ id, enabled: true })),
  me: async () => {
    const me = await load();
    if (!me) throw new Error('unauthorized');
    return me;
  },
  signIn: async (provider: ProviderId): Promise<Me> => {
    const existing = await load();
    const me: Me = existing ?? { id: 'demo', name: NAMES[provider], providers: [provider], profile: null, needsOnboarding: true };
    await save(me);
    return me;
  },
  saveProfile: async (profile: UserProfile, opts: { name?: string }) => {
    const me = await demoApi.me();
    const next: Me = { ...me, name: opts.name || me.name, profile, needsOnboarding: false };
    await save(next);
    return next;
  },
  deleteMe: () => save(null),
};

/** 데모 장면 미리보기용 시각(0~23). ?scene=night 이면 22시로 본다 */
export function demoHour(): number | null {
  if (!DEMO_MODE || typeof window === 'undefined') return null;
  try {
    const q = new URLSearchParams(window.location.search).get('scene') ?? window.sessionStorage.getItem('demo.scene');
    return q === 'night' ? 22 : null;
  } catch {
    return null;
  }
}
