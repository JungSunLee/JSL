import { BODY_TYPE_LABEL, SENSITIVITY_LABEL } from '@wo/core';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '@/components/Avatar';
import { Icons, type IconComponent } from '@/components/icons';
import { analytics } from '@/lib/analytics';
import { APP_NAME, APP_VERSION } from '@/lib/brand';
import { colors, radius } from '@/lib/theme';
import { useScreenView } from '@/lib/useScreenView';
import { useAuth } from '@/state/AuthContext';
import { useFamily } from '@/state/FamilyContext';
import { useSettings } from '@/state/SettingsContext';

const PROVIDER_LABEL = { naver: '네이버', kakao: '카카오', google: 'Google', dev: '테스트' } as const;

/** 메뉴 한 줄: 아이콘 · 제목 · (설명) · 오른쪽 값 또는 스위치 */
function Row({
  icon: Icon,
  title,
  desc,
  value,
  onPress,
  toggle,
  badge,
}: {
  icon: IconComponent;
  title: string;
  desc?: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (v: boolean) => void };
  badge?: string;
}) {
  const inner = (
    <View style={s.row}>
      <View style={s.icon}>
        <Icon size={20} color={colors.sub} weight="duotone" />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={s.rowTitle}>{title}</Text>
          {badge ? <Text style={s.badge}>{badge}</Text> : null}
        </View>
        {desc ? <Text style={s.rowDesc}>{desc}</Text> : null}
      </View>
      {toggle ? <Switch value={toggle.value} onValueChange={toggle.onChange} /> : null}
      {value ? <Text style={s.rowValue}>{value}</Text> : null}
      {onPress && !toggle ? <Icons.CaretRight size={16} color={colors.faint} weight="bold" /> : null}
    </View>
  );
  return onPress ? (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => pressed && { opacity: 0.6 }}>
      {inner}
    </Pressable>
  ) : (
    inner
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 20 }}>
      <Text style={s.group}>{title}</Text>
      <View style={s.card}>{children}</View>
    </View>
  );
}

export default function Menu() {
  useScreenView('menu');
  const { user, signOut, deleteAccount } = useAuth();
  const { members, healthConsent, setHealthConsent } = useFamily();
  const { settings, update } = useSettings();
  const go = (target: string, path: Parameters<typeof router.push>[0]) => () => {
    analytics.tap('menu', target);
    router.push(path);
  };
  const soon = (target: string, what: string) => () => {
    analytics.tap('menu', target);
    Alert.alert('준비 중이에요', `${what}은(는) 다음 업데이트에서 열릴 예정이에요.`);
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={s.title}>메뉴</Text>

        {/* 계정 */}
        <Pressable style={s.profile} onPress={user ? go('my_profile', '/onboarding') : go('login', '/login')} accessibilityRole="button">
          <View style={{ marginRight: 12 }}>
            <Avatar name={user?.name ?? '?'} relation="me" size={44} generic={!user} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{user ? user.name : '로그인하고 옷차림 추천 받기'}</Text>
            <Text style={s.meta}>
              {user
                ? user.profile
                  ? `${user.profile.birthYear}년생 · ${BODY_TYPE_LABEL[user.profile.bodyType]} · ${SENSITIVITY_LABEL[user.profile.sensitivity]}`
                  : '내 정보를 입력하면 추천이 시작돼요'
                : '날씨는 로그인 없이도 볼 수 있어요'}
            </Text>
          </View>
          <Icons.CaretRight size={18} color={colors.faint} weight="bold" />
        </Pressable>

        <Group title="가족">
          <Row icon={Icons.Users} title="가족 정보 관리" desc={members.length ? `${members.length}명 등록됨` : '아이·부모님을 등록하면 각자에게 맞게 추천해요'} onPress={go('family', '/family')} />
          <Row icon={Icons.Plus} title="가족 구성원 추가" onPress={go('add_family', '/member/edit')} />
        </Group>

        <Group title="알림·위젯">
          <Row
            icon={Icons.Bell}
            title="알림 설정"
            desc={settings.morningAlert ? `아침 ${settings.morningAlertTime} 옷차림 알림 켜짐` : '아침 옷차림·비·미세먼지 알림'}
            onPress={go('notifications', '/settings/notifications')}
          />
          <Row icon={Icons.DeviceMobile} title="홈 화면 위젯" desc="잠금 해제 없이 오늘 옷차림 확인" badge="준비 중" onPress={soon('widget', '홈 화면 위젯')} />
        </Group>

        <Group title="혜택">
          <Row
            icon={Icons.Gift}
            title="혜택·이벤트 소식 받기"
            desc="날씨 맞춤 쇼핑 할인, 이벤트 알림 (선택)"
            toggle={{
              value: settings.promoOptIn,
              onChange: (v) => {
                analytics.tap('menu', v ? 'promo_opt_in' : 'promo_opt_out');
                void update({ promoOptIn: v });
              },
            }}
          />
          <Row icon={Icons.ShoppingBag} title="날씨 맞춤 쇼핑" desc="추천 아이템 바로 보기" badge="준비 중" onPress={soon('shop', '날씨 맞춤 쇼핑')} />
        </Group>

        <Group title="날씨">
          <Row
            icon={Icons.MapPin}
            title="현재 위치 사용"
            desc={settings.useCurrentLocation ? '휴대폰 위치 기준으로 날씨를 보여줘요' : '기본 지역(성남시 중원구 중앙동) 기준'}
            toggle={{
              value: settings.useCurrentLocation,
              onChange: (v) => {
                analytics.tap('menu', v ? 'location_on' : 'location_off');
                void update({ useCurrentLocation: v });
              },
            }}
          />
        </Group>

        <Group title="개인정보">
          <Row
            icon={Icons.Heartbeat}
            title="건강 정보 이용 동의"
            desc="질환·체온을 추천에만 사용, 이 기기에만 저장. 끄면 즉시 삭제"
            toggle={{
              value: healthConsent,
              onChange: (v) => {
                analytics.tap('menu', v ? 'health_consent_on' : 'health_consent_off');
                void setHealthConsent(v);
              },
            }}
          />
          <Row icon={Icons.FileText} title="개인정보처리방침" onPress={soon('privacy', '개인정보처리방침 페이지')} />
          <Row icon={Icons.Scroll} title="이용약관" onPress={soon('terms', '이용약관 페이지')} />
        </Group>

        <Group title="지원">
          <Row icon={Icons.Megaphone} title="공지사항" badge="준비 중" onPress={soon('notice', '공지사항')} />
          <Row icon={Icons.ChatCircle} title="문의하기" desc="불편한 점, 바라는 점을 알려주세요" onPress={soon('contact', '문의하기')} />
          <Row icon={Icons.Info} title="앱 정보" value={`v${APP_VERSION}`} onPress={go('about', '/settings/about')} />
        </Group>

        {user ? (
          <Group title="계정">
            <Row icon={Icons.SignOut} title="로그아웃" onPress={() => (analytics.tap('menu', 'logout'), void signOut())} />
            <Row
              icon={Icons.Trash}
              title="회원 탈퇴"
              desc="계정과 저장된 내 정보가 삭제돼요"
              onPress={() =>
                Alert.alert('회원 탈퇴', '계정 정보가 삭제됩니다. 계속할까요?', [
                  { text: '취소', style: 'cancel' },
                  { text: '탈퇴', style: 'destructive', onPress: () => (analytics.event('account_deleted', 'menu'), void deleteAccount()) },
                ])
              }
            />
          </Group>
        ) : null}

        <Text style={s.footer}>
          {APP_NAME} v{APP_VERSION}
          {'\n'}데이터 출처: 기상청 단기예보·생활기상지수, 한국환경공단 에어코리아 (공공누리)
          {user?.providers.length ? `\n${user.providers.map((p) => PROVIDER_LABEL[p]).join(', ')} 계정으로 로그인됨` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 4, marginBottom: 12 },
  profile: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius.md, padding: 16 },
  name: { fontSize: 17, fontWeight: '700', color: colors.text },
  meta: { fontSize: 13, color: colors.sub, marginTop: 3 },
  group: { fontSize: 13, fontWeight: '700', color: colors.faint, marginBottom: 6, marginLeft: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.md, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  icon: { width: 32 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  rowDesc: { fontSize: 12, color: colors.sub, marginTop: 2, lineHeight: 17 },
  rowValue: { fontSize: 14, color: colors.faint, marginRight: 4 },
  badge: { fontSize: 10, fontWeight: '700', color: colors.caution, backgroundColor: '#FFF4E0', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, marginLeft: 6, overflow: 'hidden' },
  footer: { fontSize: 11, color: colors.faint, textAlign: 'center', marginTop: 24, lineHeight: 17 },
});
