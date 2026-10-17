import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, type Me, type ProviderId } from '@/lib/api';
import { getJson, secure, setJson } from '@/lib/storage';

WebBrowser.maybeCompleteAuthSession();

const TOKEN_KEY = 'auth.token';
const GUEST_KEY = 'auth.guest';

interface AuthState {
  ready: boolean;
  user: Me | null;
  token: string | null;
  isGuest: boolean;
  signIn(provider: ProviderId): Promise<void>;
  continueAsGuest(): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(): Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function parseFragment(url: string): Record<string, string> {
  const hash = url.split('#')[1] ?? '';
  return Object.fromEntries(new URLSearchParams(hash));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Me | null>(null);
  const [isGuest, setGuest] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, g] = await Promise.all([secure.get(TOKEN_KEY), getJson(GUEST_KEY, false)]);
      setGuest(g);
      if (t) {
        try {
          setUser(await api.me(t));
          setToken(t);
        } catch {
          // 만료·서버 미연결: 다시 로그인하도록
          await secure.remove(TOKEN_KEY);
        }
      }
      setReady(true);
    })();
  }, []);

  /** 서버가 OAuth를 대행하고 weatherfit://auth#token=... 으로 돌려준다 (Expo Go에서도 동작) */
  const signIn = useCallback(async (provider: ProviderId) => {
    const appRedirect = Linking.createURL('auth');
    const result = await WebBrowser.openAuthSessionAsync(api.loginStartUrl(provider, appRedirect), appRedirect);
    if (result.type !== 'success') return;
    const { token: t, error } = parseFragment(result.url);
    if (error || !t) throw new Error(error ?? 'login_failed');
    const me = await api.me(t);
    await secure.set(TOKEN_KEY, t);
    await setJson(GUEST_KEY, false);
    setToken(t);
    setUser(me);
    setGuest(false);
  }, []);

  const continueAsGuest = useCallback(async () => {
    await setJson(GUEST_KEY, true);
    setGuest(true);
  }, []);

  const signOut = useCallback(async () => {
    await secure.remove(TOKEN_KEY);
    await setJson(GUEST_KEY, false);
    setToken(null);
    setUser(null);
    setGuest(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    if (token) await api.deleteMe(token);
    await signOut();
  }, [token, signOut]);

  const value = useMemo(
    () => ({ ready, user, token, isGuest, signIn, continueAsGuest, signOut, deleteAccount }),
    [ready, user, token, isGuest, signIn, continueAsGuest, signOut, deleteAccount],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
