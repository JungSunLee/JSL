import type { PrecipType, Sky } from '@wo/core';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewStyle } from 'react-native';

/**
 * 살아 움직이는 날씨 장면. 이미지 없이 도형과 애니메이션만으로 그린다 (저작권 문제 없음).
 * - 시간대에 따라 하늘색이 바뀌고, 밤에는 달과 별
 * - 맑음: 햇살이 천천히 숨 쉬듯 커졌다 작아짐
 * - 구름: 여러 겹이 서로 다른 속도로 흘러감 (흐릴수록 많고 어둡다)
 * - 비/소나기: 빗줄기가 떨어짐, 눈: 눈송이가 흔들리며 내림
 */
export interface SceneProps {
  sky: Sky;
  precip: PrecipType;
  /** 0~23 */
  hour: number;
  width: number;
  height: number;
  /** 해·달·구름이 모이는 위쪽 영역 높이. 화면 전체 배경으로 쓸 때 지정 (기본: height) */
  focusHeight?: number;
  /** 바닥 언덕 표시 여부 (전체 배경일 때는 끈다) */
  hills?: boolean;
  /** 하늘 그라디언트를 그리지 않고 해·구름·비만 그린다 (바깥에 같은 색 배경을 따로 깔 때) */
  overlay?: boolean;
  style?: ViewStyle;
}

type Phase = 'dawn' | 'day' | 'dusk' | 'night';

function phaseOf(hour: number): Phase {
  if (hour >= 5 && hour < 7) return 'dawn';
  if (hour >= 7 && hour < 17) return 'day';
  if (hour >= 17 && hour < 19) return 'dusk';
  return 'night';
}

export function sceneColors(sky: Sky, precip: PrecipType, hour: number): [string, string, string] {
  const p = phaseOf(hour);
  const wet = precip !== 'none';
  const snowy = precip === 'snow' || precip === 'rainSnow';
  if (snowy) return p === 'night' ? ['#2B3A5C', '#54688F', '#8FA3C4'] : ['#8EA4C8', '#B8C7DE', '#E3EAF3'];
  if (wet) return p === 'night' ? ['#1A2238', '#2E3A55', '#4A5873'] : ['#4B5D78', '#6B7E9B', '#93A3BA'];
  if (p === 'night') return sky === 'clear' ? ['#0E1733', '#1D2B53', '#34477F'] : ['#1A2238', '#2E3A55', '#4D5B78'];
  if (p === 'dawn') return ['#4D6AB5', '#C78AA0', '#F6C59B'];
  if (p === 'dusk') return ['#3E5CA8', '#D97B7B', '#F8B571'];
  if (sky === 'cloudy') return ['#7D8FA9', '#9FAFC5', '#C9D4E2'];
  if (sky === 'partly') return ['#3F86F0', '#73AEF8', '#B6D7FD'];
  return ['#2F80ED', '#5FAFFF', '#A9DBFF'];
}

/** 고정 시드 난수: 렌더마다 위치가 흔들리지 않게 */
function seeded(n: number, seed = 7) {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < n; i++) {
    x = (x * 9301 + 49297) % 233280;
    out.push(x / 233280);
  }
  return out;
}

function useLoop(duration: number, delay = 0, easing = Easing.linear) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(v, { toValue: 1, duration, easing, useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duration, delay, easing]);
  return v;
}

function usePulse(duration: number) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [v, duration]);
  return v;
}

function Sun({ x, y, size, dim }: { x: number; y: number; size: number; dim: boolean }) {
  const pulse = usePulse(2600);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.6] });
  const color = dim ? '#FFD37A' : '#FFD54A';
  return (
    <View style={{ position: 'absolute', left: x - size, top: y - size, width: size * 2, height: size * 2 }}>
      <Animated.View style={{ position: 'absolute', inset: 0, borderRadius: size, backgroundColor: color, opacity: glowOpacity, transform: [{ scale: Animated.multiply(scale, 1.35) }] }} />
      <Animated.View style={{ position: 'absolute', inset: size * 0.35, borderRadius: size, backgroundColor: color, opacity: 0.55, transform: [{ scale }] }} />
      <View style={{ position: 'absolute', inset: size * 0.5, borderRadius: size, backgroundColor: '#FFE89A' }} />
    </View>
  );
}

function Moon({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <View style={{ position: 'absolute', left: x - size, top: y - size, width: size * 2, height: size * 2 }}>
      <View style={{ position: 'absolute', inset: -size * 0.5, borderRadius: size * 2, backgroundColor: '#F4F1DE', opacity: 0.12 }} />
      <View style={{ position: 'absolute', inset: 0, borderRadius: size, backgroundColor: '#F4F1DE' }} />
      {/* 그믐 모양을 만드는 가림 원 */}
      <View style={{ position: 'absolute', left: size * 0.55, top: -size * 0.2, width: size * 1.7, height: size * 1.7, borderRadius: size, backgroundColor: '#1D2B53', opacity: 0.95 }} />
    </View>
  );
}

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const v = useLoop(1800 + delay, delay, Easing.inOut(Easing.sin));
  const opacity = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.25, 1, 0.25] });
  return <Animated.View style={{ position: 'absolute', left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: '#FFFFFF', opacity }} />;
}

function Cloud({ y, scale, duration, delay, width, dark, opacity }: { y: number; scale: number; duration: number; delay: number; width: number; dark: boolean; opacity: number }) {
  const v = useLoop(duration, delay);
  const w = 120 * scale;
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [-w - 20, width + 20] });
  const c = dark ? '#B8C3D3' : '#FFFFFF';
  return (
    <Animated.View style={{ position: 'absolute', top: y, left: 0, width: w, height: 44 * scale, opacity, transform: [{ translateX }] }}>
      <View style={{ position: 'absolute', left: 0, bottom: 0, width: w, height: 24 * scale, borderRadius: 20 * scale, backgroundColor: c }} />
      <View style={{ position: 'absolute', left: 18 * scale, bottom: 8 * scale, width: 42 * scale, height: 42 * scale, borderRadius: 30 * scale, backgroundColor: c }} />
      <View style={{ position: 'absolute', left: 48 * scale, bottom: 10 * scale, width: 52 * scale, height: 52 * scale, borderRadius: 30 * scale, backgroundColor: c }} />
      <View style={{ position: 'absolute', left: 84 * scale, bottom: 6 * scale, width: 30 * scale, height: 30 * scale, borderRadius: 20 * scale, backgroundColor: c }} />
    </Animated.View>
  );
}

function Drop({ x, height, delay, duration, snow }: { x: number; height: number; delay: number; duration: number; snow: boolean }) {
  const v = useLoop(duration, delay);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-30, height + 10] });
  const sway = v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, snow ? 10 : -4, 0] });
  const opacity = v.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 0.9, 0.9, 0] });
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: 0,
        width: snow ? 7 : 2,
        height: snow ? 7 : 16,
        borderRadius: snow ? 4 : 1,
        backgroundColor: snow ? '#FFFFFF' : 'rgba(255,255,255,0.75)',
        opacity,
        transform: [{ translateY }, { translateX: sway }, { rotate: snow ? '0deg' : '12deg' }],
      }}
    />
  );
}

export function WeatherScene({ sky, precip, hour, width, height, focusHeight, hills = true, overlay = false, style }: SceneProps) {
  const fh = focusHeight ?? height;
  const phase = phaseOf(hour);
  const night = phase === 'night';
  const wet = precip !== 'none';
  const snowy = precip === 'snow' || precip === 'rainSnow';
  const colors = sceneColors(sky, precip, hour);

  const cloudCount = wet ? 5 : sky === 'cloudy' ? 5 : sky === 'partly' ? 3 : 1;
  const cloudDark = wet || sky === 'cloudy';
  const rnd = useMemo(() => seeded(80, 11), []);
  const stars = useMemo(() => (night && !wet && sky !== 'cloudy' ? seeded(36, 3) : []), [night, wet, sky]);
  const drops = wet ? (snowy ? 16 : 22) : 0;

  return (
    <View style={[{ width, height, overflow: 'hidden' }, style]}>
      {overlay ? null : <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />}

      {/* 별 */}
      {stars.length
        ? Array.from({ length: 12 }).map((_, i) => (
            <Star key={`s${i}`} x={stars[i * 3] * width} y={stars[i * 3 + 1] * fh * 0.6} size={1.5 + stars[i * 3 + 2] * 2} delay={(i * 230) % 1500} />
          ))
        : null}

      {/* 해 / 달 */}
      {!wet && sky !== 'cloudy' ? (
        night ? <Moon x={width * 0.8} y={fh * 0.3} size={26} /> : <Sun x={width * 0.8} y={fh * 0.32} size={34} dim={phase !== 'day'} />
      ) : null}
      {/* 흐리거나 비 올 때도 희미한 해/달 자리 */}
      {(wet || sky === 'cloudy') && !night ? <View style={{ position: 'absolute', left: width * 0.8 - 30, top: fh * 0.32 - 30, width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', opacity: 0.12 }} /> : null}

      {/* 구름 */}
      {Array.from({ length: cloudCount }).map((_, i) => (
        <Cloud
          key={`c${i}`}
          y={fh * (0.08 + rnd[i] * 0.45)}
          scale={0.7 + rnd[i + 10] * 0.9}
          duration={28000 + rnd[i + 20] * 30000}
          delay={-rnd[i + 30] * 30000}
          width={width}
          dark={cloudDark}
          opacity={cloudDark ? 0.75 + rnd[i + 40] * 0.2 : 0.6 + rnd[i + 40] * 0.35}
        />
      ))}

      {/* 비 / 눈 */}
      {Array.from({ length: drops }).map((_, i) => (
        <Drop key={`d${i}`} x={rnd[i] * width} height={height} delay={rnd[i + 25] * 1600} duration={snowy ? 3200 + rnd[i + 50] * 2200 : 900 + rnd[i + 50] * 500} snow={snowy} />
      ))}

      {/* 바닥 언덕 (깊이감) */}
      {hills ? (
        <>
          <View style={{ position: 'absolute', left: -width * 0.2, bottom: -height * 0.18, width: width * 0.9, height: height * 0.4, borderRadius: width, backgroundColor: 'rgba(0,0,0,0.10)' }} />
          <View style={{ position: 'absolute', right: -width * 0.25, bottom: -height * 0.22, width: width, height: height * 0.42, borderRadius: width, backgroundColor: 'rgba(0,0,0,0.14)' }} />
        </>
      ) : null}
    </View>
  );
}
