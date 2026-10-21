import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';
import { analytics } from '@/lib/analytics';
import { Button, Card } from './ui';

/** 옷차림 추천 영역의 로그인/프로필 입력 안내 카드. 준비되면 null */
export function OutfitGate({ what = '나에게 맞는 오늘의 옷차림' }: { what?: string }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <Card>
        <Text style={s.title}>👕 {what}를 받아보세요</Text>
        <Text style={s.body}>
          로그인하고 키·몸무게·체형, 추위·더위를 타는 정도를 알려주시면{'\n'}오늘 날씨에 딱 맞는 옷차림을 추천해 드려요.
        </Text>
        <Button title="로그인하고 옷차림 추천 받기" onPress={() => (analytics.tap('today', 'login_gate'), router.push('/login'))} />
      </Card>
    );
  }
  if (user.needsOnboarding) {
    return (
      <Card>
        <Text style={s.title}>내 정보를 입력하면 옷차림 추천이 시작돼요</Text>
        <Text style={s.body}>1분이면 충분해요. 키·몸무게·체형과 온도감을 알려주세요.</Text>
        <Button title="내 정보 입력하기" onPress={() => (analytics.tap('today', 'onboarding_gate'), router.push('/onboarding'))} />
      </Card>
    );
  }
  return null;
}

const s = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.sub, marginVertical: 10, lineHeight: 21 },
});
