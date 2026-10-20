import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '../config';
import { PROVIDERS, type ProviderId } from '../auth/providers';
import type { Tokens } from '../auth/tokens';
import type { User, UserStatus, UserStore } from '../auth/users';
import { LoginLimiter, safeEqual } from './password';

const DAY = 24 * 3600_000;

/** 관리자 화면용 사용자 요약 (목록) */
function summary(u: User) {
  return {
    id: u.id,
    name: u.name,
    email: u.email ?? null,
    providers: u.accounts.map((a) => a.provider),
    status: u.status,
    onboarded: !!u.profile,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}

function detail(u: User) {
  return { ...summary(u), avatarUrl: u.avatarUrl ?? null, profile: u.profile ?? null, profileConsentAt: u.profileConsentAt ?? null, adminMemo: u.adminMemo ?? '' };
}

export function computeStats(users: User[], now = new Date()) {
  const t = now.getTime();
  const kstDay = (iso: string) => new Date(new Date(iso).getTime() + 9 * 3600_000).toISOString().slice(0, 10);
  const today = kstDay(now.toISOString());
  const count = <K extends string>(keys: readonly K[], pick: (u: User) => K[] | K | undefined) => {
    const out = Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
    for (const u of users) {
      const v = pick(u);
      for (const k of Array.isArray(v) ? v : v !== undefined ? [v] : []) out[k] += 1;
    }
    return out;
  };
  const days: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = kstDay(new Date(t - i * DAY).toISOString());
    days.push({ date: d, count: users.filter((u) => kstDay(u.createdAt) === d).length });
  }
  const onboarded = users.filter((u) => u.profile);
  return {
    totalUsers: users.length,
    newToday: users.filter((u) => kstDay(u.createdAt) === today).length,
    new7d: users.filter((u) => t - new Date(u.createdAt).getTime() < 7 * DAY).length,
    active7d: users.filter((u) => t - new Date(u.lastLoginAt).getTime() < 7 * DAY).length,
    suspended: users.filter((u) => u.status === 'suspended').length,
    onboarded: onboarded.length,
    byProvider: count(PROVIDERS, (u) => u.accounts.map((a) => a.provider)),
    bySensitivity: count(['-2', '-1', '0', '1', '2'] as const, (u) =>
      u.profile ? (String(u.profile.sensitivity) as '-2' | '-1' | '0' | '1' | '2') : undefined),
    byBodyType: count(['slim', 'average', 'muscular', 'heavy'] as const, (u) => u.profile?.bodyType),
    signupsByDay: days,
  };
}

export function registerAdminRoutes(app: FastifyInstance, deps: { config: Config; tokens: Tokens; users: UserStore }) {
  const { config, tokens, users } = deps;
  const limiter = new LoginLimiter();

  app.post<{ Body: { email?: string; password?: string } }>('/v1/admin/login', async (req, reply) => {
    if (!config.admin.email || !config.admin.password) return reply.code(503).send({ error: 'admin_not_configured' });
    if (limiter.blocked(req.ip)) return reply.code(429).send({ error: 'too_many_attempts' });
    const email = String(req.body?.email ?? '').trim().toLowerCase();
    const password = String(req.body?.password ?? '');
    const ok = safeEqual(email, config.admin.email.toLowerCase()) && safeEqual(password, config.admin.password);
    if (!ok) {
      limiter.fail(req.ip);
      return reply.code(401).send({ error: 'invalid_credentials' });
    }
    limiter.reset(req.ip);
    return { token: await tokens.signAdmin(email), email };
  });

  async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
    const h = req.headers.authorization ?? '';
    try {
      await tokens.verifyAdmin(h.startsWith('Bearer ') ? h.slice(7) : '');
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
  }

  app.register(async (admin) => {
    admin.addHook('preHandler', requireAdmin);

    admin.get('/v1/admin/stats', async () => computeStats(await users.all()));

    admin.get<{ Querystring: { q?: string; provider?: string; status?: string; page?: string; pageSize?: string } }>(
      '/v1/admin/users',
      async (req) => {
        const r = await users.list({
          q: req.query.q,
          provider: PROVIDERS.includes(req.query.provider as ProviderId) ? (req.query.provider as ProviderId) : undefined,
          status: req.query.status === 'active' || req.query.status === 'suspended' ? req.query.status : undefined,
          page: Number(req.query.page) || 1,
          pageSize: Number(req.query.pageSize) || 20,
        });
        return { ...r, items: r.items.map(summary) };
      },
    );

    admin.get<{ Params: { id: string } }>('/v1/admin/users/:id', async (req, reply) => {
      const u = await users.get(req.params.id);
      return u ? detail(u) : reply.code(404).send({ error: 'not_found' });
    });

    admin.patch<{ Params: { id: string }; Body: { status?: UserStatus; adminMemo?: string } }>(
      '/v1/admin/users/:id',
      async (req, reply) => {
        const patch: { status?: UserStatus; adminMemo?: string } = {};
        if (req.body?.status !== undefined) {
          if (req.body.status !== 'active' && req.body.status !== 'suspended') return reply.code(400).send({ error: 'invalid_status' });
          patch.status = req.body.status;
        }
        if (req.body?.adminMemo !== undefined) patch.adminMemo = String(req.body.adminMemo).slice(0, 1000);
        const u = await users.update(req.params.id, patch);
        if (!u) return reply.code(404).send({ error: 'not_found' });
        req.log.info({ admin: true, userId: u.id, patch: Object.keys(patch) }, 'admin updated user');
        return detail(u);
      },
    );

    admin.delete<{ Params: { id: string } }>('/v1/admin/users/:id', async (req, reply) => {
      const ok = await users.delete(req.params.id);
      if (!ok) return reply.code(404).send({ error: 'not_found' });
      req.log.info({ admin: true, userId: req.params.id }, 'admin deleted user');
      return reply.code(204).send();
    });
  });
}
