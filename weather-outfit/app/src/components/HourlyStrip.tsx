import type { HourlyForecast } from '@wo/core';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Icons, WeatherIcon } from './icons';
import { radius } from '@/lib/theme';
import { useTone } from '@/lib/tone';

/** 등원(8시)·하원(16시)·퇴근(18시) 시간대를 표시해 가족 일정과 연결 */
const MARKS: Record<number, string> = { 8: '등원·출근', 16: '하원', 18: '퇴근' };

export function HourlyStrip({ hours }: { hours: HourlyForecast[] }) {
  const t = useTone();
  return (
    <View style={[s.card, { backgroundColor: t.card }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 6 }}>
        {hours.map((h, i) => {
          const hr = new Date(h.time).getHours();
          const night = hr >= 19 || hr < 6;
          const marked = !!MARKS[hr];
          return (
            <View key={h.time} style={[s.cell, marked && { backgroundColor: t.accentSoft }]}>
              <Text style={[s.mark, { color: t.dark ? '#FFFFFF' : t.accent }]}>{MARKS[hr] ?? ' '}</Text>
              <Text style={[s.hour, { color: t.sub }, i === 0 && { color: t.text, fontWeight: '700' }]}>{i === 0 ? '지금' : `${hr}시`}</Text>
              <View style={{ marginVertical: 6 }}>
                <WeatherIcon sky={h.sky} precip={h.precipType} night={night} size={24} color={t.text} />
              </View>
              <Text style={[s.temp, { color: t.text }]}>{Math.round(h.temp)}°</Text>
              <View style={s.popRow}>
                {h.precipProb > 0 ? (
                  <>
                    <Icons.Drop size={10} color={h.precipProb >= 60 ? (t.dark ? '#9FD0FF' : t.accent) : t.faint} weight="fill" />
                    <Text style={[s.pop, { color: h.precipProb >= 60 ? (t.dark ? '#9FD0FF' : t.accent) : t.faint }, h.precipProb >= 60 && { fontWeight: '700' }]}>{h.precipProb}%</Text>
                  </>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.lg, paddingVertical: 10 },
  cell: { width: 60, alignItems: 'center', paddingVertical: 6, borderRadius: 14 },
  mark: { fontSize: 10, fontWeight: '600', height: 14 },
  hour: { fontSize: 13 },
  temp: { fontSize: 16, fontWeight: '600' },
  popRow: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 16, marginTop: 4 },
  pop: { fontSize: 11 },
});
