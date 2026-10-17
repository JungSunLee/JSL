import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, type ProviderId } from '@/lib/api';
import { colors, radius } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';

const BUTTONS: { id: ProviderId; label: string; bg: string; fg: string; mark: string; border?: string }[] = [
  { id: 'kakao', label: '카카오로 시작하기', bg: colors.kakao, fg: colors.kakaoText, mark: '💬' },
  { id: 'naver', label: '네이버로 시작하기', bg: colors.naver, fg: '#fff', mark: 'N' },
  { id: 'google', label: 'Google로 시작하기', bg: '#fff', fg: '#1F1F1F', mark: 'G', border: '#DADCE0' },
];

export default function Login() {
  const { signIn, continueAsGuest } = useAuth();
  const [enabled, setEnabled] = useState<Record<string, boolean> | null>(null);
  const [busy, setBusy] = useState<ProviderId | null>(null);

  useEffect(() => {
    api
      .providers()
      .then((list) => setEnabled(Object.fromEntries(list.map((p) => [p.id, p.enabled]))))
      .catch(() => setEnabled({}));
  }, []);

  const onLogin = async (id: ProviderId) => {
    if (enabled && !enabled[id]) {
      Alert.alert('준비 중', '서버에 이 로그인 키가 아직 설정되지 않았어요. 둘러보기로 먼저 이용해 보세요.');
      return;
    }
    setBusy(id);
    try {
      await signIn(id);
      router.replace('/');
    } catch {
      Alert.alert('로그인 실패', '잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(null);
    }
  };

  return (
    <SafeAreaView style={s.wrap}>
      <View style={s.brand}>
        <Text style={s.logo}>🌤️👕</Text>
        <Text style={s.title}>우리집 옷날씨</Text>
        <Text style={s.subtitle}>오늘 날씨에 맞춰{'\n'}우리 가족 옷차림을 챙겨드려요</Text>
      </View>
      <View>
        {BUTTONS.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => onLogin(b.id)}
            disabled={busy !== null}
            accessibilityRole="button"
            style={({ pressed }) => [s.btn, { backgroundColor: b.bg, borderColor: b.border ?? b.bg }, pressed && { opacity: 0.8 }]}
          >
            {busy === b.id ? (
              <ActivityIndicator color={b.fg} />
            ) : (
              <>
                <Text style={[s.mark, { color: b.fg }]}>{b.mark}</Text>
                <Text style={[s.btnText, { color: b.fg }]}>{b.label}</Text>
              </>
            )}
          </Pressable>
        ))}
        <Pressable
          onPress={async () => {
            await continueAsGuest();
            router.replace('/');
          }}
          style={s.guest}
          accessibilityRole="button"
        >
          <Text style={s.guestText}>로그인 없이 둘러보기</Text>
        </Pressable>
        <Text style={s.legal}>가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.{'\n'}가족 건강 정보는 기기에만 저장돼요.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'space-between' },
  brand: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 64 },
  title: { fontSize: 34, fontWeight: '800', color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 17, color: colors.sub, textAlign: 'center', marginTop: 10, lineHeight: 25 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: radius.sm, marginBottom: 10, borderWidth: 1 },
  mark: { position: 'absolute', left: 20, fontSize: 18, fontWeight: '800' },
  btnText: { fontSize: 16, fontWeight: '700' },
  guest: { alignItems: 'center', paddingVertical: 14 },
  guestText: { color: colors.sub, fontSize: 15, textDecorationLine: 'underline' },
  legal: { fontSize: 11, color: colors.faint, textAlign: 'center', lineHeight: 16, marginTop: 4 },
});
