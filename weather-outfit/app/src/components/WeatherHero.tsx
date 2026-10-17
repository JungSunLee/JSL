import { feelsLike, weatherEmoji, weatherLabel, type WeatherSnapshot } from '@wo/core';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { radius, skyGradient } from '@/lib/theme';

export function WeatherHero({ weather, note }: { weather: WeatherSnapshot; note?: string }) {
  const hour = new Date().getHours();
  const feels = feelsLike(weather.temp, weather.humidity, weather.windSpeed);
  return (
    <LinearGradient colors={skyGradient(weather.sky, weather.precipType, hour)} style={s.hero}>
      <Text style={s.location}>📍 {weather.locationName}</Text>
      <View style={s.row}>
        <Text style={s.emoji}>{weatherEmoji(weather.sky, weather.precipType)}</Text>
        <Text style={s.temp}>{Math.round(weather.temp)}°</Text>
      </View>
      <Text style={s.label}>{weatherLabel(weather.sky, weather.precipType)} · 체감 {Math.round(feels)}°</Text>
      <Text style={s.range}>
        최저 {Math.round(weather.tempMin)}° / 최고 {Math.round(weather.tempMax)}° · 일교차 {Math.round(weather.tempMax - weather.tempMin)}°
      </Text>
      {note ? <Text style={s.note}>{note}</Text> : null}
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  hero: { borderRadius: radius.lg, padding: 22 },
  location: { color: 'rgba(255,255,255,0.92)', fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  emoji: { fontSize: 56, marginRight: 12 },
  temp: { color: '#fff', fontSize: 76, fontWeight: '300', letterSpacing: -2 },
  label: { color: '#fff', fontSize: 18, fontWeight: '600' },
  range: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  note: { color: '#fff', fontSize: 12, marginTop: 12, backgroundColor: 'rgba(0,0,0,0.18)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden' },
});
