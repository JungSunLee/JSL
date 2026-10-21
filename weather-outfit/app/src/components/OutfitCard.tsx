import { RELATION_LABEL, type FamilyMember, type OutfitRecommendation } from '@wo/core';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, THICKNESS_LABEL } from '@/lib/theme';
import { Chip } from './ui';

const LEVEL_COLOR = { info: colors.primary, caution: colors.caution, warning: colors.warning } as const;

export function ThicknessMeter({ level }: { level: number }) {
  return (
    <View style={s.meterRow} accessibilityLabel={`옷 두께 ${THICKNESS_LABEL[level]}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={[s.meterBar, i <= level && { backgroundColor: meterColor(level) }]} />
      ))}
      <Text style={s.meterLabel}>{THICKNESS_LABEL[level]}</Text>
    </View>
  );
}

function meterColor(level: number) {
  return ['#000', '#FFB547', '#7CC4A4', '#5B9BF8', '#4A6CF7', '#3343C9'][level];
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
  const topAlert = rec.alerts.find((a) => a.level === 'warning') ?? rec.alerts[0];
  return (
    <Pressable onPress={onPress} disabled={!onPress} style={({ pressed }) => [s.card, pressed && onPress && { opacity: 0.85 }]} accessibilityRole={onPress ? 'button' : undefined}>
      <View style={s.header}>
        <Text style={s.avatar}>{member.emoji ?? '🙂'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.name}>
            {member.name} <Text style={s.rel}>{subtitle ?? RELATION_LABEL[member.relation]}</Text>
          </Text>
          <Text style={s.headline}>{rec.headline}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={s.feels}>{Math.round(rec.personalFeelsLike)}°</Text>
          {onEdit ? (
            <Pressable onPress={onEdit} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${member.name} 정보 수정`}>
              <Text style={s.edit}>정보 수정</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <ThicknessMeter level={rec.thickness} />
      <View style={s.items}>
        {rec.items.map((i) => (
          <Chip key={`${i.slot}-${i.category}-${i.name}`} label={i.name} tone="soft" />
        ))}
      </View>
      {topAlert ? (
        <Text style={[s.alert, { color: LEVEL_COLOR[topAlert.level] }]}>
          {topAlert.icon} {topAlert.message}
          {rec.alerts.length > 1 ? `  외 ${rec.alerts.length - 1}건` : ''}
        </Text>
      ) : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: radius.md, padding: 16, marginBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center' },
  avatar: { fontSize: 34, marginRight: 12 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  rel: { fontSize: 13, fontWeight: '400', color: colors.faint },
  headline: { fontSize: 14, color: colors.sub, marginTop: 2 },
  feels: { fontSize: 22, fontWeight: '700', color: colors.primary },
  edit: { fontSize: 12, color: colors.faint, textDecorationLine: 'underline', marginTop: 2 },
  meterRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 10 },
  meterBar: { flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.line, marginRight: 4 },
  meterLabel: { fontSize: 12, color: colors.sub, marginLeft: 6, width: 64 },
  items: { flexDirection: 'row', flexWrap: 'wrap' },
  alert: { fontSize: 13, marginTop: 6, fontWeight: '600' },
});
