import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '@/lib/theme';
import { useTone } from '@/lib/tone';

/** 카드. 밝은 화면에서는 흰 카드+옅은 그림자, 몰입형(어두운) 화면에서는 반투명 유리 카드 */
export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTone();
  return <View style={[styles.card, t.dark ? { backgroundColor: t.card, shadowOpacity: 0, elevation: 0 } : null, style]}>{children}</View>;
}

export function SectionTitle({ children, right }: { children: ReactNode; right?: ReactNode }) {
  const t = useTone();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.section, { color: t.text }]}>{children}</Text>
      {right}
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
  tone = 'default',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: 'default' | 'soft';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={onPress ? { selected: !!selected } : undefined}
      style={[styles.chip, tone === 'soft' && styles.chipSoft, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled,
  icon,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  /** 제목 왼쪽에 붙는 아이콘 */
  icon?: ReactNode;
}) {
  const t = useTone();
  const bg = variant === 'primary' ? (t.dark ? '#FFFFFF' : colors.primary) : 'transparent';
  const border = variant === 'ghost' ? t.line : variant === 'danger' ? (t.dark ? 'rgba(255,179,190,0.6)' : '#F3C4CB') : 'transparent';
  const fg = variant === 'primary' ? (t.dark ? colors.primary : '#FFFFFF') : variant === 'danger' ? (t.dark ? '#FFB3BE' : colors.warning) : t.dark ? '#FFFFFF' : colors.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [styles.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'primary' ? 0 : 1 }, (pressed || disabled) && { opacity: 0.6 }]}
    >
      {icon}
      <Text style={[styles.btnText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    shadowColor: '#1B2A4A',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, marginBottom: 10 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.card,
    marginRight: 6,
    marginBottom: 6,
  },
  chipSoft: { backgroundColor: '#F1F4F9', borderColor: '#F1F4F9' },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, color: colors.text },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, borderRadius: radius.sm + 2, paddingVertical: 14 },
  btnText: { fontSize: 16, fontWeight: '700' },
});
