import { RELATION_LABEL, type FamilyMember, type OutfitRecommendation } from '@wo/core';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from './Avatar';
import { alertIconFor, Icons } from './icons';
import { OutfitItems } from './OutfitItems';
import { colors, radius, THICKNESS_LABEL } from '@/lib/theme';
import { useTone } from '@/lib/tone';

const LEVEL_COLOR_LIGHT = { info: colors.primary, caution: colors.caution, warning: colors.warning } as const;
const LEVEL_COLOR_DARK = { info: '#CFE1FF', caution: '#FFD9A0', warning: '#FFB3BE' } as const;
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// 얇음(따뜻한 색) → 두꺼움(짙은 파랑)
const METER_LIGHT = ['', '#FFB547', '#FFC56E', '#9BD4B5', '#7CC4A4', '#6FAEF9', '#5B9BF8', '#4F86F7', '#4A6CF7', '#3E55DD', '#3343C9'];
const METER_DARK = ['', '#FFD27A', '#FFDC96', '#BDEBD3', '#A9E8CB', '#B9D6FF', '#A9CBFF', '#B5CBFF', '#C3CEFF', '#D3D8FF', '#E3E6FF'];

/** 옷 두께 게이지: "옷 두께 · 보통 (6/10)" + 10칸 막대 (기온 구간 13단계에 맞춘 세분화) */
export function ThicknessMeter({ level }: { level: number }) {
  const t = useTone();
  const fill = (t.dark ? METER_DARK : METER_LIGHT)[level];
  return (
    <View style={s.meter} accessibilityLabel={`옷 두께 ${THICKNESS_LABEL[level]}, 10단계 중 ${level}단계`}>
      <View style={s.meterHead}>
        <Text style={[s.meterTitle, { color: t.sub }]}>옷 두께</Text>
        <Text style={[s.meterValue, { color: t.text }]}>
          {THICKNESS_LABEL[level]} <Text style={{ color: t.faint, fontWeight: '500' }}>({level}/10)</Text>
        </Text>
      </View>
      <View style={s.meterRow}>
        {LEVELS.map((i) => (
          <View key={i} style={[s.meterBar, { backgroundColor: i <= level ? fill : t.line }]} />
        ))}
      </View>
    </View>
  );
}

function Stat({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  const t = useTone();
  return (
    <View style={s.stat}>
      <Text style={[s.statLabel, { color: t.faint }]}>{label}</Text>
      <Text style={[s.statValue, { color: strong ? (t.dark ? '#FFFFFF' : colors.primary) : t.text }, strong && s.statStrong]}>{Math.round(value)}°</Text>
    </View>
  );
}

export function OutfitCard({
  member,
  rec,
  onPress,
  onEdit,
  subtitle,
}: {
  member: FamilyMember;
  rec: OutfitRecommendation;
  onPress?: () => void;
  /** 구성원 정보(온도감·체형 등) 바로 수정 */
  onEdit?: () => void;
  /** 관계 표시 대신 보여줄 짧은 설명 (예: "성인 평균 기준") */
  subtitle?: string;
}) {
  const t = useTone();
  const generic = member.id === 'generic';
  const topAlert = rec.alerts.find((a) => a.level === 'warning') ?? rec.alerts[0];
  const AlertIcon = topAlert ? alertIconFor(topAlert) : null;
  const alertColor = topAlert ? (t.dark ? LEVEL_COLOR_DARK : LEVEL_COLOR_LIGHT)[topAlert.level] : t.text;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [s.card, { backgroundColor: t.card }, pressed && onPress && { opacity: 0.85 }]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={s.header}>
        <Avatar name={member.name} relation={member.relation} generic={generic} size={42} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={s.nameRow}>
            <Text style={[s.name, { color: t.text }]}>{member.name}</Text>
            <Text style={[s.rel, { color: t.faint }]}>{subtitle ?? RELATION_LABEL[member.relation]}</Text>
          </View>
          <Text style={[s.headline, { color: t.sub }]}>{rec.headline}</Text>
        </View>
        {onEdit ? (
          <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${member.name} 정보 수정`} style={[s.editBtn, { backgroundColor: t.chip }]}>
            <Icons.Pencil size={14} color={t.sub} weight="bold" />
            <Text style={[s.edit, { color: t.sub }]}>수정</Text>
          </Pressable>
        ) : null}
      </View>

      {/* 기온 · 체감 · 개인 체감 */}
      <View style={[s.stats, { backgroundColor: t.chip }]}>
        <Stat label="기온" value={rec.temp} />
        <View style={[s.statDivider, { backgroundColor: t.line }]} />
        <Stat label="체감" value={rec.feelsLike} />
        <View style={[s.statDivider, { backgroundColor: t.line }]} />
        <Stat label={generic ? '기준 체감' : '개인 체감'} value={rec.personalFeelsLike} strong />
      </View>

      <ThicknessMeter level={rec.thickness} />
      <OutfitItems rec={rec} compact />

      {topAlert && AlertIcon ? (
        <View style={s.alert}>
          <AlertIcon size={16} color={alertColor} weight="fill" />
          <Text style={[s.alertText, { color: alertColor }]} numberOfLines={2}>
            {topAlert.message}
            {rec.alerts.length > 1 ? `  외 ${rec.alerts.length - 1}건` : ''}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  name: { fontSize: 17, fontWeight: '700' },
  rel: { fontSize: 13, fontWeight: '500' },
  headline: { fontSize: 14, marginTop: 2 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  edit: { fontSize: 12, fontWeight: '600' },
  stats: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingVertical: 10, marginTop: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, height: 28 },
  statLabel: { fontSize: 11, fontWeight: '600' },
  statValue: { fontSize: 18, fontWeight: '600', marginTop: 2 },
  statStrong: { fontSize: 22, fontWeight: '800' },
  meter: { marginTop: 14, marginBottom: 8 },
  meterHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  meterTitle: { fontSize: 12, fontWeight: '600' },
  meterValue: { fontSize: 14, fontWeight: '700' },
  meterRow: { flexDirection: 'row', gap: 3 },
  meterBar: { flex: 1, height: 6, borderRadius: 3 },
  alert: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  alertText: { fontSize: 13, fontWeight: '600', flex: 1 },
});
