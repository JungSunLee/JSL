import { recommendOutfit, RELATION_LABEL } from '@wo/core';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ThicknessMeter } from '@/components/OutfitCard';
import { OutfitItems } from '@/components/OutfitItems';
import { Button, Card, SectionTitle } from '@/components/ui';
import { colors } from '@/lib/theme';
import { useOutfitMembers } from '@/state/useOutfitMembers';
import { useWeather } from '@/state/useWeather';
import { analytics } from '@/lib/analytics';
import { useScreenView } from '@/lib/useScreenView';

const LEVEL_BG = { info: '#EEF3FF', caution: '#FFF4E0', warning: '#FDECEF' } as const;

export default function MemberDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  useScreenView('member_detail');
  const members = useOutfitMembers();
  const { weather } = useWeather();
  const member = members.find((m) => m.id === id);
  if (!member || !weather) return null;
  const rec = recommendOutfit(weather, member);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <Stack.Screen options={{ title: `${member.name}의 오늘 옷차림` }} />
      <Card>
        <View style={s.header}>
          <Text style={s.avatar}>{member.emoji ?? '🙂'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{member.name} <Text style={s.rel}>{RELATION_LABEL[member.relation]}</Text></Text>
            <Text style={s.headline}>{rec.headline}</Text>
          </View>
        </View>
        <Text style={s.feels}>
          개인 체감온도 <Text style={{ color: colors.primary }}>{rec.personalFeelsLike}°</Text>
        </Text>
        <ThicknessMeter level={rec.thickness} />
        <View style={{ height: 10 }} />
        <Button
          title="✏️ 정보 수정 (온도감·체형·건강)"
          variant="ghost"
          onPress={() => {
            analytics.tap('member_detail', 'edit_member');
            router.push(member.relation === 'me' ? '/onboarding' : { pathname: '/member/edit', params: { id: member.id } });
          }}
        />
      </Card>

      {rec.alerts.length ? <SectionTitle>오늘 주의할 점</SectionTitle> : null}
      {rec.alerts.map((a) => (
        <View key={a.message} style={[s.alert, { backgroundColor: LEVEL_BG[a.level] }]}>
          <Text style={s.alertText}>{a.icon} {a.message}</Text>
        </View>
      ))}

      <SectionTitle>오늘 입을 옷</SectionTitle>
      <Card>
        <OutfitItems rec={rec} />
        <View style={{ height: 8 }} />
        <Button
          title="🛍️ 추천 아이템 둘러보기"
          variant="ghost"
          onPress={() => {
            analytics.tap('member_detail', 'shop_button');
            Alert.alert('곧 만나요', '날씨·가족 맞춤 쇼핑은 다음 버전에서 열릴 예정이에요.');
          }}
        />
      </Card>

      <SectionTitle>이렇게 추천했어요</SectionTitle>
      <Card>
        {rec.reasons.map((r) => (
          <Text key={r} style={s.reason}>• {r}</Text>
        ))}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 44, marginRight: 14 },
  name: { fontSize: 20, fontWeight: '800', color: colors.text },
  rel: { fontSize: 14, fontWeight: '400', color: colors.faint },
  headline: { fontSize: 15, color: colors.sub, marginTop: 4 },
  feels: { fontSize: 15, color: colors.text, marginTop: 14, fontWeight: '600' },
  alert: { borderRadius: 12, padding: 12, marginBottom: 8 },
  alertText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  reason: { fontSize: 14, color: colors.sub, lineHeight: 22 },
});
