import type { PrecipType, Sky } from '@wo/core';

export const colors = {
  bg: '#F4F6FA',
  card: '#FFFFFF',
  text: '#16202E',
  sub: '#5B6676',
  faint: '#98A2B3',
  line: '#E6EAF0',
  primary: '#3A6FF7',
  good: '#1E9E6A',
  caution: '#E58A00',
  warning: '#D9344A',
  naver: '#03C75A',
  kakao: '#FEE500',
  kakaoText: '#191919',
};

export const radius = { sm: 10, md: 16, lg: 24 };

/** 날씨·시간대별 상단 그라디언트 */
export function skyGradient(sky: Sky, precip: PrecipType, hour: number): [string, string] {
  const night = hour < 6 || hour >= 19;
  if (precip === 'snow' || precip === 'rainSnow') return ['#8EA4C8', '#D7E1F0'];
  if (precip !== 'none') return ['#4B5D78', '#8A9BB5'];
  if (night) return ['#1D2B53', '#3D4F8A'];
  if (sky === 'cloudy') return ['#7D8FA9', '#B9C6D8'];
  if (sky === 'partly') return ['#4F8EF7', '#9CC3FF'];
  return ['#2F80ED', '#7FC8FF'];
}

export { THICKNESS_LABEL } from '@wo/core';
