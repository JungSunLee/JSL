import {
  AIR_GRADE_LABEL,
  airGrade,
  feelsLike,
  UV_GRADE_LABEL,
  uvGrade,
  weatherEmoji,
  weatherLabel,
  type WeatherSnapshot,
} from '@wo/core';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { radius, skyGradient } from '@/lib/theme';

/**
 * 첫 화면 상단의 날씨 요약. 아래의 옷차림 추천이 한 화면에 함께 보이도록
 * 기온·하늘·최저/최고와 미세먼지·자외선·강수를 한 카드에 압축했다.
 */
export function WeatherHero({ weather: w, note }: { weather: WeatherSnapshot; note?: string }) {
  const hour = new Date().getHours();
  const feels = feelsLike(w.temp, w.humidity, w.windSpeed);
  const air = airGrade(w.pm10, w.pm25);
  const chips = [
    air ? `미세먼지 ${AIR_GRADE_LABEL[air]}` : null,
    w.uvIndex != null ? `자외선 ${UV_GRADE_LABEL[uvGrade(w.uvIndex)]}` : null,
    w.precipProbMax >= 30 ? `강수 ${w.precipProbMax}%` : null,
    w.windSpeed >= 6 ? `바람 ${w.windSpeed}m/s` : null,
  ].filter((c): c is string => !!c);

  return (
    <LinearGradient colors={skyGradient(w.sky, w.precipType, hour)} style={s.hero}>
      <View style={s.top}>
        <Text style={s.location} numberOfLines={1}>📍 {w.locationName}</Text>
        <Text style={s.range}>
          {Math.round(w.tempMin)}° / {Math.round(w.tempMax)}°
        </Text>
      </View>
      <View style={s.row}>
        <Text style={s.emoji}>{weatherEmoji(w.sky, w.precipType)}</Text>
        <Text style={s.temp}>{Math.round(w.temp)}°</Text>
        <View style={s.desc}>
          <Text style={s.label}>{weatherLabel(w.sky, w.precipType)}</Text>
          <Text style={s.feels}>체감 {Math.round(feels)}° · 일교차 {Math.round(w.tempMax - w.tempMin)}°</Text>
        </View>
      </View>
      {chips.length ? (
        <View style={s.chips}>
          {chips.map((c) => (
            <Text key={c} style={s.chip}>{c}</Text>
          ))}
        </View>
      ) : null}
      {note ? <Text style={s.note}>{note}</Text> : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: radius.lg, paddingHorizontal: 18, paddingVertical: 14 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  location: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '600', flex: 1, marginRight: 8 },
  range: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  emoji: { fontSize: 40, marginRight: 8 },
  temp: { color: '#fff', fontSize: 54, fontWeight: '300', letterSpacing: -2, marginRight: 12 },
  desc: { flex: 1 },
  label: { color: '#fff', fontSize: 17, fontWeight: '700' },
  feels: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  chip: { color: '#fff', fontSize: 12, fontWeight: '600', backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  note: { color: '#fff', fontSize: 11, marginTop: 8, backgroundColor: 'rgba(0,0,0,0.18)', alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
});
