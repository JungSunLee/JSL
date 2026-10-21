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
  /** 앱 웹 빌드 폴더 (있으면 / 에서 앱을 서비스) */
  webDist?: string;
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
    // 앱이 로그인 후 돌아갈 수 있는 주소. 배포 주소(PUBLIC_BASE_URL)는 자동으로 허용한다 (웹 버전 로그인용)
    appRedirectAllowlist: Array.from(
      new Set(
        [...(env.APP_REDIRECT_ALLOWLIST ?? 'weatherfit://,exp://,http://localhost:8081,http://localhost:8090').split(','), env.PUBLIC_BASE_URL ?? '']
          .map((s) => s.trim())
          .filter(Boolean),
      ),
    ),
    dataGoKrKey: opt(env.DATA_GO_KR_SERVICE_KEY),
    kakao: { restKey: opt(env.KAKAO_REST_API_KEY), clientSecret: opt(env.KAKAO_CLIENT_SECRET) },
    naver: { clientId: opt(env.NAVER_CLIENT_ID), clientSecret: opt(env.NAVER_CLIENT_SECRET) },
    google: { clientId: opt(env.GOOGLE_CLIENT_ID), clientSecret: opt(env.GOOGLE_CLIENT_SECRET) },
    dataDir: env.DATA_DIR ?? 'data',
    // 개발용 테스트 로그인: 개발 환경은 기본 켜짐, 운영(production)은 기본 꺼짐.
    // 소셜 로그인 키를 넣기 전 시범 운영 단계에서만 ALLOW_DEV_LOGIN=true 로 명시해 켠다.
    allowDevLogin: env.NODE_ENV === 'production' ? env.ALLOW_DEV_LOGIN === 'true' : (env.ALLOW_DEV_LOGIN ?? 'true') === 'true',
    webDist: env.WEB_DIST,
    admin: { email: opt(env.ADMIN_EMAIL), password: opt(env.ADMIN_PASSWORD) },
  };
}
