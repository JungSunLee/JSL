import { mockWeather, type UserProfile, type WeatherSnapshot } from '@wo/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Me, ProviderId } from './api';

/**
 * 데모 모드: 서버 없이 앱 전체 흐름(날씨 → 로그인 → 내 정보 → 코디)을 둘러볼 수 있다.
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

export const demoApi = {
  weather: async (): Promise<WeatherSnapshot> => ({ ...mockWeather(), locationName: '성남시 중원구 중앙동 (데모)' }),
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
