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
  allowDevLogin: boolean;
  admin: { email?: string; password?: string };
}

const opt = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const jwtSecret = env.JWT_SECRET ?? '';
  if (env.NODE_ENV === 'production' && jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  if (env.NODE_ENV === 'production' && env.ADMIN_PASSWORD && env.ADMIN_PASSWORD.length < 12) {
    throw new Error('ADMIN_PASSWORD must be at least 12 characters in production');
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
    // 운영 환경에서는 환경변수와 무관하게 개발용 로그인을 끈다
    allowDevLogin: env.NODE_ENV !== 'production' && (env.ALLOW_DEV_LOGIN ?? 'true') === 'true',
    admin: { email: opt(env.ADMIN_EMAIL), password: opt(env.ADMIN_PASSWORD) },
  };
}
