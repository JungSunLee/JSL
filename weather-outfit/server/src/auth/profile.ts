import type { Activity, BodyType, Sex, ThermalSensitivity, UserProfile } from '@wo/core';

const BODY_TYPES: BodyType[] = ['slim', 'average', 'muscular', 'heavy'];
const ACTIVITIES: Activity[] = ['indoor', 'commute', 'outdoor'];
const SEXES: Sex[] = ['female', 'male'];
const SENS = [-2, -1, 0, 1, 2];

const inRange = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;

/** 프로필 입력 검증. 오류가 있으면 필드명 → 메시지 */
export function validateProfile(input: unknown, now = new Date()): { profile?: UserProfile; errors?: Record<string, string> } {
  const b = (input ?? {}) as Record<string, unknown>;
  const errors: Record<string, string> = {};
  const year = now.getFullYear();
  if (!Number.isInteger(b.birthYear) || !inRange(b.birthYear, year - 110, year)) errors.birthYear = '출생연도를 확인해 주세요';
  if (b.sex !== undefined && b.sex !== null && !SEXES.includes(b.sex as Sex)) errors.sex = '성별 값이 올바르지 않아요';
  if (b.heightCm != null && !inRange(b.heightCm, 40, 230)) errors.heightCm = '키는 40~230cm 사이로 입력해 주세요';
  if (b.weightKg != null && !inRange(b.weightKg, 2, 250)) errors.weightKg = '몸무게는 2~250kg 사이로 입력해 주세요';
  if (!BODY_TYPES.includes(b.bodyType as BodyType)) errors.bodyType = '체형을 선택해 주세요';
  if (!SENS.includes(b.sensitivity as number)) errors.sensitivity = '온도감을 선택해 주세요';
  if (!ACTIVITIES.includes(b.activity as Activity)) errors.activity = '활동량을 선택해 주세요';
  if (Object.keys(errors).length) return { errors };
  return {
    profile: {
      birthYear: b.birthYear as number,
      sex: (b.sex as Sex | undefined) ?? undefined,
      heightCm: (b.heightCm as number | undefined) ?? undefined,
      weightKg: (b.weightKg as number | undefined) ?? undefined,
      bodyType: b.bodyType as BodyType,
      sensitivity: b.sensitivity as ThermalSensitivity,
      activity: b.activity as Activity,
    },
  };
}
