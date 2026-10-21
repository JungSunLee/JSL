import { StyleSheet, View } from 'react-native';
import { Icons } from './icons';

/** 앱 로고 마크: 해·구름 위에 티셔츠 배지. 스플래시·로그인·앱 정보에서 공통으로 쓴다 */
export function AppLogo({ size = 96, light = false }: { size?: number; light?: boolean }) {
  const badge = size * 0.36;
  return (
    <View style={[s.wrap, { width: size, height: size, borderRadius: size * 0.3, backgroundColor: light ? '#EEF3FF' : 'rgba(255,255,255,0.18)' }]}>
      <Icons.CloudSun size={size * 0.56} color={light ? '#2F80ED' : '#FFFFFF'} weight="fill" />
      <View style={[s.badge, { width: badge, height: badge, borderRadius: badge / 2, right: -badge * 0.15, bottom: -badge * 0.15, backgroundColor: light ? '#2F80ED' : '#FFFFFF' }]}>
        <Icons.TShirt size={badge * 0.55} color={light ? '#FFFFFF' : '#2F80ED'} weight="fill" />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  badge: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
});
