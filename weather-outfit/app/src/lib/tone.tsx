import { createContext, useContext, type ReactNode } from 'react';
import { colors } from './theme';

/**
 * 화면 톤. 첫 화면(오늘)은 날씨 장면이 배경 전체에 깔리는 몰입형(dark)이라
 * 카드는 반투명, 글자는 흰색을 쓴다. 다른 화면은 밝은 톤(light).
 * 공용 컴포넌트는 useTone() 으로 색을 받아 두 화면 모두에서 동작한다.
 */
export interface Tone {
  dark: boolean;
  bg: string;
  card: string;
  cardStrong: string;
  text: string;
  sub: string;
  faint: string;
  line: string;
  chip: string;
  iconBg: string;
  accent: string;
  accentSoft: string;
}

export const LIGHT: Tone = {
  dark: false,
  bg: colors.bg,
  card: colors.card,
  cardStrong: colors.card,
  text: colors.text,
  sub: colors.sub,
  faint: colors.faint,
  line: colors.line,
  chip: '#F1F4F9',
  iconBg: '#EEF2F8',
  accent: colors.primary,
  accentSoft: '#EEF3FF',
};

export const DARK: Tone = {
  dark: true,
  bg: 'transparent',
  card: 'rgba(255,255,255,0.13)',
  cardStrong: 'rgba(255,255,255,0.20)',
  text: '#FFFFFF',
  sub: 'rgba(255,255,255,0.78)',
  faint: 'rgba(255,255,255,0.55)',
  line: 'rgba(255,255,255,0.14)',
  chip: 'rgba(255,255,255,0.12)',
  iconBg: 'rgba(255,255,255,0.14)',
  accent: '#FFFFFF',
  accentSoft: 'rgba(255,255,255,0.18)',
};

const ToneContext = createContext<Tone>(LIGHT);

export function ToneProvider({ dark, children }: { dark: boolean; children: ReactNode }) {
  return <ToneContext.Provider value={dark ? DARK : LIGHT}>{children}</ToneContext.Provider>;
}

export function useTone(): Tone {
  return useContext(ToneContext);
}
