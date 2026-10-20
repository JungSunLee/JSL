import type { UserProfile, WeatherSnapshot } from '@wo/core';
import { API_BASE_URL } from './config';

export type ProviderId = 'naver' | 'kakao' | 'google' | 'dev';

export interface Me {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  providers: ProviderId[];
  profile: UserProfile | null;
  needsOnboarding: boolean;
}

/** 서버 오류 코드(error 필드)를 담은 예외 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public fields?: Record<string, string>,
  ) {
    super(code);
  }
}

async function request<T>(path: string, init?: RequestInit & { token?: string; json?: unknown }): Promise<T> {
  const headers: Record<string, string> = {};
  if (init?.token) headers.Authorization = `Bearer ${init.token}`;
  let body = init?.body;
  if (init?.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(init.json);
  }
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, body });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string> };
    throw new ApiError(res.status, err.error ?? `http_${res.status}`, err.fields);
  }
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

export const api = {
  weather: (lat: number, lon: number) => request<WeatherSnapshot>(`/v1/weather?lat=${lat}&lon=${lon}`),
  providers: () => request<{ id: ProviderId; enabled: boolean }[]>('/v1/auth/providers'),
  me: (token: string) => request<Me>('/v1/me', { token }),
  saveProfile: (token: string, profile: UserProfile, opts: { consent?: boolean; name?: string }) =>
    request<Me>('/v1/me/profile', { method: 'PUT', token, json: { profile, ...opts } }),
  deleteMe: (token: string) => request<void>('/v1/me', { method: 'DELETE', token }),
  loginStartUrl: (provider: ProviderId, appRedirect: string) =>
    `${API_BASE_URL}/v1/auth/${provider}/start?app_redirect=${encodeURIComponent(appRedirect)}`,
};
