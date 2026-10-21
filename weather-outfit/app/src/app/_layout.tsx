import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Splash } from '@/components/Splash';
import { analytics } from '@/lib/analytics';
import { colors } from '@/lib/theme';
import { AuthProvider, useAuth } from '@/state/AuthContext';
import { FamilyProvider } from '@/state/FamilyContext';
import { SettingsProvider } from '@/state/SettingsContext';
import { useWeather, WeatherProvider } from '@/state/useWeather';

const MIN_SPLASH_MS = 1200;

/** 로그인·날씨 준비가 끝나고 최소 1.2초가 지나면 진입 화면을 걷는다 */
function SplashGate() {
  const { ready, token } = useAuth();
  const { weather } = useWeather();
  const [minTimePassed, setMinTimePassed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), MIN_SPLASH_MS);
    analytics.event('app_open');
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    analytics.setToken(token);
  }, [token]);
  return <Splash visible={!(ready && weather && minTimePassed)} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <AuthProvider>
          <FamilyProvider>
            <WeatherProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerBackTitle: '뒤로' }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="login" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="onboarding" options={{ title: '내 정보' }} />
                <Stack.Screen name="member/edit" options={{ presentation: 'modal', title: '가족 구성원' }} />
                <Stack.Screen name="member/[id]" options={{ title: '오늘의 옷차림' }} />
                <Stack.Screen name="settings/notifications" options={{ title: '알림 설정' }} />
                <Stack.Screen name="settings/about" options={{ title: '앱 정보' }} />
              </Stack>
              <SplashGate />
            </WeatherProvider>
          </FamilyProvider>
        </AuthProvider>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
