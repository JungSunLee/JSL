import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';

const icon = (emoji: string) => ({ focused }: { focused: boolean }) => (
  <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emoji}</Text>
);

export default function TabsLayout() {
  const { ready, user, isGuest } = useAuth();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!user && !isGuest) return <Redirect href="/login" />;

  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: colors.primary, headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" options={{ title: '오늘', tabBarIcon: icon('🌤️') }} />
      <Tabs.Screen name="family" options={{ title: '가족', tabBarIcon: icon('👨‍👩‍👧') }} />
      <Tabs.Screen name="settings" options={{ title: '설정', tabBarIcon: icon('⚙️') }} />
    </Tabs>
  );
}
