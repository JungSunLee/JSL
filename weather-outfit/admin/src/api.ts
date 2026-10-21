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
  usage: {
    dau: number;
    wau: number;
    mau: number;
    totalEvents: number;
    dauByDay: { date: string; count: number }[];
    topTaps: { screen: string; target: string; count: number }[];
    topScreens: { screen: string; count: number }[];
  };
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

/** 로그에 쓰이는 화면·버튼 이름을 사람이 읽기 쉽게 */
export const SCREEN_LABEL: Record<string, string> = {
  today: '오늘', login: '로그인', onboarding: '내 정보 입력', member_detail: '옷차림 상세', family: '가족', menu: '메뉴',
  notifications: '알림 설정', about: '앱 정보',
};
export const TARGET_LABEL: Record<string, string> = {
  login_gate: '로그인하고 추천 받기', onboarding_gate: '내 정보 입력하기', outfit_card: '옷차림 카드', edit_member: '정보 수정',
  add_family: '+ 가족', add_family_card: '가족 구성원 추가(카드)', refresh: '당겨서 새로고침', shop_button: '쇼핑 버튼',
  provider_kakao: '카카오 로그인', provider_naver: '네이버 로그인', provider_google: '구글 로그인', provider_dev: '테스트 로그인',
  family: '가족 정보 관리', notifications: '알림 설정', widget: '홈 화면 위젯', shop: '날씨 맞춤 쇼핑', promo_opt_in: '혜택 소식 켬',
  promo_opt_out: '혜택 소식 끔', location_on: '현재 위치 켬', location_off: '현재 위치 끔', my_profile: '내 프로필', about: '앱 정보',
  logout: '로그아웃', notice: '공지사항', contact: '문의하기', privacy: '개인정보처리방침', terms: '이용약관',
};
export const label = (map: Record<string, string>, key: string) => map[key] ?? key;
