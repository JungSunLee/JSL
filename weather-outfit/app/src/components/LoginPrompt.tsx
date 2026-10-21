import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { Icons } from './icons';
import { Button, Card } from './ui';
import { analytics } from '@/lib/analytics';
import { colors } from '@/lib/theme';
import { useTone } from '@/lib/tone';
import { useAuth } from '@/state/AuthContext';

/**
 * 일반 기준 옷차림 아래에 붙는 "나에게 딱 맞는 추천" 버튼.
 * 로그인 전에는 로그인으로, 로그인 후 프로필이 없으면 내 정보 입력으로 보낸다. 준비되면 null.
 */
export function OutfitGate({ what = '나에게 딱 맞는 옷차림' }: { what?: string }) {
  const { user } = useAuth();
  const t = useTone();
  if (user && !user.needsOnboarding) return null;
  const needsLogin = !user;
  return (
    <Card style={[s.cta, { backgroundColor: t.dark ? t.cardStrong : '#EEF3FF' }]}>
      <View style={s.titleRow}>
        <Icons.Sparkle size={18} color={t.dark ? '#FFE07A' : colors.primary} weight="fill" />
        <Text style={[s.title, { color: t.text }]}>{what} 추천받기</Text>
      </View>
      <Text style={[s.body, { color: t.sub }]}>
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
  cta: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 17, fontWeight: '700' },
  body: { fontSize: 14, marginVertical: 10, lineHeight: 21 },
});
