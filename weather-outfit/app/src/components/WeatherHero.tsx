import {
  AIR_GRADE_LABEL,
  airGrade,
  feelsLike,
  UV_GRADE_LABEL,
  uvGrade,
  weatherLabel,
  type WeatherSnapshot,
} from '@wo/core';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { demoHour } from '@/lib/demo';
import { radius } from '@/lib/theme';
import { WeatherScene } from './WeatherScene';

/**
 * 첫 화면 상단: 살아 움직이는 날씨 장면 위에 기온·하늘·최저/최고와
 * 미세먼지·자외선·강수 칩을 겹쳐 보여준다. 아래 옷차림 추천이 같은 화면에 들어오도록 높이는 230 안팎.
 */
export function WeatherHero({ weather: w, note, greeting }: { weather: WeatherSnapshot; note?: string; greeting?: string }) {
  const [width, setWidth] = useState(0);
  const hour = demoHour() ?? new Date().getHours();
  const feels = feelsLike(w.temp, w.humidity, w.windSpeed);
  const air = airGrade(w.pm10, w.pm25);
  const chips = [
    air ? `미세먼지 ${AIR_GRADE_LABEL[air]}` : null,
    w.uvIndex != null ? `자외선 ${UV_GRADE_LABEL[uvGrade(w.uvIndex)]}` : null,
    w.precipProbMax >= 30 ? `강수 ${w.precipProbMax}%` : null,
    w.windSpeed >= 6 ? `바람 ${w.windSpeed}m/s` : null,
  ].filter((c): c is string => !!c);
  const H = 236;

  return (
    <View style={s.wrap} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 ? <WeatherScene sky={w.sky} precip={w.precipType} hour={hour} width={width} height={H} style={StyleSheet.absoluteFill} /> : null}
      <View style={[s.content, { height: H }]}>
        <View style={s.top}>
          <View style={{ flex: 1, marginRight: 8 }}>
            {greeting ? <Text style={s.greet}>{greeting}</Text> : null}
            <Text style={s.location} numberOfLines={1}>📍 {w.locationName}</Text>
          </View>
          <Text style={s.range}>
            {Math.round(w.tempMin)}° / {Math.round(w.tempMax)}°
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <View style={s.bottom}>
          <View style={s.tempRow}>
            <Text style={s.temp}>{Math.round(w.temp)}°</Text>
            <View style={{ marginLeft: 10, marginBottom: 10 }}>
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
        </View>
      </View>
    </View>
  );
}

const shadow = { textShadowColor: 'rgba(0,0,0,0.25)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 } as const;

const s = StyleSheet.create({
  wrap: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: '#2F80ED' },
  content: { padding: 16 },
  top: { flexDirection: 'row', alignItems: 'flex-start' },
  greet: { color: 'rgba(255,255,255,0.95)', fontSize: 15, fontWeight: '700', marginBottom: 2, ...shadow },
  location: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: '600', ...shadow },
  range: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '700', ...shadow },
  bottom: {},
  tempRow: { flexDirection: 'row', alignItems: 'flex-end' },
  temp: { color: '#fff', fontSize: 64, fontWeight: '300', letterSpacing: -3, lineHeight: 68, ...shadow },
  label: { color: '#fff', fontSize: 18, fontWeight: '700', ...shadow },
  feels: { color: 'rgba(255,255,255,0.92)', fontSize: 13, marginTop: 2, ...shadow },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 6 },
  chip: { color: '#fff', fontSize: 12, fontWeight: '600', backgroundColor: 'rgba(0,0,0,0.22)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
  note: { color: '#fff', fontSize: 11, marginTop: 8, backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999, overflow: 'hidden' },
});
