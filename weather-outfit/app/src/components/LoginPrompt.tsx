import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';
import { analytics } from '@/lib/analytics';
import { Button, Card } from './ui';

/**
 * 일반 기준 옷차림 아래에 붙는 "나에게 딱 맞는 추천" 버튼.
 * 로그인 전에는 로그인으로, 로그인 후 프로필이 없으면 내 정보 입력으로 보낸다. 준비되면 null.
 */
export function OutfitGate({ what = '나에게 딱 맞는 옷차림' }: { what?: string }) {
  const { user } = useAuth();
  if (user && !user.needsOnboarding) return null;
  const needsLogin = !user;
  return (
    <Card style={s.cta}>
      <Text style={s.title}>✨ {what} 추천받기</Text>
      <Text style={s.body}>
        위 추천은 성인 평균 기준이에요. 키·체형, 추위·더위를 타는 정도, 가족 구성원까지 반영하면 훨씬 정확해져요.
        {needsLogin ? ' (로그인 필요)' : ''}
      </Text>
      <Button
        title={needsLogin ? '나에게 딱 맞는 옷차림 추천받기' : '내 정보 입력하고 추천받기'}
        onPress={() => {
          analytics.tap('today', needsLogin ? 'login_gate' : 'onboarding_gate');
          router.push(needsLogin ? '/login' : '/onboarding');
        }}
      />
    </Card>
  );
}

const s = StyleSheet.create({
  cta: { backgroundColor: '#EEF3FF', marginBottom: 12 },
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.sub, marginVertical: 10, lineHeight: 21 },
});
