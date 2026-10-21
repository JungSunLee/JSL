import { recommendOutfit } from '@wo/core';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DayTimeline } from '@/components/DayTimeline';
import { HourlyStrip } from '@/components/HourlyStrip';
import { Icons } from '@/components/icons';
import { Indicators } from '@/components/Indicators';
import { OutfitGate } from '@/components/LoginPrompt';
import { OutfitCard } from '@/components/OutfitCard';
import { Button, Card, SectionTitle } from '@/components/ui';
import { WeatherHero } from '@/components/WeatherHero';
import { sceneColors, WeatherScene } from '@/components/WeatherScene';
import { analytics } from '@/lib/analytics';
import { WORDING } from '@/lib/brand';
import { DEMO_MODE, demoHour } from '@/lib/demo';
import { colors } from '@/lib/theme';
import { DARK, ToneProvider } from '@/lib/tone';
import { useScreenView } from '@/lib/useScreenView';
import { useAuth } from '@/state/AuthContext';
import { GENERIC_MEMBER, useOutfitMembers } from '@/state/useOutfitMembers';
import { useWeather } from '@/state/useWeather';

function greeting(name?: string) {
  const h = new Date().getHours();
  const base = h < 11 ? '좋은 아침이에요' : h < 17 ? '좋은 오후예요' : '오늘 하루 수고했어요';
  return name ? `${base}, ${name}님` : base;
}

/**
 * 오늘 화면. 살아 움직이는 날씨 장면이 화면 전체 배경으로 깔리고,
 * 그 위에 반투명 카드로 옷차림·시간별 날씨·생활 지표가 올라간다 (몰입형, 어두운 톤).
 */
export default function Today() {
  useScreenView('today');
  const { user } = useAuth();
  const members = useOutfitMembers();
  const { weather, loading, offline, usingDefaultLocation, refresh } = useWeather();
  const { width, height } = useWindowDimensions();
  const hour = demoHour() ?? new Date().getHours();

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

  const base = sceneColors(weather.sky, weather.precipType, hour);

  return (
    <View style={{ flex: 1, backgroundColor: base[0] }}>
      {/* 고정 배경: 하늘색 그라디언트 (아래로 갈수록 살짝 어두워져 글자가 잘 읽힌다) */}
      <LinearGradient colors={[base[0], base[1], base[2]]} style={StyleSheet.absoluteFill} />
      <LinearGradient colors={['rgba(10,18,36,0)', 'rgba(10,18,36,0.22)', 'rgba(10,18,36,0.45)']} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />

      <ToneProvider dark>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <ScrollView
            contentContainerStyle={s.scroll}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={loading} tintColor="#fff" colors={[colors.primary]} onRefresh={() => (analytics.tap('today', 'refresh'), refresh())} />}
          >
            {/* 살아 움직이는 날씨 장면: 첫 화면 높이만큼, 내용과 함께 스크롤되어 올라간다 */}
            <WeatherScene sky={weather.sky} precip={weather.precipType} hour={hour} width={width} height={height} focusHeight={height * 0.4} hills={false} overlay style={s.scene} />
            <WeatherHero weather={weather} note={note} greeting={greeting(user?.name)} />

            {/* 시간별 날씨: 날씨 요약 바로 아래 */}
            <HourlyStrip hours={weather.hourly.slice(0, 18)} />

            {/* 옷차림 추천: 시간별 날씨 아래 */}
            <SectionTitle
              right={
                members.length ? (
                  <Pressable style={s.addBtn} onPress={() => (analytics.tap('today', 'add_family'), router.push('/member/edit'))} accessibilityRole="button">
                    <Icons.Plus size={14} color="#fff" weight="bold" />
                    <Text style={s.addText}>가족</Text>
                  </Pressable>
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
                <View style={s.emptyRow}>
                  <Icons.Users size={20} color="#fff" weight="fill" />
                  <Text style={s.emptyTitle}>가족 옷차림도 함께 받아보세요</Text>
                </View>
                <Text style={s.emptyBody}>아이·부모님을 등록하면 각자에게 맞는 옷 두께와 챙길 것을 알려드려요.</Text>
                <Button title="가족 구성원 추가" variant="ghost" onPress={() => (analytics.tap('today', 'add_family_card'), router.push('/member/edit'))} />
              </Card>
            ) : null}

            <SectionTitle>생활 지표</SectionTitle>
            <Indicators weather={weather} />

            <Text style={s.source}>출처: {weather.sources.join(', ')}</Text>
          </ScrollView>
        </SafeAreaView>
      </ToneProvider>
    </View>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  scroll: { padding: 16, paddingTop: 8, paddingBottom: 40 },
  scene: { position: 'absolute', top: 0, left: 0 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: DARK.chip, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  addText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  emptyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
  emptyBody: { fontSize: 14, color: DARK.sub, marginVertical: 10, lineHeight: 21 },
  source: { fontSize: 11, color: DARK.faint, textAlign: 'center', marginTop: 16 },
});
