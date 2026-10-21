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

/**
 * 생활 지표. "보통"이 어느 정도인지 바로 알 수 있도록 등급별 구간을 색 띠로 그리고,
 * 현재 값의 위치를 점으로 표시한다. 띠 아래에는 구간 경계 숫자를 적는다.
 * 기준: 미세먼지(PM10) 0~30 좋음 · ~80 보통 · ~150 나쁨 · 151↑ 매우나쁨 (환경부 기준)
 *       초미세먼지(PM2.5) 0~15 · ~35 · ~75 · 76↑ / 자외선 0~2 낮음 · ~5 보통 · ~7 높음 · ~10 매우높음 · 11↑ 위험 (기상청)
 */
const AIR_COLOR = { good: '#4C9BFF', moderate: '#3DBE8B', bad: '#FFB547', veryBad: '#FF6B81' } as const;
const UV_COLOR = { low: '#3DBE8B', moderate: '#F2C94C', high: '#FFB547', veryHigh: '#FF6B81', extreme: '#B983FF' } as const;

interface Band {
  /** 이 구간의 상한 (마지막 구간은 띠 끝 값) */
  to: number;
  color: string;
  label: string;
}
const PM10_BANDS: Band[] = [
  { to: 30, color: AIR_COLOR.good, label: '좋음' },
  { to: 80, color: AIR_COLOR.moderate, label: '보통' },
  { to: 150, color: AIR_COLOR.bad, label: '나쁨' },
  { to: 200, color: AIR_COLOR.veryBad, label: '매우나쁨' },
];
const PM25_BANDS: Band[] = [
  { to: 15, color: AIR_COLOR.good, label: '좋음' },
  { to: 35, color: AIR_COLOR.moderate, label: '보통' },
  { to: 75, color: AIR_COLOR.bad, label: '나쁨' },
  { to: 100, color: AIR_COLOR.veryBad, label: '매우나쁨' },
];
const UV_BANDS: Band[] = [
  { to: 2, color: UV_COLOR.low, label: '낮음' },
  { to: 5, color: UV_COLOR.moderate, label: '보통' },
  { to: 7, color: UV_COLOR.high, label: '높음' },
  { to: 10, color: UV_COLOR.veryHigh, label: '매우높음' },
  { to: 13, color: UV_COLOR.extreme, label: '위험' },
];
const POP_BANDS: Band[] = [
  { to: 30, color: '#B9C6D8', label: '낮음' },
  { to: 60, color: '#6FAEF9', label: '있음' },
  { to: 100, color: '#3A6FF7', label: '높음' },
];

/** 등급 띠 + 현재 값 표시. 각 구간은 폭이 같게(값이 아니라 등급 기준으로) 그린다 */
function Scale({ bands, value }: { bands: Band[]; value: number | null }) {
  const t = useTone();
  const n = bands.length;
  let pos: number | null = null;
  if (value != null) {
    let from = 0;
    for (let i = 0; i < n; i++) {
      const to = bands[i].to;
      if (value <= to || i === n - 1) {
        pos = (i + Math.min(1, Math.max(0, (value - from) / (to - from)))) / n;
        break;
      }
      from = to;
    }
  }
  return (
    <View style={s.scale}>
      <View style={s.track}>
        {bands.map((b) => (
          <View key={b.label} style={[s.seg, { backgroundColor: b.color, opacity: t.dark ? 0.85 : 1 }]} />
        ))}
        {pos != null ? <View style={[s.marker, { left: `${pos * 100}%`, borderColor: t.dark ? '#FFFFFF' : colors.text }]} /> : null}
      </View>
      <View style={s.ticks}>
        {bands.slice(0, -1).map((b, i) => (
          <Text key={b.label} style={[s.tick, { color: t.faint, left: `${((i + 1) / n) * 100}%` }]}>{b.to}</Text>
        ))}
      </View>
    </View>
  );
}

function Tile({
  icon: Icon,
  title,
  grade,
  color,
  value,
  unit,
  bands,
  rangeText,
}: {
  icon: IconComponent;
  title: string;
  grade: string;
  color: string;
  value: number | null;
  unit: string;
  bands: Band[];
  /** 현재 등급의 범위 설명 (예: "보통 31~80㎍/㎥") */
  rangeText: string;
}) {
  const t = useTone();
  return (
    <View style={[s.tile, { backgroundColor: t.card }]} accessible accessibilityLabel={`${title} ${grade}, ${value != null ? `${value}${unit}` : '정보 없음'}. ${rangeText}`}>
      <View style={s.titleRow}>
        <Icon size={16} color={t.sub} weight="fill" />
        <Text style={[s.title, { color: t.sub }]}>{title}</Text>
      </View>
      <View style={s.gradeRow}>
        <View style={[s.dot, { backgroundColor: color }]} />
        <Text style={[s.grade, { color: t.text }]}>{grade}</Text>
        <Text style={[s.value, { color: t.text }]}>{value != null ? `${value}` : '-'}<Text style={{ color: t.faint, fontSize: 11 }}>{value != null ? unit : ''}</Text></Text>
      </View>
      <Scale bands={bands} value={value} />
      <Text style={[s.range, { color: t.faint }]}>{rangeText}</Text>
    </View>
  );
}

/** 현재 값이 속한 구간을 "보통 31~80" 식으로 */
function rangeOf(bands: Band[], value: number | null, unit: string, openEnd = true): string {
  if (value == null) return '정보 없음';
  let from = 0;
  for (let i = 0; i < bands.length; i++) {
    const b = bands[i];
    if (value <= b.to || i === bands.length - 1) {
      const last = i === bands.length - 1;
      const lo = i === 0 ? 0 : from + 1;
      return last && openEnd ? `${b.label} 구간: ${lo}${unit} 이상` : `${b.label} 구간: ${lo}~${b.to}${unit}`;
    }
    from = b.to;
  }
  return '';
}

export function Indicators({ weather: w }: { weather: WeatherSnapshot }) {
  const t = useTone();
  const na = { grade: '-', color: t.faint };
  const pm10 = w.pm10 != null ? { grade: AIR_GRADE_LABEL[pm10Grade(w.pm10)], color: AIR_COLOR[pm10Grade(w.pm10)] } : na;
  const pm25 = w.pm25 != null ? { grade: AIR_GRADE_LABEL[pm25Grade(w.pm25)], color: AIR_COLOR[pm25Grade(w.pm25)] } : na;
  const uv = w.uvIndex != null ? { grade: UV_GRADE_LABEL[uvGrade(w.uvIndex)], color: UV_COLOR[uvGrade(w.uvIndex)] } : na;
  const pop = w.precipProbMax;
  return (
    <View style={s.grid}>
      <Tile icon={Icons.Wind} title="미세먼지" value={w.pm10} unit="㎍/㎥" bands={PM10_BANDS} rangeText={rangeOf(PM10_BANDS, w.pm10, '')} {...pm10} />
      <Tile icon={Icons.Wind} title="초미세먼지" value={w.pm25} unit="㎍/㎥" bands={PM25_BANDS} rangeText={rangeOf(PM25_BANDS, w.pm25, '')} {...pm25} />
      <Tile icon={Icons.Sun} title="자외선 지수" value={w.uvIndex} unit="" bands={UV_BANDS} rangeText={rangeOf(UV_BANDS, w.uvIndex, '')} {...uv} />
      <Tile
        icon={Icons.CloudRain}
        title="강수확률"
        value={pop}
        unit="%"
        bands={POP_BANDS}
        rangeText={`바람 ${w.windSpeed}m/s · 습도 ${w.humidity}%`}
        grade={pop >= 60 ? '우산 필수' : pop >= 30 ? '우산 챙기기' : '비 없음'}
        color={pop >= 60 ? (t.dark ? '#9FD0FF' : colors.primary) : pop >= 30 ? '#6FAEF9' : t.faint}
      />
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  tile: { width: '48.5%', borderRadius: radius.lg, padding: 14, marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 13, fontWeight: '600' },
  gradeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 8 },
  dot: { width: 9, height: 9, borderRadius: 5, alignSelf: 'center' },
  grade: { fontSize: 18, fontWeight: '700' },
  value: { fontSize: 13, fontWeight: '600', marginLeft: 'auto' },
  scale: { marginTop: 10 },
  track: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'visible', gap: 2 },
  seg: { flex: 1, height: 6, borderRadius: 3 },
  marker: { position: 'absolute', top: -4, width: 14, height: 14, marginLeft: -7, borderRadius: 7, borderWidth: 3, backgroundColor: 'transparent' },
  ticks: { height: 14, marginTop: 4 },
  tick: { position: 'absolute', width: 32, marginLeft: -16, textAlign: 'center', fontSize: 9, fontWeight: '600' },
  range: { fontSize: 11, marginTop: 4 },
});
