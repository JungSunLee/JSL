import type { WeatherSnapshot } from '@wo/core';
import { API_BASE_URL } from './config';

export type ProviderId = 'naver' | 'kakao' | 'google';

export interface Me {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  providers: ProviderId[];
}

async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  weather: (lat: number, lon: number) => request<WeatherSnapshot>(`/v1/weather?lat=${lat}&lon=${lon}`),
  providers: () => request<{ id: ProviderId; enabled: boolean }[]>('/v1/auth/providers'),
  me: (token: string) => request<Me>('/v1/me', { token }),
  deleteMe: (token: string) => request<void>('/v1/me', { method: 'DELETE', token }),
  loginStartUrl: (provider: ProviderId, appRedirect: string) =>
    `${API_BASE_URL}/v1/auth/${provider}/start?app_redirect=${encodeURIComponent(appRedirect)}`,
};
