import Constants from 'expo-constants';

/** 우선순위: EXPO_PUBLIC_API_URL 환경변수 > app.json extra.apiBaseUrl. "/" 이면 웹에서 같은 주소(상대 경로)를 쓴다 */
const raw: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  'http://localhost:4000';
export const API_BASE_URL: string = raw === '/' ? '' : raw.replace(/\/$/, '');
