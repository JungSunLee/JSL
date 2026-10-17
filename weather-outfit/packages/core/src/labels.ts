import type { Activity, HealthCondition, PrecipType, Relation, Sky, ThermalSensitivity } from './types';

export const RELATION_LABEL: Record<Relation, string> = {
  me: '나',
  spouse: '배우자',
  father: '아버지',
  mother: '어머니',
  child: '자녀',
  grandparent: '조부모',
  other: '기타',
};

export const SENSITIVITY_LABEL: Record<ThermalSensitivity, string> = {
  [-2]: '추위를 많이 타요',
  [-1]: '추위를 조금 타요',
  [0]: '보통이에요',
  [1]: '더위를 조금 타요',
  [2]: '더위를 많이 타요',
};

export const CONDITION_LABEL: Record<HealthCondition, string> = {
  respiratory: '호흡기 질환 (천식·비염)',
  atopic: '아토피·민감성 피부',
  cardiovascular: '고혈압·심혈관 질환',
  pregnant: '임신 중',
  recovering: '감기 등 회복 중',
  coldHands: '수족냉증',
};

export const ACTIVITY_LABEL: Record<Activity, string> = {
  indoor: '주로 실내',
  commute: '출퇴근·등하원 정도',
  outdoor: '야외 활동 많음',
};

export const SKY_LABEL: Record<Sky, string> = {
  clear: '맑음',
  partly: '구름많음',
  cloudy: '흐림',
};

export const PRECIP_LABEL: Record<PrecipType, string> = {
  none: '',
  rain: '비',
  rainSnow: '비/눈',
  snow: '눈',
  shower: '소나기',
};

export function weatherLabel(sky: Sky, precip: PrecipType): string {
  return precip !== 'none' ? PRECIP_LABEL[precip] : SKY_LABEL[sky];
}

export function weatherEmoji(sky: Sky, precip: PrecipType): string {
  if (precip === 'snow' || precip === 'rainSnow') return '🌨️';
  if (precip === 'rain' || precip === 'shower') return '🌧️';
  if (sky === 'cloudy') return '☁️';
  if (sky === 'partly') return '⛅';
  return '☀️';
}
