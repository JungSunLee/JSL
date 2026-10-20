import { recommendOutfit } from '@wo/core';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HourlyStrip } from '@/components/HourlyStrip';
import { Indicators } from '@/components/Indicators';
import { OutfitCard } from '@/components/OutfitCard';
import { Button, Card, SectionTitle } from '@/components/ui';
import { DEMO_MODE } from '@/lib/demo';
import { colors } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';
import { useOutfitMembers } from '@/state/useOutfitMembers';
import { useWeather } from '@/state/useWeather';
import { OutfitGate } from '@/components/LoginPrompt';
import { WeatherHero } from '@/components/WeatherHero';

function greeting() {
  const h = new Date().getHours();
  if (h < 11) return '좋은 아침이에요';
  if (h < 17) return '좋은 오후예요';
  return '오늘 하루 수고했어요';
}

export default function Today() {
  const { user } = useAuth();
  const members = useOutfitMembers();
  const { weather, loading, offline, usingDefaultLocation, refresh } = useWeather();

  const recs = useMemo(
    () => (weather ? members.map((m) => ({ member: m, rec: recommendOutfit(weather, m) })) : []),
    [weather, members],
  );

  if (!weather) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" />
        <Text style={{ color: colors.sub, marginTop: 12 }}>날씨를 불러오는 중…</Text>
      </View>
    );
  }

  const note = DEMO_MODE
    ? '데모 버전 · 예시 날씨로 동작 중'
    : offline
    ? '서버에 연결할 수 없어 예시 날씨를 보여드려요'
    : weather.isMock
      ? '데모 날씨 · 서비스키 설정 시 실제 데이터'
      : usingDefaultLocation
        ? '위치 권한이 없어 서울 기준이에요'
        : undefined;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={s.scroll} refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}>
        <Text style={s.greet}>
          {greeting()}
          {user ? `, ${user.name}님` : ''}
        </Text>
        <WeatherHero weather={weather} note={note} />
        <Indicators weather={weather} />

        <SectionTitle>시간별 날씨</SectionTitle>
        <HourlyStrip hours={weather.hourly.slice(0, 18)} />

        <SectionTitle right={members.length ? <Text style={s.link} onPress={() => router.push('/member/edit')}>+ 가족</Text> : undefined}>
          {members.length > 1 ? '오늘 우리 가족 코디' : '오늘의 코디'}
        </SectionTitle>
        <OutfitGate />
        {recs.map(({ member, rec }) => (
          <OutfitCard key={member.id} member={member} rec={rec} onPress={() => router.push(`/member/${member.id}`)} />
        ))}
        {members.length === 1 ? (
          <Card>
            <Text style={s.emptyTitle}>가족 코디도 함께 받아보세요 👨‍👩‍👧‍👦</Text>
            <Text style={s.emptyBody}>아이·부모님을 등록하면 각자에게 맞는 옷 두께와 챙길 것을 알려드려요.</Text>
            <Button title="가족 구성원 추가" variant="ghost" onPress={() => router.push('/member/edit')} />
          </Card>
        ) : null}

        <Text style={s.source}>출처: {weather.sources.join(', ')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 40 },
  greet: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 12, marginTop: 4 },
  link: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyBody: { fontSize: 14, color: colors.sub, marginVertical: 10, lineHeight: 21 },
  source: { fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 16 },
});
