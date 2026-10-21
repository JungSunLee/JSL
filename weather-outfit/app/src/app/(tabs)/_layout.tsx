import { Tabs } from 'expo-router/tabs';
import { Text } from 'react-native';
import { colors } from '@/lib/theme';

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
);

/** 로그인 없이도 모든 탭에 들어갈 수 있다. 옷차림 추천 영역만 로그인을 요구한다. */
export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" options={{ title: '오늘', tabBarIcon: icon('🌤️') }} />
      <Tabs.Screen name="family" options={{ title: '가족', tabBarIcon: icon('👨‍👩‍👧') }} />
      <Tabs.Screen name="settings" options={{ title: '메뉴', tabBarIcon: icon('☰') }} />
    </Tabs>
  );
}
