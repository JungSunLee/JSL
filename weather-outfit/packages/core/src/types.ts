/** 하늘상태 (기상청 SKY 코드 기반) */
export type Sky = 'clear' | 'partly' | 'cloudy';

/** 강수형태 (기상청 PTY 코드 기반) */
export type PrecipType = 'none' | 'rain' | 'rainSnow' | 'snow' | 'shower';

export interface HourlyForecast {
  /** ISO 문자열 (KST 기준 시각, +09:00) */
  time: string;
  temp: number;
  sky: Sky;
  precipType: PrecipType;
  /** 강수확률 % */
  precipProb: number;
  humidity: number;
  /** 풍속 m/s */
  windSpeed: number;
}

/** 앱에서 사용하는 정규화된 하루 날씨 */
export interface WeatherSnapshot {
  locationName: string;
  observedAt: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  windSpeed: number;
  sky: Sky;
  precipType: PrecipType;
  /** 오늘 남은 시간 중 최대 강수확률 % */
  precipProbMax: number;
  /** 자외선지수 (0~11+), 미제공 시 null */
  uvIndex: number | null;
  /** 미세먼지 PM10 ㎍/㎥ */
  pm10: number | null;
  /** 초미세먼지 PM2.5 ㎍/㎥ */
  pm25: number | null;
  hourly: HourlyForecast[];
  /** 데이터 출처 표기 (공공누리 출처표시 의무) */
  sources: string[];
  /** 서비스키가 없을 때 데모 데이터 여부 */
  isMock?: boolean;
}

export type Relation = 'me' | 'spouse' | 'father' | 'mother' | 'child' | 'grandparent' | 'other';

/** 추위/더위 민감도: -2(추위 많이 탐) ~ +2(더위 많이 탐) */
export type ThermalSensitivity = -2 | -1 | 0 | 1 | 2;

export type HealthCondition =
  | 'respiratory' // 천식·비염 등 호흡기
  | 'atopic' // 아토피·민감성 피부
  | 'cardiovascular' // 고혈압·심혈관 (한파/폭염 주의)
  | 'pregnant'
  | 'recovering' // 감기 등 회복 중
  | 'coldHands'; // 수족냉증

export type Activity = 'indoor' | 'commute' | 'outdoor';

export type BodyType = 'slim' | 'average' | 'muscular' | 'heavy';

export type Sex = 'female' | 'male';

/** 로그인 사용자의 본인 프로필 (서버에 저장) */
export interface UserProfile {
  birthYear: number;
  sex?: Sex;
  heightCm?: number;
  weightKg?: number;
  bodyType: BodyType;
  sensitivity: ThermalSensitivity;
  activity: Activity;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: Relation;
  birthYear: number;
  sensitivity: ThermalSensitivity;
  conditions: HealthCondition[];
  activity: Activity;
  /** 건강앱 연동 또는 수동 입력 체온 (℃). 37.5 이상이면 보온 우선 */
  bodyTempC?: number;
  heightCm?: number;
  weightKg?: number;
  bodyType?: BodyType;
  emoji?: string;
}

export type OutfitSlot = 'outer' | 'top' | 'bottom' | 'shoes' | 'accessory';

export interface OutfitItem {
  slot: OutfitSlot;
  name: string;
  /** 쇼핑 연동용 표준 카테고리 키 (예: outer.padding) */
  category: string;
  /** 두께 1(얇음)~5(매우 두꺼움) */
  warmth: 1 | 2 | 3 | 4 | 5;
}

export type AlertLevel = 'info' | 'caution' | 'warning';

export interface CareAlert {
  level: AlertLevel;
  icon: string;
  message: string;
}

export interface OutfitRecommendation {
  memberId: string;
  /** 개인 보정 후 체감 온도 */
  personalFeelsLike: number;
  /** 전체 두께 단계 1~5 */
  thickness: 1 | 2 | 3 | 4 | 5;
  headline: string;
  items: OutfitItem[];
  alerts: CareAlert[];
  /** 추천 근거 (투명성) */
  reasons: string[];
}
