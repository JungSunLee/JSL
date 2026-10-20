/** 환경부 미세먼지 예보 등급 / 기상청 자외선지수 단계 */
export type AirGrade = 'good' | 'moderate' | 'bad' | 'veryBad';

export const AIR_GRADE_LABEL: Record<AirGrade, string> = {
  good: '좋음',
  moderate: '보통',
  bad: '나쁨',
  veryBad: '매우나쁨',
};

export function pm10Grade(v: number): AirGrade {
  if (v <= 30) return 'good';
  if (v <= 80) return 'moderate';
  if (v <= 150) return 'bad';
  return 'veryBad';
}

export function pm25Grade(v: number): AirGrade {
  if (v <= 15) return 'good';
  if (v <= 35) return 'moderate';
  if (v <= 75) return 'bad';
  return 'veryBad';
}

const ORDER: AirGrade[] = ['good', 'moderate', 'bad', 'veryBad'];

/** PM10/PM2.5 중 나쁜 쪽 등급 */
export function airGrade(pm10: number | null, pm25: number | null): AirGrade | null {
  const gs: AirGrade[] = [];
  if (pm10 != null) gs.push(pm10Grade(pm10));
  if (pm25 != null) gs.push(pm25Grade(pm25));
  if (gs.length === 0) return null;
  return gs.reduce((a, b) => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b));
}

export function airGradeRank(g: AirGrade): number {
  return ORDER.indexOf(g);
}

export type UvGrade = 'low' | 'moderate' | 'high' | 'veryHigh' | 'extreme';

export const UV_GRADE_LABEL: Record<UvGrade, string> = {
  low: '낮음',
  moderate: '보통',
  high: '높음',
  veryHigh: '매우높음',
  extreme: '위험',
};

export function uvGrade(uv: number): UvGrade {
  if (uv < 3) return 'low';
  if (uv < 6) return 'moderate';
  if (uv < 8) return 'high';
  if (uv < 11) return 'veryHigh';
  return 'extreme';
}
