import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '@/lib/theme';
import { AuthProvider } from '@/state/AuthContext';
import { FamilyProvider } from '@/state/FamilyContext';
import { WeatherProvider } from '@/state/useWeather';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <FamilyProvider>
          <WeatherProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ contentStyle: { backgroundColor: colors.bg }, headerTintColor: colors.text, headerBackTitle: '뒤로' }}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="member/edit" options={{ presentation: 'modal', title: '가족 구성원' }} />
            <Stack.Screen name="member/[id]" options={{ title: '오늘의 코디' }} />
          </Stack>
          </WeatherProvider>
        </FamilyProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
