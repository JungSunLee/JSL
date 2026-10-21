import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { analytics } from '@/lib/analytics';
import { Chip } from '@/components/ui';
import { colors, radius } from '@/lib/theme';
import { useScreenView } from '@/lib/useScreenView';
import { useSettings } from '@/state/SettingsContext';

const TIMES = ['06:30', '07:00', '07:30', '08:00', '08:30'];

/**
 * 알림 설정. 지금은 설정값을 기기에 저장만 하고, 실제 푸시 발송은 서버 배포 후 연결한다.
 */
export default function Notifications() {
  useScreenView('notifications');
  const { settings, update } = useSettings();
  const set = (patch: Parameters<typeof update>[0], target: string) => {
    analytics.tap('notifications', target);
    void update(patch);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <View style={s.card}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>아침 옷차림 알림</Text>
            <Text style={s.desc}>매일 아침 가족 모두의 옷차림을 한 번에 알려드려요</Text>
          </View>
          <Switch value={settings.morningAlert} onValueChange={(v) => set({ morningAlert: v }, v ? 'morning_on' : 'morning_off')} />
        </View>
        {settings.morningAlert ? (
          <View style={s.times}>
            <Text style={s.label}>알림 시간</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {TIMES.map((t) => (
                <Chip key={t} label={t} selected={settings.morningAlertTime === t} onPress={() => set({ morningAlertTime: t }, `time_${t}`)} />
              ))}
            </View>
          </View>
        ) : null}
      </View>

      <View style={s.card}>
        <View style={s.row}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>비·눈 예보 알림</Text>
            <Text style={s.desc}>외출 시간대에 비나 눈이 예보되면 우산을 챙기도록 알려드려요</Text>
          </View>
          <Switch value={settings.rainAlert} onValueChange={(v) => set({ rainAlert: v }, v ? 'rain_on' : 'rain_off')} />
        </View>
        <View style={[s.row, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line }]}>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>미세먼지 나쁨 알림</Text>
            <Text style={s.desc}>아이·호흡기 질환이 있는 가족이 있으면 한 단계 낮은 기준으로 알려드려요</Text>
          </View>
          <Switch value={settings.dustAlert} onValueChange={(v) => set({ dustAlert: v }, v ? 'dust_on' : 'dust_off')} />
        </View>
      </View>

      <Text style={s.note}>
        ⓘ 알림은 서버가 배포된 뒤부터 실제로 발송됩니다. 지금 선택한 설정은 저장되어 그대로 적용돼요.
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 16, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  desc: { fontSize: 12, color: colors.sub, marginTop: 3, lineHeight: 17, paddingRight: 8 },
  times: { paddingBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: colors.sub, marginBottom: 8 },
  note: { fontSize: 12, color: colors.faint, lineHeight: 18, marginTop: 8, paddingHorizontal: 4 },
});
