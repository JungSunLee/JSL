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

function setup() {
  return buildApp({
    config: loadConfig({ PUBLIC_BASE_URL: 'https://api.example', APP_REDIRECT_ALLOWLIST: 'weatherfit://' }),
    providers: { naver: fake('naver'), kakao: fake('kakao'), google: fake('google', false) },
    users: new UserStore(),
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
      { id: 'naver', enabled: true },
      { id: 'kakao', enabled: true },
      { id: 'google', enabled: false },
    ]);
  });

  it('로그인 → 앱으로 토큰 전달 → /v1/me', async () => {
    const app = setup();
    const back = await login(app, 'kakao');
    expect(back.startsWith('weatherfit://auth#token=')).toBe(true);
    const token = new URLSearchParams(back.split('#')[1]).get('token');
    const me = await app.inject({ url: '/v1/me', headers: { authorization: `Bearer ${token}` } });
    expect(me.json()).toMatchObject({ name: 'kakao 사용자', providers: ['kakao'] });
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
