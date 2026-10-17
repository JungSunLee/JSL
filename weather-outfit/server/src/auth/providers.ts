import { getJson, type FetchLike } from '../http';
import type { Config } from '../config';

export type ProviderId = 'naver' | 'kakao' | 'google';
export const PROVIDERS: ProviderId[] = ['naver', 'kakao', 'google'];

export interface SocialProfile {
  provider: ProviderId;
  providerUserId: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export interface OAuthProvider {
  id: ProviderId;
  enabled: boolean;
  authorizeUrl(redirectUri: string, state: string): string;
  /** 인가 코드 → 액세스 토큰 → 프로필 */
  exchange(code: string, redirectUri: string, state: string): Promise<SocialProfile>;
}

const form = (o: Record<string, string | undefined>) =>
  new URLSearchParams(Object.entries(o).filter((e): e is [string, string] => e[1] !== undefined));

export function createProviders(config: Config, f: FetchLike = fetch): Record<ProviderId, OAuthProvider> {
  const naver: OAuthProvider = {
    id: 'naver',
    enabled: !!(config.naver.clientId && config.naver.clientSecret),
    authorizeUrl: (redirectUri, state) =>
      `https://nid.naver.com/oauth2.0/authorize?${form({ response_type: 'code', client_id: config.naver.clientId, redirect_uri: redirectUri, state })}`,
    async exchange(code, _redirectUri, state) {
      const tok = await getJson<{ access_token?: string; error_description?: string }>(
        f,
        'https://nid.naver.com/oauth2.0/token',
        { method: 'POST', body: form({ grant_type: 'authorization_code', client_id: config.naver.clientId, client_secret: config.naver.clientSecret, code, state }) },
      );
      if (!tok.access_token) throw new Error(`naver token: ${tok.error_description ?? 'no token'}`);
      const me = await getJson<{ response: { id: string; name?: string; nickname?: string; email?: string; profile_image?: string } }>(
        f,
        'https://openapi.naver.com/v1/nid/me',
        { headers: { Authorization: `Bearer ${tok.access_token}` } },
      );
      return {
        provider: 'naver',
        providerUserId: me.response.id,
        name: me.response.nickname ?? me.response.name ?? '네이버 사용자',
        email: me.response.email,
        avatarUrl: me.response.profile_image,
      };
    },
  };

  const kakao: OAuthProvider = {
    id: 'kakao',
    enabled: !!config.kakao.restKey,
    authorizeUrl: (redirectUri, state) =>
      `https://kauth.kakao.com/oauth/authorize?${form({ response_type: 'code', client_id: config.kakao.restKey, redirect_uri: redirectUri, state })}`,
    async exchange(code, redirectUri) {
      const tok = await getJson<{ access_token?: string }>(f, 'https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
        body: form({ grant_type: 'authorization_code', client_id: config.kakao.restKey, client_secret: config.kakao.clientSecret, redirect_uri: redirectUri, code }),
      });
      if (!tok.access_token) throw new Error('kakao token: no token');
      const me = await getJson<{ id: number; kakao_account?: { email?: string; profile?: { nickname?: string; profile_image_url?: string } } }>(
        f,
        'https://kapi.kakao.com/v2/user/me',
        { headers: { Authorization: `Bearer ${tok.access_token}` } },
      );
      return {
        provider: 'kakao',
        providerUserId: String(me.id),
        name: me.kakao_account?.profile?.nickname ?? '카카오 사용자',
        email: me.kakao_account?.email,
        avatarUrl: me.kakao_account?.profile?.profile_image_url,
      };
    },
  };

  const google: OAuthProvider = {
    id: 'google',
    enabled: !!(config.google.clientId && config.google.clientSecret),
    authorizeUrl: (redirectUri, state) =>
      `https://accounts.google.com/o/oauth2/v2/auth?${form({ response_type: 'code', client_id: config.google.clientId, redirect_uri: redirectUri, scope: 'openid email profile', state, prompt: 'select_account' })}`,
    async exchange(code, redirectUri) {
      const tok = await getJson<{ access_token?: string }>(f, 'https://oauth2.googleapis.com/token', {
        method: 'POST',
        body: form({ grant_type: 'authorization_code', client_id: config.google.clientId, client_secret: config.google.clientSecret, redirect_uri: redirectUri, code }),
      });
      if (!tok.access_token) throw new Error('google token: no token');
      const me = await getJson<{ sub: string; name?: string; email?: string; picture?: string }>(
        f,
        'https://openidconnect.googleapis.com/v1/userinfo',
        { headers: { Authorization: `Bearer ${tok.access_token}` } },
      );
      return { provider: 'google', providerUserId: me.sub, name: me.name ?? 'Google 사용자', email: me.email, avatarUrl: me.picture };
    },
  };

  return { naver, kakao, google };
}
