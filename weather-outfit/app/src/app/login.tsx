import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api, type ProviderId } from '@/lib/api';
import { colors, radius } from '@/lib/theme';
import { LoginError, useAuth } from '@/state/AuthContext';
import { analytics } from '@/lib/analytics';
import { useScreenView } from '@/lib/useScreenView';

const BUTTONS: { id: ProviderId; label: string; bg: string; fg: string; mark: string; border?: string }[] = [
  { id: 'kakao', label: '카카오로 시작하기', bg: colors.kakao, fg: colors.kakaoText, mark: '💬' },
  { id: 'naver', label: '네이버로 시작하기', bg: colors.naver, fg: '#fff', mark: 'N' },
  { id: 'google', label: 'Google로 시작하기', bg: '#fff', fg: '#1F1F1F', mark: 'G', border: '#DADCE0' },
];

const DEV_BUTTON = { id: 'dev' as const, label: '개발용 테스트 로그인', bg: '#EEF0F4', fg: colors.sub, mark: '🛠', border: '#EEF0F4' };

export default function Login() {
  useScreenView('login');
  const { signIn } = useAuth();
  const [enabled, setEnabled] = useState<Record<string, boolean> | null>(null);
  const [busy, setBusy] = useState<ProviderId | null>(null);

  useEffect(() => {
    api
      .providers()
      .then((list) => setEnabled(Object.fromEntries(list.map((p) => [p.id, p.enabled]))))
      .catch(() => setEnabled({}));
  }, []);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const onLogin = async (id: ProviderId) => {
    analytics.tap('login', `provider_${id}`);
    if (enabled && !enabled[id]) {
      Alert.alert('준비 중', '아직 이 로그인 방식이 서버에 설정되지 않았어요.');
      return;
    }
    setBusy(id);
    try {
      const me = await signIn(id);
      if (!me) return;
      analytics.event(me.needsOnboarding ? 'signup' : 'login_success', 'login', { provider: id });
      if (me.needsOnboarding) router.replace('/onboarding');
      else close();
    } catch (e) {
      const suspended = e instanceof LoginError && e.message === 'suspended';
      Alert.alert('로그인 실패', suspended ? '이용이 제한된 계정이에요. 고객센터로 문의해 주세요.' : '잠시 후 다시 시도해 주세요.');
    } finally {
      setBusy(null);
    }
  };

  const buttons = enabled?.dev ? [...BUTTONS, DEV_BUTTON] : BUTTONS;

  return (
    <SafeAreaView style={s.wrap}>
      <Pressable onPress={close} style={s.closeBtn} accessibilityRole="button" accessibilityLabel="닫기">
        <Text style={s.close}>✕</Text>
      </Pressable>
      <View style={s.brand}>
        <Text style={s.logo}>🌤️👕</Text>
        <Text style={s.title}>날씨를 입다</Text>
        <Text style={s.subtitle}>로그인하면 내 체형과 온도감에 맞춘{'\n'}오늘 입을 옷을 추천해 드려요</Text>
      </View>
      <View>
        {buttons.map((b) => (
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
        <Text style={s.legal}>가입 시 이용약관 및 개인정보처리방침에 동의하게 됩니다.{'\n'}날씨는 로그인 없이도 볼 수 있어요.</Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: colors.bg, padding: 24, justifyContent: 'space-between' },
  closeBtn: { alignSelf: 'flex-end', padding: 8 },
  close: { fontSize: 22, color: colors.sub },
  brand: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 64 },
  title: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: 12 },
  subtitle: { fontSize: 17, color: colors.sub, textAlign: 'center', marginTop: 10, lineHeight: 25 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 52, borderRadius: radius.sm, marginBottom: 10, borderWidth: 1 },
  mark: { position: 'absolute', left: 20, fontSize: 18, fontWeight: '800' },
  btnText: { fontSize: 16, fontWeight: '700' },
  legal: { fontSize: 11, color: colors.faint, textAlign: 'center', lineHeight: 16, marginTop: 8 },
});
