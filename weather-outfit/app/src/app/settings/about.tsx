import Constants from 'expo-constants';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { API_BASE_URL } from '@/lib/config';
import { APP_NAME, APP_VERSION } from '@/lib/brand';
import { DEMO_MODE } from '@/lib/demo';
import { colors, radius } from '@/lib/theme';
import { useScreenView } from '@/lib/useScreenView';

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View style={s.line}>
      <Text style={s.k}>{k}</Text>
      <Text style={s.v} selectable>{v}</Text>
    </View>
  );
}

export default function About() {
  useScreenView('about');
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.hero}>
        <Text style={s.logo}>🌤️👕</Text>
        <Text style={s.name}>{APP_NAME}</Text>
        <Text style={s.tag}>오늘 날씨에 딱 맞는 우리 가족 옷차림</Text>
      </View>
      <View style={s.card}>
        <Line k="버전" v={`${APP_VERSION}${DEMO_MODE ? ' (데모)' : ''}`} />
        <Line k="플랫폼" v={`${Platform.OS} ${Platform.Version ?? ''}`.trim()} />
        <Line k="Expo SDK" v={Constants.expoConfig?.sdkVersion ?? '-'} />
        <Line k="서버" v={DEMO_MODE ? '없음 (데모)' : API_BASE_URL} />
      </View>
      <View style={s.card}>
        <Text style={s.h}>데이터 출처</Text>
        <Text style={s.p}>기상청 단기예보 조회서비스 · 기상청 생활기상지수(자외선) · 한국환경공단 에어코리아 대기오염정보</Text>
        <Text style={s.p}>공공누리 제1유형(출처표시)에 따라 이용합니다.</Text>
      </View>
      <View style={s.card}>
        <Text style={s.h}>추천 기준</Text>
        <Text style={s.p}>기상청 체감온도 산출식을 바탕으로 나이·체형·추위/더위 민감도·건강 상태·활동량을 반영해 사람마다 다른 개인 체감온도를 계산하고, 그에 맞는 옷 두께와 챙길 것을 제안합니다. 의학적 조언이 아니며 참고용입니다.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  hero: { alignItems: 'center', paddingVertical: 20 },
  logo: { fontSize: 48 },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, marginTop: 8 },
  tag: { fontSize: 13, color: colors.sub, marginTop: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginBottom: 12 },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line, gap: 12 },
  k: { color: colors.sub, fontSize: 14 },
  v: { color: colors.text, fontSize: 14, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  h: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 6 },
  p: { fontSize: 13, color: colors.sub, lineHeight: 20, marginTop: 4 },
});
