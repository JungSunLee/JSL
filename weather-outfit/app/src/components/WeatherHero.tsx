import {
  AIR_GRADE_LABEL,
  airGrade,
  feelsLike,
  UV_GRADE_LABEL,
  uvGrade,
  weatherLabel,
  type WeatherSnapshot,
} from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { Icons, WeatherIcon, type IconComponent } from './icons';
import { demoHour } from '@/lib/demo';

/**
 * 첫 화면 상단(투명). 날씨 장면은 화면 전체 배경으로 깔리므로 여기서는 글자와 칩만 올린다.
 * 위치·인사 → 큰 기온·하늘 상태 → 최저/최고·체감·일교차 → 미세먼지·자외선·강수·바람 칩.
 */
export function WeatherHero({ weather: w, note, greeting }: { weather: WeatherSnapshot; note?: string; greeting?: string }) {
  const hour = demoHour() ?? new Date().getHours();
  const night = hour >= 19 || hour < 6;
  const feels = feelsLike(w.temp, w.humidity, w.windSpeed);
  const air = airGrade(w.pm10, w.pm25);
  const chips: { icon: IconComponent; text: string }[] = [];
  if (air) chips.push({ icon: Icons.Wind, text: `미세먼지 ${AIR_GRADE_LABEL[air]}` });
  if (w.uvIndex != null) chips.push({ icon: Icons.Sun, text: `자외선 ${UV_GRADE_LABEL[uvGrade(w.uvIndex)]}` });
  if (w.precipProbMax >= 30) chips.push({ icon: Icons.Umbrella, text: `강수 ${w.precipProbMax}%` });
  if (w.windSpeed >= 6) chips.push({ icon: Icons.Wind, text: `바람 ${w.windSpeed}m/s` });

  return (
    <View style={s.wrap}>
      <View style={s.top}>
        <View style={{ flex: 1 }}>
          {greeting ? <Text style={s.greet}>{greeting}</Text> : null}
          <View style={s.locRow}>
            <Icons.MapPin size={14} color="rgba(255,255,255,0.9)" weight="fill" />
            <Text style={s.location} numberOfLines={1}>{w.locationName}</Text>
          </View>
        </View>
      </View>

      <View style={s.main}>
        <Text style={s.temp}>{Math.round(w.temp)}°</Text>
        <View style={s.side}>
          <WeatherIcon sky={w.sky} precip={w.precipType} night={night} size={40} color="#FFFFFF" />
          <Text style={s.label}>{weatherLabel(w.sky, w.precipType)}</Text>
        </View>
      </View>

      <View style={s.metaRow}>
        <Text style={s.meta}>최저 {Math.round(w.tempMin)}° · 최고 {Math.round(w.tempMax)}°</Text>
        <View style={s.metaDot} />
        <Text style={s.meta}>체감 {Math.round(feels)}°</Text>
        <View style={s.metaDot} />
        <Text style={s.meta}>일교차 {Math.round(w.tempMax - w.tempMin)}°</Text>
      </View>

      {chips.length ? (
        <View style={s.chips}>
          {chips.map((c) => (
            <View key={c.text} style={s.chip}>
              <c.icon size={13} color="#FFFFFF" weight="fill" />
              <Text style={s.chipText}>{c.text}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {note ? (
        <View style={s.note}>
          <Icons.Info size={12} color="rgba(255,255,255,0.9)" weight="bold" />
          <Text style={s.noteText}>{note}</Text>
        </View>
      ) : null}
    </View>
  );
}

const shadow = { textShadowColor: 'rgba(0,0,0,0.22)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 } as const;

const s = StyleSheet.create({
  wrap: { paddingTop: 6, paddingBottom: 18 },
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  greet: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '700', marginBottom: 4, ...shadow },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  location: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', ...shadow },
  main: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  temp: { color: '#fff', fontSize: 88, fontWeight: '200', letterSpacing: -4, lineHeight: 96, ...shadow },
  side: { marginLeft: 12, alignItems: 'flex-start', gap: 4 },
  label: { color: '#fff', fontSize: 18, fontWeight: '700', ...shadow },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 2 },
  meta: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '500', ...shadow },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)', marginHorizontal: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.16)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  note: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, backgroundColor: 'rgba(0,0,0,0.22)', alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  noteText: { color: 'rgba(255,255,255,0.92)', fontSize: 11, fontWeight: '500' },
});
