import { weatherEmoji, type HourlyForecast } from '@wo/core';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/lib/theme';
import { Card } from './ui';

/** 등원(8시)·하원(16시)·퇴근(18시) 시간대를 표시해 가족 일정과 연결 */
const MARKS: Record<number, string> = { 8: '등원·출근', 16: '하원', 18: '퇴근' };

export function HourlyStrip({ hours }: { hours: HourlyForecast[] }) {
  return (
    <Card style={{ paddingHorizontal: 4 }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {hours.map((h, i) => {
          const hr = new Date(h.time).getHours();
          return (
            <View key={h.time} style={[s.cell, MARKS[hr] && s.marked]}>
              <Text style={s.mark}>{MARKS[hr] ?? ' '}</Text>
              <Text style={s.hour}>{i === 0 ? '지금' : `${hr}시`}</Text>
              <Text style={s.icon}>{weatherEmoji(h.sky, h.precipType)}</Text>
              <Text style={s.temp}>{Math.round(h.temp)}°</Text>
              <Text style={[s.pop, h.precipProb >= 60 && { color: colors.primary, fontWeight: '700' }]}>
                {h.precipProb > 0 ? `💧${h.precipProb}%` : ' '}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </Card>
  );
}

const s = StyleSheet.create({
  cell: { width: 58, alignItems: 'center', paddingVertical: 4, borderRadius: 12 },
  marked: { backgroundColor: '#EEF3FF' },
  mark: { fontSize: 10, color: colors.primary, fontWeight: '600', height: 14 },
  hour: { fontSize: 13, color: colors.sub },
  icon: { fontSize: 22, marginVertical: 6 },
  temp: { fontSize: 16, fontWeight: '600', color: colors.text },
  pop: { fontSize: 11, color: colors.faint, marginTop: 4 },
});
