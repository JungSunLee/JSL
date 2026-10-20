import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '../config';
import { PROVIDERS, type OAuthProvider, type ProviderId } from './providers';
import type { Tokens } from './tokens';
import { validateProfile } from './profile';
import type { User, UserStore } from './users';

export function isAllowedAppRedirect(url: string, allowlist: string[]): boolean {
  return allowlist.some((prefix) => url.startsWith(prefix));
}

/** 토큰은 서버 로그·리퍼러에 남지 않도록 URL fragment로 전달 */
export function appendFragment(url: string, params: Record<string, string>): string {
  const base = url.split('#')[0];
  return `${base}#${new URLSearchParams(params)}`;
}

export function registerAuthRoutes(
  app: FastifyInstance,
  deps: { config: Config; providers: Record<ProviderId, OAuthProvider>; tokens: Tokens; users: UserStore },
) {
  const { config, providers, tokens, users } = deps;
  const callbackUrl = (p: ProviderId) => `${config.publicBaseUrl}/v1/auth/${p}/callback`;

  app.get('/v1/auth/providers', async () =>
    PROVIDERS.map((id) => ({ id, enabled: providers[id].enabled })),
  );

  app.get<{ Params: { provider: string }; Querystring: { app_redirect?: string } }>(
    '/v1/auth/:provider/start',
    async (req, reply) => {
      const provider = providers[req.params.provider as ProviderId];
      if (!provider) return reply.code(404).send({ error: 'unknown_provider' });
      if (!provider.enabled) return reply.code(503).send({ error: 'provider_not_configured' });
      const appRedirect = req.query.app_redirect ?? '';
      if (!isAllowedAppRedirect(appRedirect, config.appRedirectAllowlist)) {
        return reply.code(400).send({ error: 'invalid_app_redirect' });
      }
      const state = await tokens.signState(provider.id, appRedirect);
      return reply.redirect(provider.authorizeUrl(callbackUrl(provider.id), state));
    },
  );

  app.get<{ Params: { provider: string }; Querystring: { code?: string; state?: string; error?: string } }>(
    '/v1/auth/:provider/callback',
    async (req, reply) => {
      let st: { provider: ProviderId; appRedirect: string };
      try {
        st = await tokens.verifyState(req.query.state ?? '');
      } catch {
        return reply.code(400).send({ error: 'invalid_state' });
      }
      if (st.provider !== req.params.provider) return reply.code(400).send({ error: 'provider_mismatch' });
      if (req.query.error || !req.query.code) {
        return reply.redirect(appendFragment(st.appRedirect, { error: req.query.error ?? 'cancelled' }));
      }
      try {
        const profile = await providers[st.provider].exchange(req.query.code, callbackUrl(st.provider), req.query.state!);
        const user = await users.upsertFromProfile(profile);
        if (user.status === 'suspended') return reply.redirect(appendFragment(st.appRedirect, { error: 'suspended' }));
        const token = await tokens.signAccess(user.id);
        return reply.redirect(appendFragment(st.appRedirect, { token }));
      } catch (err) {
        req.log.error({ err: String(err) }, 'oauth exchange failed');
        return reply.redirect(appendFragment(st.appRedirect, { error: 'login_failed' }));
      }
    },
  );

  /** 토큰 검증 → 사용자. 정지된 계정은 403 */
  async function requireUser(req: FastifyRequest, reply: FastifyReply): Promise<User | undefined> {
    const h = req.headers.authorization ?? '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    let user: User | undefined;
    try {
      user = await users.get(await tokens.verifyAccess(token));
    } catch {
      /* invalid token */
    }
    if (!user) {
      reply.code(401).send({ error: 'unauthorized' });
      return undefined;
    }
    if (user.status === 'suspended') {
      reply.code(403).send({ error: 'suspended' });
      return undefined;
    }
    return user;
  }

  app.get('/v1/me', async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return reply;
    return toMe(user);
  });

  /** 온보딩/프로필 수정: 키·몸무게·체형·온도감 */
  app.put<{ Body: { profile?: unknown; consent?: boolean; name?: string } }>('/v1/me/profile', async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return reply;
    if (req.body?.consent !== true && !user.profileConsentAt) {
      return reply.code(400).send({ error: 'consent_required' });
    }
    const { profile, errors } = validateProfile(req.body?.profile);
    if (!profile) return reply.code(400).send({ error: 'invalid_profile', fields: errors });
    const name = typeof req.body?.name === 'string' ? req.body.name.trim().slice(0, 20) : '';
    const updated = await users.update(user.id, {
      profile,
      profileConsentAt: user.profileConsentAt ?? new Date().toISOString(),
      ...(name ? { name } : {}),
    });
    return toMe(updated!);
  });

  /** 회원 탈퇴 (앱스토어 심사 필수 항목) */
  app.delete('/v1/me', async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return reply;
    await users.delete(user.id);
    return reply.code(204).send();
  });
}

export function toMe(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    providers: user.accounts.map((a) => a.provider),
    profile: user.profile ?? null,
    needsOnboarding: !user.profile,
  };
}
