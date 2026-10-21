import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppLogo } from './AppLogo';
import { APP_NAME } from '@/lib/brand';

/**
 * 앱 진입 화면. 네이티브 스플래시(app.json)와 같은 색으로 이어지며,
 * 날씨·로그인 정보를 불러오는 동안 보여준 뒤 부드럽게 사라진다.
 */
export function Splash({ visible }: { visible: boolean }) {
  const fade = useRef(new Animated.Value(1)).current;
  const rise = useRef(new Animated.Value(12)).current;
  const pop = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(rise, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(pop, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  }, [rise, pop]);

  useEffect(() => {
    if (!visible) Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }).start();
  }, [visible, fade]);

  return (
    <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[StyleSheet.absoluteFill, { opacity: fade, zIndex: 100 }]}>
      <LinearGradient colors={['#2F80ED', '#5FAFFF', '#A9DBFF']} style={s.bg}>
        <Animated.View style={[s.logo, { transform: [{ scale: pop }] }]}>
          <View style={s.logoGlow} />
          <AppLogo size={120} />
        </Animated.View>
        <Animated.View style={{ transform: [{ translateY: rise }], alignItems: 'center' }}>
          <Text style={s.title}>{APP_NAME}</Text>
          <Text style={s.sub}>오늘 날씨에 딱 맞는 우리 가족 옷차림</Text>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 22 },
  logo: { alignItems: 'center', justifyContent: 'center' },
  logoGlow: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.10)' },
  title: { color: '#fff', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 6 },
});
