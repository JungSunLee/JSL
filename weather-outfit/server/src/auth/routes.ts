import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { Config } from '../config';
import { PROVIDERS, type OAuthProvider, type ProviderId } from './providers';
import type { Tokens } from './tokens';
import type { UserStore } from './users';

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
        const token = await tokens.signAccess(user.id);
        return reply.redirect(appendFragment(st.appRedirect, { token }));
      } catch (err) {
        req.log.error({ err: String(err) }, 'oauth exchange failed');
        return reply.redirect(appendFragment(st.appRedirect, { error: 'login_failed' }));
      }
    },
  );

  async function requireUser(req: FastifyRequest) {
    const h = req.headers.authorization ?? '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : '';
    try {
      const id = await tokens.verifyAccess(token);
      return await users.get(id);
    } catch {
      return undefined;
    }
  }

  app.get('/v1/me', async (req, reply) => {
    const user = await requireUser(req);
    if (!user) return reply.code(401).send({ error: 'unauthorized' });
    return { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatarUrl, providers: user.accounts.map((a) => a.provider) };
  });

  /** 회원 탈퇴 (앱스토어 심사 필수 항목) */
  app.delete('/v1/me', async (req, reply) => {
    const user = await requireUser(req);
    if (!user) return reply.code(401).send({ error: 'unauthorized' });
    await users.delete(user.id);
    return reply.code(204).send();
  });
}
