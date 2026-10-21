import {
  AIR_GRADE_LABEL,
  pm10Grade,
  pm25Grade,
  UV_GRADE_LABEL,
  uvGrade,
  type WeatherSnapshot,
} from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { Icons, type IconComponent } from './icons';
import { colors, radius } from '@/lib/theme';
import { useTone } from '@/lib/tone';

const AIR_COLOR = { good: '#4C9BFF', moderate: '#3DBE8B', bad: '#FFB547', veryBad: '#FF6B81' } as const;
const UV_COLOR = { low: '#3DBE8B', moderate: '#F2C94C', high: '#FFB547', veryHigh: '#FF6B81', extreme: '#B983FF' } as const;

function Tile({ icon: Icon, title, value, grade, color }: { icon: IconComponent; title: string; value: string; grade: string; color: string }) {
  const t = useTone();
  return (
    <View style={[s.tile, { backgroundColor: t.card }]} accessible accessibilityLabel={`${title} ${grade} ${value}`}>
      <View style={s.titleRow}>
        <Icon size={16} color={t.sub} weight="fill" />
        <Text style={[s.title, { color: t.sub }]}>{title}</Text>
      </View>
      <View style={s.gradeRow}>
        <View style={[s.dot, { backgroundColor: color }]} />
        <Text style={[s.grade, { color: t.text }]}>{grade}</Text>
      </View>
      <Text style={[s.value, { color: t.faint }]}>{value}</Text>
    </View>
  );
}

export function Indicators({ weather: w }: { weather: WeatherSnapshot }) {
  const t = useTone();
  const na = { grade: '-', color: t.faint };
  const pm10 = w.pm10 != null ? { grade: AIR_GRADE_LABEL[pm10Grade(w.pm10)], color: AIR_COLOR[pm10Grade(w.pm10)] } : na;
  const pm25 = w.pm25 != null ? { grade: AIR_GRADE_LABEL[pm25Grade(w.pm25)], color: AIR_COLOR[pm25Grade(w.pm25)] } : na;
  const uv = w.uvIndex != null ? { grade: UV_GRADE_LABEL[uvGrade(w.uvIndex)], color: UV_COLOR[uvGrade(w.uvIndex)] } : na;
  return (
    <View style={s.grid}>
      <Tile icon={Icons.Wind} title="미세먼지" value={w.pm10 != null ? `${w.pm10}㎍/㎥` : '정보 없음'} {...pm10} />
      <Tile icon={Icons.Wind} title="초미세먼지" value={w.pm25 != null ? `${w.pm25}㎍/㎥` : '정보 없음'} {...pm25} />
      <Tile icon={Icons.Sun} title="자외선" value={w.uvIndex != null ? `지수 ${w.uvIndex}` : '정보 없음'} {...uv} />
      <Tile
        icon={Icons.CloudRain}
        title="강수확률"
        value={`바람 ${w.windSpeed}m/s · 습도 ${w.humidity}%`}
        grade={`${w.precipProbMax}%`}
        color={w.precipProbMax >= 60 ? (t.dark ? '#9FD0FF' : colors.primary) : t.faint}
      />
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '48.5%', borderRadius: radius.lg, padding: 14, marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 13, fontWeight: '600' },
  gradeRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  grade: { fontSize: 22, fontWeight: '700' },
  value: { fontSize: 12, marginTop: 2 },
});
