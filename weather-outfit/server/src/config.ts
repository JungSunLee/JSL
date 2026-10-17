export interface Config {
  port: number;
  publicBaseUrl: string;
  jwtSecret: string;
  appRedirectAllowlist: string[];
  dataGoKrKey?: string;
  kakao: { restKey?: string; clientSecret?: string };
  naver: { clientId?: string; clientSecret?: string };
  google: { clientId?: string; clientSecret?: string };
  dataDir: string;
}

const opt = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET ?? '';
  if (env.NODE_ENV === 'production' && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  return {
    port: Number(env.PORT ?? 4000),
    publicBaseUrl: (env.PUBLIC_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, ''),
    jwtSecret: jwtSecret || 'dev-only-insecure-secret-change-me-please!!',
    appRedirectAllowlist: (env.APP_REDIRECT_ALLOWLIST ?? 'weatherfit://,exp://,http://localhost:8081')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    dataGoKrKey: opt(env.DATA_GO_KR_SERVICE_KEY),
    kakao: { restKey: opt(env.KAKAO_REST_API_KEY), clientSecret: opt(env.KAKAO_CLIENT_SECRET) },
    naver: { clientId: opt(env.NAVER_CLIENT_ID), clientSecret: opt(env.NAVER_CLIENT_SECRET) },
    google: { clientId: opt(env.GOOGLE_CLIENT_ID), clientSecret: opt(env.GOOGLE_CLIENT_SECRET) },
    dataDir: env.DATA_DIR ?? 'data',
  };
}
