import { recommendOutfit, weatherEmoji, type FamilyMember, type HourlyForecast, type WeatherSnapshot } from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, THICKNESS_LABEL } from '@/lib/theme';

/**
 * 하루 옷차림 흐름: 아침(등원·출근) → 낮 → 저녁(하원·퇴근) 시간대별로
 * 기온과 옷 두께가 어떻게 달라지는지 한 줄로 보여준다. 일교차가 큰 날 "겉옷을 챙겨야 하는 이유"가 바로 보인다.
 */
const SLOTS: { label: string; hour: number }[] = [
  { label: '아침 8시', hour: 8 },
  { label: '낮 2시', hour: 14 },
  { label: '저녁 6시', hour: 18 },
];

function pick(hourly: HourlyForecast[], hour: number): HourlyForecast | undefined {
  // 오늘 또는 가장 가까운 다음 해당 시각
  const now = Date.now();
  return hourly.find((h) => new Date(h.time).getHours() === hour && new Date(h.time).getTime() >= now - 3600_000) ?? hourly.find((h) => new Date(h.time).getHours() === hour);
}

export function DayTimeline({ weather, member }: { weather: WeatherSnapshot; member: FamilyMember }) {
  const points = SLOTS.map((slot) => {
    const h = pick(weather.hourly, slot.hour);
    if (!h) return null;
    const rec = recommendOutfit({ ...weather, temp: h.temp, humidity: h.humidity, windSpeed: h.windSpeed, sky: h.sky, precipType: h.precipType }, member);
    const outer = rec.items.find((i) => i.slot === 'outer');
    return { ...slot, h, rec, outer };
  }).filter((p): p is NonNullable<typeof p> => p !== null);
  if (points.length < 2) return null;

  const levels = points.map((p) => p.rec.thickness);
  const spread = Math.max(...levels) - Math.min(...levels);

  return (
    <View style={s.card}>
      <View style={s.head}>
        <Text style={s.title}>{member.name}의 하루 옷차림 흐름</Text>
        <Text style={s.hint}>{spread >= 1 ? '시간대별로 옷 두께가 달라요 — 겉옷을 챙기세요' : '하루 종일 비슷하게 입으면 돼요'}</Text>
      </View>
      <View style={s.row}>
        {points.map((p, i) => (
          <View key={p.label} style={s.col}>
            <Text style={s.slot}>{p.label}</Text>
            <Text style={s.icon}>{weatherEmoji(p.h.sky, p.h.precipType)}</Text>
            <Text style={s.temp}>{Math.round(p.h.temp)}°</Text>
            <View style={s.meter}>
              {[1, 2, 3, 4, 5].map((n) => (
                <View key={n} style={[s.bar, n <= p.rec.thickness && { backgroundColor: colors.primary }]} />
              ))}
            </View>
            <Text style={s.thick}>{THICKNESS_LABEL[p.rec.thickness]}</Text>
            <Text style={s.outer} numberOfLines={2}>{p.outer ? p.outer.name.replace('챙겨갈 겉옷: ', '') : '겉옷 없이'}</Text>
            {i < points.length - 1 ? <Text style={s.arrow}>›</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 12 },
  head: { marginBottom: 10 },
  title: { fontSize: 14, fontWeight: '700', color: colors.text },
  hint: { fontSize: 12, color: colors.sub, marginTop: 2 },
  row: { flexDirection: 'row' },
  col: { flex: 1, alignItems: 'center', position: 'relative' },
  slot: { fontSize: 12, color: colors.sub, fontWeight: '600' },
  icon: { fontSize: 22, marginTop: 4 },
  temp: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 2 },
  meter: { flexDirection: 'row', marginTop: 6, gap: 2 },
  bar: { width: 9, height: 5, borderRadius: 2, backgroundColor: colors.line },
  thick: { fontSize: 11, color: colors.sub, marginTop: 4 },
  outer: { fontSize: 11, color: colors.text, textAlign: 'center', marginTop: 2, paddingHorizontal: 4 },
  arrow: { position: 'absolute', right: -6, top: 34, fontSize: 20, color: colors.faint },
});
