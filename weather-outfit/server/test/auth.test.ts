import { describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { loadConfig } from '../src/config';
import type { OAuthProvider, ProviderId } from '../src/auth/providers';
import { UserStore } from '../src/auth/users';

const fake = (id: ProviderId, enabled = true): OAuthProvider => ({
  id,
  enabled,
  authorizeUrl: (redirectUri, state) => `https://idp.example/${id}?redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`,
  exchange: async (code) => {
    if (code === 'bad') throw new Error('boom');
    return { provider: id, providerUserId: `${id}-123`, name: `${id} 사용자`, email: `${id}@example.com` };
  },
});

function setup(users = new UserStore()) {
  return buildApp({
    config: loadConfig({ PUBLIC_BASE_URL: 'https://api.example', APP_REDIRECT_ALLOWLIST: 'weatherfit://' }),
    providers: { naver: fake('naver'), kakao: fake('kakao'), google: fake('google', false), dev: fake('dev', false) },
    users,
  });
}

async function login(app: ReturnType<typeof setup>, provider: ProviderId, code = 'ok') {
  const start = await app.inject(`/v1/auth/${provider}/start?app_redirect=${encodeURIComponent('weatherfit://auth')}`);
  expect(start.statusCode).toBe(302);
  const loc = new URL(start.headers.location as string);
  expect(loc.searchParams.get('redirect_uri')).toBe(`https://api.example/v1/auth/${provider}/callback`);
  const state = loc.searchParams.get('state')!;
  const cb = await app.inject(`/v1/auth/${provider}/callback?code=${code}&state=${state}`);
  expect(cb.statusCode).toBe(302);
  return cb.headers.location as string;
}

describe('social login', () => {
  it('제공자 목록과 활성 여부', async () => {
    const res = await setup().inject('/v1/auth/providers');
    expect(res.json()).toEqual([
      { id: 'kakao', enabled: true },
      { id: 'naver', enabled: true },
      { id: 'google', enabled: false },
      { id: 'dev', enabled: false },
    ]);
  });

  it('로그인 → 앱으로 토큰 전달 → /v1/me', async () => {
    const app = setup();
    const back = await login(app, 'kakao');
    expect(back.startsWith('weatherfit://auth#token=')).toBe(true);
    const token = new URLSearchParams(back.split('#')[1]).get('token');
    const me = await app.inject({ url: '/v1/me', headers: { authorization: `Bearer ${token}` } });
    expect(me.json()).toMatchObject({ name: 'kakao 사용자', providers: ['kakao'], needsOnboarding: true, profile: null });
  });

  it('같은 계정으로 다시 로그인하면 같은 사용자', async () => {
    const app = setup();
    const id = async () => {
      const token = new URLSearchParams((await login(app, 'naver')).split('#')[1]).get('token');
      return (await app.inject({ url: '/v1/me', headers: { authorization: `Bearer ${token}` } })).json().id;
    };
    expect(await id()).toBe(await id());
  });

  it('허용되지 않은 앱 주소로는 리다이렉트하지 않는다', async () => {
    const res = await setup().inject(`/v1/auth/naver/start?app_redirect=${encodeURIComponent('https://evil.example')}`);
    expect(res.statusCode).toBe(400);
  });

  it('위조된 state 거부, 미설정 제공자 503', async () => {
    const app = setup();
    expect((await app.inject('/v1/auth/naver/callback?code=x&state=forged')).statusCode).toBe(400);
    expect((await app.inject('/v1/auth/google/start?app_redirect=weatherfit://auth')).statusCode).toBe(503);
  });

  it('토큰 교환 실패 시 앱에 에러 전달', async () => {
    expect(await login(setup(), 'naver', 'bad')).toBe('weatherfit://auth#error=login_failed');
  });

  it('토큰 없이 /v1/me 는 401, 탈퇴 후에도 401', async () => {
    const app = setup();
    expect((await app.inject('/v1/me')).statusCode).toBe(401);
    const token = new URLSearchParams((await login(app, 'kakao')).split('#')[1]).get('token');
    const headers = { authorization: `Bearer ${token}` };
    expect((await app.inject({ method: 'DELETE', url: '/v1/me', headers })).statusCode).toBe(204);
    expect((await app.inject({ url: '/v1/me', headers })).statusCode).toBe(401);
  });
});

const tokenOf = (back: string) => new URLSearchParams(back.split('#')[1]).get('token')!;
const profile = { birthYear: 1990, sex: 'female', heightCm: 162, weightKg: 50, bodyType: 'slim', sensitivity: -1, activity: 'commute' };

describe('profile onboarding', () => {
  it('동의 없이는 저장 불가, 동의하면 저장되고 온보딩 완료', async () => {
    const app = setup();
    const headers = { authorization: `Bearer ${tokenOf(await login(app, 'kakao'))}` };
    const noConsent = await app.inject({ method: 'PUT', url: '/v1/me/profile', headers, payload: { profile } });
    expect(noConsent.json().error).toBe('consent_required');
    const ok = await app.inject({ method: 'PUT', url: '/v1/me/profile', headers, payload: { profile, consent: true, name: '지은' } });
    expect(ok.statusCode).toBe(200);
    expect(ok.json()).toMatchObject({ name: '지은', needsOnboarding: false, profile: { heightCm: 162, bodyType: 'slim' } });
    // 이후 수정은 동의 재확인 불필요
    const again = await app.inject({ method: 'PUT', url: '/v1/me/profile', headers, payload: { profile: { ...profile, sensitivity: 2 } } });
    expect(again.json().profile.sensitivity).toBe(2);
  });

  it('잘못된 값은 필드별 오류', async () => {
    const app = setup();
    const headers = { authorization: `Bearer ${tokenOf(await login(app, 'kakao'))}` };
    const res = await app.inject({ method: 'PUT', url: '/v1/me/profile', headers, payload: { consent: true, profile: { ...profile, heightCm: 500, bodyType: 'x' } } });
    expect(res.statusCode).toBe(400);
    expect(Object.keys(res.json().fields).sort()).toEqual(['bodyType', 'heightCm']);
  });
});

describe('admin', () => {
  function adminApp(users = new UserStore()) {
    return buildApp({
      config: loadConfig({ PUBLIC_BASE_URL: 'https://api.example', APP_REDIRECT_ALLOWLIST: 'weatherfit://', ADMIN_EMAIL: 'admin@example.com', ADMIN_PASSWORD: 'secret-password' }),
      providers: { naver: fake('naver'), kakao: fake('kakao'), google: fake('google'), dev: fake('dev') },
      users,
    });
  }
  async function adminToken(app: ReturnType<typeof adminApp>) {
    const res = await app.inject({ method: 'POST', url: '/v1/admin/login', payload: { email: 'Admin@example.com', password: 'secret-password' } });
    expect(res.statusCode).toBe(200);
    return { authorization: `Bearer ${res.json().token}` };
  }

  it('잘못된 비밀번호 401, 5회 실패하면 429', async () => {
    const app = adminApp();
    for (let i = 0; i < 5; i++) {
      const r = await app.inject({ method: 'POST', url: '/v1/admin/login', payload: { email: 'admin@example.com', password: 'nope' } });
      expect(r.statusCode).toBe(401);
    }
    const r = await app.inject({ method: 'POST', url: '/v1/admin/login', payload: { email: 'admin@example.com', password: 'secret-password' } });
    expect(r.statusCode).toBe(429);
  });

  it('관리자 토큰 없이는 접근 불가, 사용자 토큰으로도 불가', async () => {
    const app = adminApp();
    expect((await app.inject('/v1/admin/stats')).statusCode).toBe(401);
    const userToken = tokenOf(await login(app, 'kakao'));
    expect((await app.inject({ url: '/v1/admin/stats', headers: { authorization: `Bearer ${userToken}` } })).statusCode).toBe(401);
  });

  it('통계·목록·검색·상세', async () => {
    const app = adminApp();
    const headers = await adminToken(app);
    const t = tokenOf(await login(app, 'kakao'));
    await login(app, 'naver');
    await app.inject({ method: 'PUT', url: '/v1/me/profile', headers: { authorization: `Bearer ${t}` }, payload: { profile, consent: true } });

    const stats = (await app.inject({ url: '/v1/admin/stats', headers })).json();
    expect(stats).toMatchObject({ totalUsers: 2, newToday: 2, onboarded: 1, byProvider: { kakao: 1, naver: 1 }, bySensitivity: { '-1': 1 }, byBodyType: { slim: 1 } });
    expect(stats.signupsByDay).toHaveLength(14);

    const list = (await app.inject({ url: '/v1/admin/users?provider=kakao', headers })).json();
    expect(list.total).toBe(1);
    expect(list.items[0]).toMatchObject({ name: 'kakao 사용자', onboarded: true });
    expect((await app.inject({ url: '/v1/admin/users?q=naver@', headers })).json().total).toBe(1);

    const d = (await app.inject({ url: `/v1/admin/users/${list.items[0].id}`, headers })).json();
    expect(d.profile).toMatchObject({ heightCm: 162 });
  });

  it('정지하면 앱 API 403·재로그인 차단, 해제하면 복구, 삭제', async () => {
    const app = adminApp();
    const headers = await adminToken(app);
    const t = tokenOf(await login(app, 'kakao'));
    const me = { authorization: `Bearer ${t}` };
    const id = (await app.inject({ url: '/v1/me', headers: me })).json().id;

    const patched = await app.inject({ method: 'PATCH', url: `/v1/admin/users/${id}`, headers, payload: { status: 'suspended', adminMemo: '스팸 신고' } });
    expect(patched.json()).toMatchObject({ status: 'suspended', adminMemo: '스팸 신고' });
    expect((await app.inject({ url: '/v1/me', headers: me })).statusCode).toBe(403);
    expect(await login(app, 'kakao')).toBe('weatherfit://auth#error=suspended');

    await app.inject({ method: 'PATCH', url: `/v1/admin/users/${id}`, headers, payload: { status: 'active' } });
    expect((await app.inject({ url: '/v1/me', headers: me })).statusCode).toBe(200);

    expect((await app.inject({ method: 'PATCH', url: `/v1/admin/users/${id}`, headers, payload: { status: 'bogus' } })).statusCode).toBe(400);
    expect((await app.inject({ method: 'DELETE', url: `/v1/admin/users/${id}`, headers })).statusCode).toBe(204);
    expect((await app.inject({ url: '/v1/me', headers: me })).statusCode).toBe(401);
  });
});

describe('CORS', () => {
  it('웹에서 프로필 저장(PUT)·탈퇴(DELETE) 사전요청 허용', async () => {
    const res = await setup().inject({
      method: 'OPTIONS',
      url: '/v1/me/profile',
      headers: { origin: 'http://localhost:8081', 'access-control-request-method': 'PUT' },
    });
    expect(res.headers['access-control-allow-methods']).toContain('PUT');
    expect(res.headers['access-control-allow-methods']).toContain('DELETE');
  });
});
