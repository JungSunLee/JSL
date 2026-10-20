export type Provider = 'kakao' | 'naver' | 'google' | 'dev';
export type Status = 'active' | 'suspended';

export interface UserSummary {
  id: string;
  name: string;
  email: string | null;
  providers: Provider[];
  status: Status;
  onboarded: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserDetail extends UserSummary {
  avatarUrl: string | null;
  profile: {
    birthYear: number;
    sex?: 'female' | 'male';
    heightCm?: number;
    weightKg?: number;
    bodyType: 'slim' | 'average' | 'muscular' | 'heavy';
    sensitivity: -2 | -1 | 0 | 1 | 2;
    activity: 'indoor' | 'commute' | 'outdoor';
  } | null;
  profileConsentAt: string | null;
  adminMemo: string;
}

export interface Stats {
  totalUsers: number;
  newToday: number;
  new7d: number;
  active7d: number;
  suspended: number;
  onboarded: number;
  byProvider: Record<Provider, number>;
  bySensitivity: Record<string, number>;
  byBodyType: Record<string, number>;
  signupsByDay: { date: string; count: number }[];
}

const TOKEN_KEY = 'admin.token';

export const session = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

export class HttpError extends Error {
  constructor(public status: number, public code: string) {
    super(code);
  }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = session.get();
  const res = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (res.status === 401 && path !== '/v1/admin/login') {
    session.clear();
    window.dispatchEvent(new Event('admin:logout'));
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new HttpError(res.status, body.error ?? `http_${res.status}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  login: (email: string, password: string) =>
    call<{ token: string; email: string }>('/v1/admin/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  stats: () => call<Stats>('/v1/admin/stats'),
  users: (q: { q?: string; provider?: string; status?: string; page?: number }) => {
    const p = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => [k, String(v)]));
    return call<{ total: number; page: number; pageSize: number; items: UserSummary[] }>(`/v1/admin/users?${p}`);
  },
  user: (id: string) => call<UserDetail>(`/v1/admin/users/${encodeURIComponent(id)}`),
  updateUser: (id: string, patch: { status?: Status; adminMemo?: string }) =>
    call<UserDetail>(`/v1/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deleteUser: (id: string) => call<void>(`/v1/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

export const PROVIDER_LABEL: Record<Provider, string> = { kakao: '카카오', naver: '네이버', google: 'Google', dev: '테스트' };
export const SENS_LABEL: Record<string, string> = { '-2': '추위 많이', '-1': '추위 조금', '0': '보통', '1': '더위 조금', '2': '더위 많이' };
export const BODY_LABEL: Record<string, string> = { slim: '마른 편', average: '보통', muscular: '근육형', heavy: '통통한 편' };
export const ACTIVITY_LABEL: Record<string, string> = { indoor: '주로 실내', commute: '출퇴근 정도', outdoor: '야외 활동 많음' };

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
