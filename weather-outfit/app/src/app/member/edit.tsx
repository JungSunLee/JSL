import {
  ACTIVITY_LABEL,
  CONDITION_LABEL,
  RELATION_LABEL,
  SENSITIVITY_LABEL,
  type Activity,
  type FamilyMember,
  type HealthCondition,
  type Relation,
  type ThermalSensitivity,
} from '@wo/core';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip } from '@/components/ui';
import { colors, radius } from '@/lib/theme';
import { useFamily } from '@/state/FamilyContext';

const EMOJIS = ['🙂', '👩', '👨', '👵', '👴', '👧', '👦', '👶', '🧒', '🤰'];
const RELATIONS = Object.keys(RELATION_LABEL) as Relation[];
const SENS: ThermalSensitivity[] = [-2, -1, 0, 1, 2];
const ACTIVITIES = Object.keys(ACTIVITY_LABEL) as Activity[];
const CONDITIONS = Object.keys(CONDITION_LABEL) as HealthCondition[];

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export default function EditMember() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { ready, members } = useFamily();
  // 저장소 로딩 전에 폼을 만들면 기존 구성원이 새 구성원으로 보이므로 로딩을 기다린다
  if (!ready) return <ActivityIndicator style={{ marginTop: 40 }} />;
  return <MemberForm key={id ?? 'new'} existing={members.find((m) => m.id === id)} />;
}

function MemberForm({ existing }: { existing?: FamilyMember }) {
  const { members, upsert, remove, healthConsent, setHealthConsent } = useFamily();
  const thisYear = new Date().getFullYear();

  const [m, setM] = useState<FamilyMember>(
    existing ?? {
      id: newId(),
      name: members.length === 0 ? '나' : '',
      relation: members.length === 0 ? 'me' : 'child',
      birthYear: thisYear - 35,
      sensitivity: 0,
      conditions: [],
      activity: 'commute',
      emoji: '🙂',
    },
  );
  const [yearText, setYearText] = useState(String(m.birthYear));
  const [tempText, setTempText] = useState(m.bodyTempC != null ? String(m.bodyTempC) : '');
  const set = <K extends keyof FamilyMember>(k: K, v: FamilyMember[K]) => setM((p) => ({ ...p, [k]: v }));

  const save = async () => {
    const year = Number(yearText);
    if (!m.name.trim()) return Alert.alert('이름을 입력해 주세요');
    if (!Number.isInteger(year) || year < thisYear - 110 || year > thisYear) return Alert.alert('출생연도를 확인해 주세요');
    const t = tempText ? Number(tempText) : undefined;
    if (t != null && (!Number.isFinite(t) || t < 34 || t > 42)) return Alert.alert('체온은 34~42℃ 사이로 입력해 주세요');
    await upsert({ ...m, name: m.name.trim(), birthYear: year, bodyTempC: healthConsent ? t : undefined, conditions: healthConsent ? m.conditions : [] });
    router.back();
  };

  const toggleCondition = (c: HealthCondition) =>
    set('conditions', m.conditions.includes(c) ? m.conditions.filter((x) => x !== c) : [...m.conditions, c]);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        <Text style={s.label}>프로필</Text>
        <View style={s.wrapRow}>
          {EMOJIS.map((e) => (
            <Chip key={e} label={e} selected={m.emoji === e} onPress={() => set('emoji', e)} />
          ))}
        </View>

        <Text style={s.label}>이름</Text>
        <TextInput style={s.input} value={m.name} onChangeText={(v) => set('name', v)} placeholder="예: 엄마, 첫째" maxLength={12} />

        <Text style={s.label}>관계</Text>
        <View style={s.wrapRow}>
          {RELATIONS.map((r) => (
            <Chip key={r} label={RELATION_LABEL[r]} selected={m.relation === r} onPress={() => set('relation', r)} />
          ))}
        </View>

        <Text style={s.label}>출생연도</Text>
        <TextInput style={s.input} value={yearText} onChangeText={setYearText} keyboardType="number-pad" maxLength={4} />

        <Text style={s.label}>추위·더위</Text>
        <View style={s.wrapRow}>
          {SENS.map((v) => (
            <Chip key={v} label={SENSITIVITY_LABEL[v]} selected={m.sensitivity === v} onPress={() => set('sensitivity', v)} />
          ))}
        </View>

        <Text style={s.label}>하루 활동</Text>
        <View style={s.wrapRow}>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={ACTIVITY_LABEL[a]} selected={m.activity === a} onPress={() => set('activity', a)} />
          ))}
        </View>

        <Text style={s.label}>건강 상태 (선택)</Text>
        {healthConsent ? (
          <>
            <View style={s.wrapRow}>
              {CONDITIONS.map((c) => (
                <Chip key={c} label={CONDITION_LABEL[c]} selected={m.conditions.includes(c)} onPress={() => toggleCondition(c)} />
              ))}
            </View>
            <Text style={s.label}>오늘 체온 (선택, ℃)</Text>
            <TextInput style={s.input} value={tempText} onChangeText={setTempText} keyboardType="decimal-pad" placeholder="예: 36.5" maxLength={4} />
          </>
        ) : (
          <View style={s.consent}>
            <Text style={s.consentText}>
              천식·아토피·임신 등 건강 상태를 반영하려면 민감정보 수집·이용 동의가 필요해요. 정보는 이 기기에만 저장되고 코디 추천에만 쓰여요.
            </Text>
            <Button title="동의하고 입력하기" variant="ghost" onPress={() => setHealthConsent(true)} />
          </View>
        )}

        <View style={{ height: 24 }} />
        <Button title="저장" onPress={save} />
        {existing ? (
          <>
            <View style={{ height: 10 }} />
            <Button
              title="삭제"
              variant="danger"
              onPress={async () => {
                await remove(existing.id);
                router.back();
              }}
            />
          </>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 48 },
  label: { fontSize: 14, fontWeight: '700', color: colors.sub, marginTop: 18, marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  input: { backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  consent: { backgroundColor: '#FFF8EC', borderRadius: radius.sm, padding: 14 },
  consentText: { fontSize: 13, color: '#7A5600', lineHeight: 19, marginBottom: 10 },
});
