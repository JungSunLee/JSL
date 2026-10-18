import { router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import { colors } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';
import { Button, Card } from './ui';

/** 코디 추천 영역의 로그인/프로필 입력 안내 카드. 준비되면 null */
export function OutfitGate({ what = '나에게 맞는 오늘의 코디' }: { what?: string }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <Card>
        <Text style={s.title}>👕 {what}를 받아보세요</Text>
        <Text style={s.body}>
          로그인하고 키·몸무게·체형, 추위·더위를 타는 정도를 알려주시면{'\n'}오늘 날씨에 딱 맞는 옷차림을 추천해 드려요.
        </Text>
        <Button title="로그인하고 코디 받기" onPress={() => router.push('/login')} />
      </Card>
    );
  }
  if (user.needsOnboarding) {
    return (
      <Card>
        <Text style={s.title}>내 정보를 입력하면 코디가 시작돼요</Text>
        <Text style={s.body}>1분이면 충분해요. 키·몸무게·체형과 온도감을 알려주세요.</Text>
        <Button title="내 정보 입력하기" onPress={() => router.push('/onboarding')} />
      </Card>
    );
  }
  return null;
}

const s = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.sub, marginVertical: 10, lineHeight: 21 },
});
