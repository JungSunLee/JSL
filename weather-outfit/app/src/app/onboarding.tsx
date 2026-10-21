import {
  ACTIVITY_LABEL,
  BODY_TYPE_LABEL,
  SENSITIVITY_LABEL,
  SEX_LABEL,
  type Activity,
  type BodyType,
  type Sex,
  type ThermalSensitivity,
  type UserProfile,
} from '@wo/core';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button, Chip } from '@/components/ui';
import { ApiError } from '@/lib/api';
import { colors, radius } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';
import { analytics } from '@/lib/analytics';
import { useScreenView } from '@/lib/useScreenView';

const BODY_TYPES: { id: BodyType; emoji: string }[] = [
  { id: 'slim', emoji: '🧍' },
  { id: 'average', emoji: '🙂' },
  { id: 'muscular', emoji: '💪' },
  { id: 'heavy', emoji: '🐻' },
];
const SENS: { v: ThermalSensitivity; emoji: string }[] = [
  { v: -2, emoji: '🥶' },
  { v: -1, emoji: '🧣' },
  { v: 0, emoji: '😊' },
  { v: 1, emoji: '🌤️' },
  { v: 2, emoji: '🥵' },
];
const ACTIVITIES = Object.keys(ACTIVITY_LABEL) as Activity[];
const SEXES = Object.keys(SEX_LABEL) as Sex[];

/** 로그인 직후 1회 + 설정에서 수정. 옷차림 추천에 쓰는 본인 정보 */
export default function Onboarding() {
  useScreenView('onboarding');
  const { user, ready } = useAuth();
  if (!ready) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!user) return <Redirect href="/login" />;
  return <ProfileForm initial={user.profile} initialName={user.name} firstTime={user.needsOnboarding} />;
}

function ProfileForm({ initial, initialName, firstTime }: { initial: UserProfile | null; initialName: string; firstTime: boolean }) {
  const { saveProfile } = useAuth();
  const thisYear = new Date().getFullYear();
  const [name, setName] = useState(initialName);
  const [year, setYear] = useState(initial ? String(initial.birthYear) : '');
  const [sex, setSex] = useState<Sex | undefined>(initial?.sex);
  const [height, setHeight] = useState(initial?.heightCm ? String(initial.heightCm) : '');
  const [weight, setWeight] = useState(initial?.weightKg ? String(initial.weightKg) : '');
  const [bodyType, setBodyType] = useState<BodyType | undefined>(initial?.bodyType);
  const [sensitivity, setSensitivity] = useState<ThermalSensitivity | undefined>(initial?.sensitivity);
  const [activity, setActivity] = useState<Activity>(initial?.activity ?? 'commute');
  const [consent, setConsent] = useState(!firstTime);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const num = (v: string) => (v.trim() ? Number(v.replace(',', '.')) : undefined);

  const submit = async () => {
    const e: Record<string, string> = {};
    const by = Number(year);
    if (!Number.isInteger(by) || by < thisYear - 110 || by > thisYear) e.birthYear = '출생연도 4자리를 입력해 주세요';
    const h = num(height);
    const w = num(weight);
    if (h !== undefined && !(h >= 40 && h <= 230)) e.heightCm = '키를 확인해 주세요 (cm)';
    if (w !== undefined && !(w >= 2 && w <= 250)) e.weightKg = '몸무게를 확인해 주세요 (kg)';
    if (!bodyType) e.bodyType = '체형을 골라주세요';
    if (sensitivity === undefined) e.sensitivity = '온도감을 골라주세요';
    if (!consent) e.consent = '정보 이용에 동의해 주세요';
    setErrors(e);
    if (Object.keys(e).length) return;

    setSaving(true);
    try {
      await saveProfile(
        { birthYear: by, sex, heightCm: h, weightKg: w, bodyType: bodyType!, sensitivity: sensitivity!, activity },
        { consent: true, name: name.trim() || undefined },
      );
      analytics.event(firstTime ? 'onboarding_complete' : 'profile_updated', 'onboarding');
      if (router.canGoBack()) router.back();
      else router.replace('/');
    } catch (err) {
      if (err instanceof ApiError && err.fields) setErrors(err.fields);
      else Alert.alert('저장하지 못했어요', '잠시 후 다시 시도해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  const Err = ({ k }: { k: string }) => (errors[k] ? <Text style={s.err}>{errors[k]}</Text> : null);

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
        {firstTime ? (
          <View style={s.intro}>
            <Text style={s.introTitle}>반가워요! 👋</Text>
            <Text style={s.introBody}>같은 날씨도 사람마다 다르게 느껴요.{'\n'}몇 가지만 알려주시면 나에게 맞는 옷차림를 추천해 드릴게요.</Text>
          </View>
        ) : null}

        <Text style={s.label}>이름 (앱에서 부를 이름)</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} maxLength={20} placeholder="예: 지은" />

        <Text style={s.label}>출생연도</Text>
        <TextInput style={s.input} value={year} onChangeText={setYear} keyboardType="number-pad" maxLength={4} placeholder="예: 1990" />
        <Err k="birthYear" />

        <Text style={s.label}>성별 (선택)</Text>
        <View style={s.row}>
          {SEXES.map((x) => (
            <Chip key={x} label={SEX_LABEL[x]} selected={sex === x} onPress={() => setSex(sex === x ? undefined : x)} />
          ))}
        </View>

        <View style={s.twoCol}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={s.label}>키 (선택)</Text>
            <View style={s.unitInput}>
              <TextInput style={s.unitField} value={height} onChangeText={setHeight} keyboardType="decimal-pad" maxLength={5} placeholder="165" />
              <Text style={s.unit}>cm</Text>
            </View>
            <Err k="heightCm" />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={s.label}>몸무게 (선택)</Text>
            <View style={s.unitInput}>
              <TextInput style={s.unitField} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" maxLength={5} placeholder="58" />
              <Text style={s.unit}>kg</Text>
            </View>
            <Err k="weightKg" />
          </View>
        </View>
        <Text style={s.hint}>키·몸무게를 알려주시면 체형을 더 정확히 반영해요.</Text>

        <Text style={s.label}>체형</Text>
        <View style={s.grid}>
          {BODY_TYPES.map((b) => (
            <Pressable key={b.id} onPress={() => setBodyType(b.id)} style={[s.tile, bodyType === b.id && s.tileOn]} accessibilityRole="button" accessibilityState={{ selected: bodyType === b.id }}>
              <Text style={s.tileEmoji}>{b.emoji}</Text>
              <Text style={[s.tileText, bodyType === b.id && s.tileTextOn]}>{BODY_TYPE_LABEL[b.id]}</Text>
            </Pressable>
          ))}
        </View>
        <Err k="bodyType" />

        <Text style={s.label}>온도감 — 평소 어떤 편인가요?</Text>
        {SENS.map((o) => (
          <Pressable key={o.v} onPress={() => setSensitivity(o.v)} style={[s.option, sensitivity === o.v && s.tileOn]} accessibilityRole="button" accessibilityState={{ selected: sensitivity === o.v }}>
            <Text style={s.optionEmoji}>{o.emoji}</Text>
            <Text style={[s.optionText, sensitivity === o.v && s.tileTextOn]}>{SENSITIVITY_LABEL[o.v]}</Text>
          </Pressable>
        ))}
        <Err k="sensitivity" />

        <Text style={s.label}>하루 활동</Text>
        <View style={s.row}>
          {ACTIVITIES.map((a) => (
            <Chip key={a} label={ACTIVITY_LABEL[a]} selected={activity === a} onPress={() => setActivity(a)} />
          ))}
        </View>

        {firstTime ? (
          <Pressable onPress={() => setConsent(!consent)} style={s.consent} accessibilityRole="checkbox" accessibilityState={{ checked: consent }}>
            <Text style={s.check}>{consent ? '☑️' : '⬜️'}</Text>
            <Text style={s.consentText}>
              [필수] 키·몸무게·체형·온도감 정보를 옷차림 추천 목적으로 수집·이용하는 데 동의합니다. 정보는 탈퇴 시 즉시 삭제됩니다.
            </Text>
          </Pressable>
        ) : null}
        <Err k="consent" />

        <View style={{ height: 20 }} />
        <Button title={saving ? '저장 중…' : firstTime ? '옷차림 추천 시작하기' : '저장'} onPress={submit} disabled={saving} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 48 },
  intro: { backgroundColor: '#EEF3FF', borderRadius: radius.md, padding: 16, marginBottom: 4 },
  introTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  introBody: { fontSize: 14, color: colors.sub, marginTop: 6, lineHeight: 21 },
  label: { fontSize: 14, fontWeight: '700', color: colors.sub, marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  twoCol: { flexDirection: 'row' },
  unitInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14 },
  unitField: { flex: 1, minWidth: 0, width: '100%', paddingVertical: 12, fontSize: 16, color: colors.text },
  unit: { fontSize: 15, color: colors.faint, marginLeft: 6, flexShrink: 0 },
  hint: { fontSize: 12, color: colors.faint, marginTop: 6 },
  grid: { flexDirection: 'row', justifyContent: 'space-between' },
  tile: { width: '23.5%', alignItems: 'center', paddingVertical: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  tileOn: { borderColor: colors.primary, backgroundColor: '#EEF3FF' },
  tileEmoji: { fontSize: 26 },
  tileText: { fontSize: 13, color: colors.text, marginTop: 4 },
  tileTextOn: { color: colors.primary, fontWeight: '700' },
  option: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, marginBottom: 8 },
  optionEmoji: { fontSize: 22, marginRight: 12 },
  optionText: { fontSize: 15, color: colors.text },
  consent: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 24, backgroundColor: colors.card, borderRadius: radius.sm, padding: 12 },
  check: { fontSize: 18, marginRight: 8 },
  consentText: { flex: 1, fontSize: 13, color: colors.sub, lineHeight: 19 },
  err: { color: colors.warning, fontSize: 12, marginTop: 6 },
});
