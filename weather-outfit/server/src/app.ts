import cors from '@fastify/cors';
import fastifyStatic from '@fastify/static';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Fastify from 'fastify';
import { createProviders, type OAuthProvider, type ProviderId } from './auth/providers';
import { registerAdminRoutes } from './admin/routes';
import { EventStore } from './analytics/events';
import { registerAnalyticsRoutes } from './analytics/routes';
import { openDatabase } from './db';
import { registerAuthRoutes } from './auth/routes';
import { Tokens } from './auth/tokens';
import { UserStore } from './auth/users';
import type { Config } from './config';
import type { FetchLike } from './http';
import { createWeatherService } from './weatherService';

export interface BuildOptions {
  config: Config;
  fetch?: FetchLike;
  now?: () => Date;
  providers?: Record<ProviderId, OAuthProvider>;
  /** 기본값: config.dataDir/app.db. 테스트는 ':memory:' */
  dbFile?: string;
  logger?: boolean;
  adminDist?: string;
  webDist?: string;
}

export function buildApp(opts: BuildOptions) {
  const { config } = opts;
  const app = Fastify({ logger: opts.logger ?? false });
  app.register(cors, { origin: true, methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] });

  const weather = createWeatherService({ config, fetch: opts.fetch, now: opts.now, log: app.log });

  // 상태 확인: 배포 플랫폼의 헬스체크와 "DB가 준비됐는지" 확인에 쓴다
  app.get('/health', async (_req, reply) => {
    let dbOk = false;
    let users = 0;
    try {
      users = Number((db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n);
      dbOk = true;
    } catch {
      dbOk = false;
    }
    const body = { ok: dbOk, live: !!config.dataGoKrKey, db: { ok: dbOk, file: dbFile, users }, devLogin: config.allowDevLogin, version: process.env.APP_VERSION ?? 'dev' };
    return reply.code(dbOk ? 200 : 500).send(body);
  });

  app.get<{ Querystring: { lat?: string; lon?: string; name?: string } }>('/v1/weather', async (req, reply) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    // 대한민국 영역(기상청 격자 범위)만 허용
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 32 || lat > 39.5 || lon < 123 || lon > 132.5) {
      return reply.code(400).send({ error: 'lat/lon must be within South Korea' });
    }
    try {
      // name: 앱이 아는 지역 이름(기본 지역 등). 카카오 지역명 변환이 안 될 때 대신 표시
      const name = typeof req.query.name === 'string' ? req.query.name.trim().slice(0, 40) : undefined;
      return await weather.getWeather(lat, lon, name || undefined);
    } catch (err) {
      req.log.error({ err: String(err) }, '기상청 조회 실패 (키 오류·시간 초과 등). err 내용을 확인하세요');
      return reply.code(502).send({ error: 'upstream_unavailable' });
    }
  });

  const tokens = new Tokens(config.jwtSecret);
  const dbFile = opts.dbFile ?? resolve(config.dataDir, 'app.db');
  const db = openDatabase(dbFile);
  const users = new UserStore(db);
  const events = new EventStore(db);
  app.addHook('onClose', async () => db.close());
  registerAuthRoutes(app, { config, providers: opts.providers ?? createProviders(config, opts.fetch), tokens, users });
  registerAnalyticsRoutes(app, { tokens, events });
  registerAdminRoutes(app, { config, tokens, users, events });

  // 관리자 홈페이지 정적 파일 (admin 빌드 결과가 있을 때만)
  const adminDist = resolve(opts.adminDist ?? process.env.ADMIN_DIST ?? '../admin/dist');
  if (existsSync(adminDist)) {
    app.register(async (scope) => {
      scope.addHook('onSend', async (_req, reply) => {
        reply.header('X-Frame-Options', 'DENY');
        reply.header('X-Content-Type-Options', 'nosniff');
        reply.header('Referrer-Policy', 'no-referrer');
      });
      await scope.register(fastifyStatic, { root: adminDist, prefix: '/admin/' });
      scope.get('/admin', (_req, reply) => reply.redirect('/admin/'));
    });
  }

  // 앱 웹 버전 정적 파일 (expo export 결과가 있을 때만). / 에서 서비스하고,
  // 파일이 아닌 주소(/login, /onboarding, /auth ...)는 index.html 로 보내 앱 라우터가 처리한다.
  const webDist = resolve(opts.webDist ?? config.webDist ?? '../app/dist-web');
  if (existsSync(resolve(webDist, 'index.html'))) {
    app.register(async (scope) => {
      await scope.register(fastifyStatic, { root: webDist, prefix: '/', wildcard: false, decorateReply: false });
      scope.get('/*', async (req, reply) => {
        const url = req.url.split('?')[0];
        if (url.startsWith('/v1/') || url.startsWith('/admin') || url === '/health') return reply.code(404).send({ error: 'not_found' });
        return reply.type('text/html; charset=utf-8').send(readFileSync(resolve(webDist, 'index.html')));
      });
    });
    app.log.info(`앱 웹 버전 서비스 중: ${webDist}`);
  }

  return app;
}
