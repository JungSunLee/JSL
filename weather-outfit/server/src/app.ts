import cors from '@fastify/cors';
import Fastify from 'fastify';
import { createProviders, type OAuthProvider, type ProviderId } from './auth/providers';
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
  users?: UserStore;
  logger?: boolean;
}

export function buildApp(opts: BuildOptions) {
  const { config } = opts;
  const app = Fastify({ logger: opts.logger ?? false });
  app.register(cors, { origin: true });

  const weather = createWeatherService({ config, fetch: opts.fetch, now: opts.now, log: app.log });

  app.get('/health', async () => ({ ok: true, live: !!config.dataGoKrKey }));

  app.get<{ Querystring: { lat?: string; lon?: string } }>('/v1/weather', async (req, reply) => {
    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    // 대한민국 영역(기상청 격자 범위)만 허용
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < 32 || lat > 39.5 || lon < 123 || lon > 132.5) {
      return reply.code(400).send({ error: 'lat/lon must be within South Korea' });
    }
    try {
      return await weather.getWeather(lat, lon);
    } catch (err) {
      req.log.error({ err: String(err) }, 'weather fetch failed');
      return reply.code(502).send({ error: 'upstream_unavailable' });
    }
  });

  registerAuthRoutes(app, {
    config,
    providers: opts.providers ?? createProviders(config, opts.fetch),
    tokens: new Tokens(config.jwtSecret),
    users: opts.users ?? new UserStore(config.dataDir),
  });

  return app;
}
