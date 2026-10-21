import type { UserProfile } from '@wo/core';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, ApiError, type Me, type ProviderId } from '@/lib/api';
import { DEMO_MODE, DEMO_TOKEN, demoApi } from '@/lib/demo';
import { secure } from '@/lib/storage';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'auth.token';

/**
 * 로그인은 선택. 날씨는 누구나 보고, 옷차림 추천은 로그인 + 프로필 입력 후 제공한다.
 */
interface AuthState {
  ready: boolean;
  user: Me | null;
  token: string | null;
  /** 로그인 성공 시 사용자 반환, 사용자가 창을 닫으면 null */
  signIn(provider: ProviderId): Promise<Me | null>;
  saveProfile(profile: UserProfile, opts: { consent?: boolean; name?: string }): Promise<Me>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function parseFragment(url: string): Record<string, string> {
  const hash = url.split('#')[1] ?? '';
  return Object.fromEntries(new URLSearchParams(hash));
}

export class LoginError extends Error {}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      const t = await secure.get(TOKEN_KEY);
      if (t) {
        try {
          setUser(await api.me(t));
          setToken(t);
        } catch (e) {
          // 만료·정지·탈퇴된 토큰은 지운다. 네트워크 오류면 토큰은 남겨 다음 실행에 재시도
          if (e instanceof ApiError) await secure.remove(TOKEN_KEY);
        }
      }
      setReady(true);
    })();
  }, []);

  /** 서버가 OAuth를 대행하고 weatherfit://auth#token=... 으로 돌려준다 (Expo Go에서도 동작) */
  const signIn = useCallback(async (provider: ProviderId) => {
    if (DEMO_MODE) {
      // 데모 모드: 외부 로그인 창 없이 바로 로그인 처리
      const me = await demoApi.signIn(provider);
      await secure.set(TOKEN_KEY, DEMO_TOKEN);
      setToken(DEMO_TOKEN);
      setUser(me);
      return me;
    }
    const appRedirect = Linking.createURL('auth');
    const result = await WebBrowser.openAuthSessionAsync(api.loginStartUrl(provider, appRedirect), appRedirect);
    if (result.type !== 'success') return null;
    const { token: t, error } = parseFragment(result.url);
    if (error || !t) throw new LoginError(error ?? 'login_failed');
    const me = await api.me(t);
    await secure.set(TOKEN_KEY, t);
    setToken(t);
    setUser(me);
    return me;
  }, []);

  const saveProfile = useCallback(
    async (profile: UserProfile, opts: { consent?: boolean; name?: string }) => {
      if (!token) throw new LoginError('not_signed_in');
      const me = await api.saveProfile(token, profile, opts);
      setUser(me);
      return me;
    },
    [token],
  );

  const signOut = useCallback(async () => {
    await secure.remove(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (token) await api.deleteMe(token);
    await signOut();
  }, [token, signOut]);

  const value = useMemo(
    () => ({ ready, user, token, signIn, saveProfile, signOut, deleteAccount }),
    [ready, user, token, signIn, saveProfile, signOut, deleteAccount],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
