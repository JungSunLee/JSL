import type { FastifyInstance } from 'fastify';
import type { Tokens } from '../auth/tokens';
import type { EventBatch, EventStore } from './events';

/**
 * 앱 사용 로그 수집. 로그인하지 않아도 보낼 수 있고(익명 기기 ID),
 * 토큰이 있으면 사용자 ID를 함께 기록한다. 실패해도 앱 동작에는 영향이 없어야 하므로 항상 204.
 */
export function registerAnalyticsRoutes(app: FastifyInstance, deps: { tokens: Tokens; events: EventStore }) {
  app.post<{ Body: EventBatch }>('/v1/events', { config: { rateLimit: false } }, async (req, reply) => {
    let userId: string | null = null;
    const h = req.headers.authorization ?? '';
    if (h.startsWith('Bearer ')) {
      try {
        userId = await deps.tokens.verifyAccess(h.slice(7));
      } catch {
        /* 만료된 토큰이어도 익명으로 기록 */
      }
    }
    try {
      deps.events.insertBatch(req.body ?? ({} as EventBatch), userId);
    } catch (err) {
      req.log.warn({ err: String(err) }, '사용 로그 저장 실패');
    }
    return reply.code(204).send();
  });
}
