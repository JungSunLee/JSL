import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, SectionTitle } from '@/components/ui';
import { API_BASE_URL } from '@/lib/config';
import { colors } from '@/lib/theme';
import { useAuth } from '@/state/AuthContext';
import { useFamily } from '@/state/FamilyContext';

import { BODY_TYPE_LABEL, SENSITIVITY_LABEL } from '@wo/core';

const PROVIDER_LABEL = { naver: '네이버', kakao: '카카오', google: 'Google', dev: '테스트' } as const;

export default function Settings() {
  const { user, signOut, deleteAccount } = useAuth();
  const { healthConsent, setHealthConsent } = useFamily();


  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.title}>설정</Text>

        <SectionTitle>계정</SectionTitle>
        <Card>
          {user ? (
            <>
              <Text style={s.name}>{user.name}</Text>
              <Text style={s.meta}>
                {user.providers.map((p) => PROVIDER_LABEL[p]).join(', ')} 계정{user.email ? ` · ${user.email}` : ''}
              </Text>
              {user.profile ? (
                <Text style={s.meta}>
                  {user.profile.birthYear}년생 · {user.profile.heightCm ? `${user.profile.heightCm}cm · ` : ''}
                  {user.profile.weightKg ? `${user.profile.weightKg}kg · ` : ''}
                  {BODY_TYPE_LABEL[user.profile.bodyType]} · {SENSITIVITY_LABEL[user.profile.sensitivity]}
                </Text>
              ) : null}
              <View style={{ height: 12 }} />
              <Button title={user.profile ? '내 정보 수정' : '내 정보 입력하기'} onPress={() => router.push('/onboarding')} />
              <View style={{ height: 8 }} />
              <Button title="로그아웃" variant="ghost" onPress={signOut} />
              <View style={{ height: 8 }} />
              <Button
                title="회원 탈퇴"
                variant="danger"
                onPress={() =>
                  Alert.alert('회원 탈퇴', '계정 정보가 삭제됩니다. 계속할까요?', [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '탈퇴',
                      style: 'destructive',
                      onPress: async () => {
                        await deleteAccount();
                      },
                    },
                  ])
                }
              />
            </>
          ) : (
            <>
              <Text style={s.name}>로그인하지 않았어요</Text>
              <Text style={s.meta}>날씨는 그대로 볼 수 있어요. 로그인하면 내 체형·온도감에 맞춘 코디를 추천받을 수 있어요.</Text>
              <View style={{ height: 12 }} />
              <Button title="카카오·네이버·구글로 로그인" onPress={() => router.push('/login')} />
            </>
          )}
        </Card>

        <SectionTitle>개인정보</SectionTitle>
        <Card>
          <View style={s.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={s.label}>건강 정보 수집·이용 동의 (선택)</Text>
              <Text style={s.meta}>
                질환·체온 정보를 코디 추천에만 사용하며 이 기기에만 저장합니다. 동의를 철회하면 입력한 건강 정보가 즉시 삭제돼요.
              </Text>
            </View>
            <Switch value={healthConsent} onValueChange={setHealthConsent} />
          </View>
        </Card>

        <SectionTitle>정보</SectionTitle>
        <Card>
          <Text style={s.meta}>데이터 출처: 기상청 단기예보·생활기상지수, 한국환경공단 에어코리아 (공공누리)</Text>
          <Text style={[s.meta, { marginTop: 6 }]}>서버: {API_BASE_URL}</Text>
          <Text style={[s.meta, { marginTop: 6 }]}>버전 0.1.0 (MVP · 무료)</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  label: { fontSize: 15, fontWeight: '600', color: colors.text },
  meta: { fontSize: 13, color: colors.sub, marginTop: 4, lineHeight: 19 },
  switchRow: { flexDirection: 'row', alignItems: 'center' },
});
