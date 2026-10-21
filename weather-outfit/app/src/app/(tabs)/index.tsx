import { recommendOutfit } from '@wo/core';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayTimeline } from '@/components/DayTimeline';
import { HourlyStrip } from '@/components/HourlyStrip';
import { Indicators } from '@/components/Indicators';
import { OutfitGate } from '@/components/LoginPrompt';
import { OutfitCard } from '@/components/OutfitCard';
import { Button, Card, SectionTitle } from '@/components/ui';
import { WeatherHero } from '@/components/WeatherHero';
import { analytics } from '@/lib/analytics';
import { WORDING } from '@/lib/brand';
import { DEMO_MODE } from '@/lib/demo';
import { colors } from '@/lib/theme';
import { useScreenView } from '@/lib/useScreenView';
import { useAuth } from '@/state/AuthContext';
import { GENERIC_MEMBER, useOutfitMembers } from '@/state/useOutfitMembers';
import { useWeather } from '@/state/useWeather';

function greeting(name?: string) {
  const h = new Date().getHours();
  const base = h < 11 ? '좋은 아침이에요' : h < 17 ? '좋은 오후예요' : '오늘 하루 수고했어요';
  return name ? `${base}, ${name}님` : base;
}

export default function Today() {
  useScreenView('today');
  const { user } = useAuth();
  const members = useOutfitMembers();
  const { weather, loading, offline, usingDefaultLocation, refresh } = useWeather();

  const recs = useMemo(
    () => (weather ? members.map((m) => ({ member: m, rec: recommendOutfit(weather, m) })) : []),
    [weather, members],
  );
  // 로그인·프로필 전에는 성인 평균 기준으로 먼저 보여준다
  const generic = useMemo(() => (weather && members.length === 0 ? recommendOutfit(weather, GENERIC_MEMBER) : null), [weather, members.length]);

  if (!weather) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" />
        <Text style={{ color: colors.sub, marginTop: 12 }}>날씨를 불러오는 중…</Text>
      </View>
    );
  }

  const note = DEMO_MODE
    ? '데모 버전 · 예시 날씨'
    : offline
      ? '서버에 연결할 수 없어 예시 날씨를 보여드려요'
      : weather.isMock
        ? '데모 날씨 · 서비스키 설정 시 실제 데이터'
        : usingDefaultLocation
          ? '위치 권한이 없어 기본 지역 기준이에요'
          : undefined;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView
        contentContainerStyle={s.scroll}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => (analytics.tap('today', 'refresh'), refresh())} />}
      >
        <WeatherHero weather={weather} note={note} greeting={greeting(user?.name)} />

        {/* 옷차림 추천: 날씨 바로 아래, 첫 화면 안에 보이도록 */}
        <SectionTitle
          right={
            members.length ? (
              <Text style={s.link} onPress={() => (analytics.tap('today', 'add_family'), router.push('/member/edit'))}>
                + 가족
              </Text>
            ) : undefined
          }
        >
          {members.length > 1 ? WORDING.familyToday : WORDING.today}
        </SectionTitle>
        {generic ? (
          <>
            <OutfitCard member={GENERIC_MEMBER} rec={generic} subtitle="성인 평균 기준" />
            <DayTimeline weather={weather} member={GENERIC_MEMBER} />
          </>
        ) : null}
        <OutfitGate />
        {recs.map(({ member, rec }, i) => (
          <View key={member.id}>
            <OutfitCard
              member={member}
              rec={rec}
              onPress={() => (analytics.tap('today', 'outfit_card', { relation: member.relation }), router.push(`/member/${member.id}`))}
              onEdit={() => (analytics.tap('today', 'edit_member'), router.push(member.relation === 'me' ? '/onboarding' : { pathname: '/member/edit', params: { id: member.id } }))}
            />
            {i === 0 ? <DayTimeline weather={weather} member={member} /> : null}
          </View>
        ))}
        {members.length === 1 ? (
          <Card>
            <Text style={s.emptyTitle}>가족 옷차림도 함께 받아보세요 👨‍👩‍👧‍👦</Text>
            <Text style={s.emptyBody}>아이·부모님을 등록하면 각자에게 맞는 옷 두께와 챙길 것을 알려드려요.</Text>
            <Button title="가족 구성원 추가" variant="ghost" onPress={() => (analytics.tap('today', 'add_family_card'), router.push('/member/edit'))} />
          </Card>
        ) : null}

        <SectionTitle>시간별 날씨</SectionTitle>
        <HourlyStrip hours={weather.hourly.slice(0, 18)} />

        <SectionTitle>생활 지표</SectionTitle>
        <Indicators weather={weather} />

        <Text style={s.source}>출처: {weather.sources.join(', ')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  link: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  emptyBody: { fontSize: 14, color: colors.sub, marginVertical: 10, lineHeight: 21 },
  source: { fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 16 },
});
