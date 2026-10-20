import Constants from 'expo-constants';

/** 우선순위: EXPO_PUBLIC_API_URL 환경변수 > app.json extra.apiBaseUrl */
export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ??
  'http://localhost:4000';
