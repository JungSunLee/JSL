import type { Relation } from '@wo/core';
import { StyleSheet, Text, View } from 'react-native';
import { Icons } from './icons';
import { useTone } from '@/lib/tone';

/**
 * 구성원 아바타. 이모지 대신 이름 첫 글자를 색 원 안에 보여준다 (관계별 색).
 * 로그인 전 "성인 평균" 같은 일반 기준은 사람 아이콘.
 */
const RELATION_COLOR: Record<Relation, string> = {
  me: '#3A6FF7',
  spouse: '#E26AA3',
  father: '#2E9E8F',
  mother: '#E58A00',
  child: '#8B5CF6',
  grandparent: '#6B7A90',
  other: '#5B6676',
};

export function Avatar({ name, relation, size = 40, generic = false }: { name: string; relation: Relation; size?: number; generic?: boolean }) {
  const t = useTone();
  const color = RELATION_COLOR[relation] ?? RELATION_COLOR.other;
  const bg = t.dark ? 'rgba(255,255,255,0.18)' : `${color}22`;
  const fg = t.dark ? '#FFFFFF' : color;
  const initial = (name.trim()[0] ?? '?').toUpperCase();
  return (
    <View style={[s.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]} accessibilityLabel={name}>
      {generic ? (
        <Icons.UserCircle size={size * 0.62} color={fg} weight="fill" />
      ) : (
        <Text style={[s.text, { color: fg, fontSize: size * 0.42 }]}>{initial}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800' },
});
