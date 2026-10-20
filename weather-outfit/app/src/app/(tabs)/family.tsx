import { ageOf, CONDITION_LABEL, RELATION_LABEL, SENSITIVITY_LABEL } from '@wo/core';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card } from '@/components/ui';
import { colors, radius } from '@/lib/theme';
import { useFamily } from '@/state/FamilyContext';
import { OutfitGate } from '@/components/LoginPrompt';
import { useAuth } from '@/state/AuthContext';

export default function Family() {
  const { members } = useFamily();
  const { user } = useAuth();
  const ready = !!user?.profile;
  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.title}>우리 가족</Text>
        <Text style={s.sub}>구성원별로 체감 온도를 다르게 계산해 코디를 추천해요.</Text>
        {!ready ? <OutfitGate what="우리 가족 맞춤 코디" /> : null}
        {ready && members.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => router.push({ pathname: '/member/edit', params: { id: m.id } })}
            style={s.row}
            accessibilityRole="button"
          >
            <Text style={s.avatar}>{m.emoji ?? '🙂'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.name}>
                {m.name} <Text style={s.meta}>{RELATION_LABEL[m.relation]} · {ageOf(m.birthYear)}세</Text>
              </Text>
              <Text style={s.meta}>
                {SENSITIVITY_LABEL[m.sensitivity]}
                {m.conditions.length ? ` · ${m.conditions.map((c) => CONDITION_LABEL[c].split(' ')[0]).join(', ')}` : ''}
              </Text>
            </View>
            <Text style={s.chev}>›</Text>
          </Pressable>
        ))}
        {ready ? (
        <Card style={{ marginTop: 8 }}>
          <Button title="+ 가족 구성원 추가" onPress={() => router.push('/member/edit')} />
          <Text style={s.hint}>
            💡 건강앱(Apple 건강·Health Connect) 연동은 다음 버전에서 지원 예정이에요. 지금은 추위·더위를 타는 정도를 직접 선택해 주세요.
          </Text>
        </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4 },
  sub: { fontSize: 14, color: colors.sub, marginTop: 4, marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: 14, marginBottom: 10 },
  avatar: { fontSize: 32, marginRight: 12 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.sub, fontWeight: '400', marginTop: 2 },
  chev: { fontSize: 26, color: colors.faint },
  hint: { fontSize: 12, color: colors.sub, marginTop: 12, lineHeight: 18 },
});
