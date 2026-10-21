import { Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icons, type IconComponent } from '@/components/icons';
import { colors } from '@/lib/theme';

const icon = (Icon: IconComponent) => ({ focused, color }: { focused: boolean; color: ColorValue }) => (
  <Icon size={24} color={String(color)} weight={focused ? 'fill' : 'regular'} />
);

/** 로그인 없이도 모든 탭에 들어갈 수 있다. 옷차림 추천 영역만 로그인을 요구한다. */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', lineHeight: 14, flexShrink: 0 },
        tabBarStyle: { borderTopColor: colors.line, height: 64 + insets.bottom, paddingTop: 4, paddingBottom: 4 + insets.bottom },
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: '오늘', tabBarIcon: icon(Icons.CloudSun) }} />
      <Tabs.Screen name="family" options={{ title: '가족', tabBarIcon: icon(Icons.Users) }} />
      <Tabs.Screen name="settings" options={{ title: '메뉴', tabBarIcon: icon(Icons.List) }} />
    </Tabs>
  );
}
