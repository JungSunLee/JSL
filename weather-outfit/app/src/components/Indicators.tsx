import {
  AIR_GRADE_LABEL,
  pm10Grade,
  pm25Grade,
  UV_GRADE_LABEL,
  uvGrade,
  type WeatherSnapshot,
} from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '@/lib/theme';

const AIR_COLOR = { good: '#2F80ED', moderate: colors.good, bad: colors.caution, veryBad: colors.warning } as const;
const UV_COLOR = { low: colors.good, moderate: '#C9A100', high: colors.caution, veryHigh: colors.warning, extreme: '#7B2CBF' } as const;

function Tile({ title, value, grade, color }: { title: string; value: string; grade: string; color: string }) {
  return (
    <View style={s.tile} accessible accessibilityLabel={`${title} ${value} ${grade}`}>
      <Text style={s.title}>{title}</Text>
      <Text style={[s.grade, { color }]}>{grade}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  );
}

export function Indicators({ weather: w }: { weather: WeatherSnapshot }) {
  const na = { grade: '-', color: colors.faint };
  const pm10 = w.pm10 != null ? { grade: AIR_GRADE_LABEL[pm10Grade(w.pm10)], color: AIR_COLOR[pm10Grade(w.pm10)] } : na;
  const pm25 = w.pm25 != null ? { grade: AIR_GRADE_LABEL[pm25Grade(w.pm25)], color: AIR_COLOR[pm25Grade(w.pm25)] } : na;
  const uv = w.uvIndex != null ? { grade: UV_GRADE_LABEL[uvGrade(w.uvIndex)], color: UV_COLOR[uvGrade(w.uvIndex)] } : na;
  return (
    <View style={s.grid}>
      <Tile title="미세먼지" value={w.pm10 != null ? `${w.pm10}㎍/㎥` : '정보 없음'} {...pm10} />
      <Tile title="초미세먼지" value={w.pm25 != null ? `${w.pm25}㎍/㎥` : '정보 없음'} {...pm25} />
      <Tile title="자외선" value={w.uvIndex != null ? `지수 ${w.uvIndex}` : '정보 없음'} {...uv} />
      <Tile
        title="강수확률"
        value={`바람 ${w.windSpeed}m/s · 습도 ${w.humidity}%`}
        grade={`${w.precipProbMax}%`}
        color={w.precipProbMax >= 60 ? colors.primary : colors.text}
      />
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 12 },
  tile: { width: '48.5%', backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  title: { fontSize: 13, color: colors.sub },
  grade: { fontSize: 22, fontWeight: '700', marginTop: 4 },
  value: { fontSize: 12, color: colors.faint, marginTop: 2 },
});
