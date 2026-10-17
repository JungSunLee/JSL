/**
 * 기상청 API base_date/base_time 계산. 모든 계산은 KST(UTC+9) 기준.
 */
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export interface BaseDateTime {
  baseDate: string; // YYYYMMDD
  baseTime: string; // HHmm
}

function kstParts(d: Date) {
  const k = new Date(d.getTime() + KST_OFFSET_MS);
  return {
    y: k.getUTCFullYear(),
    m: k.getUTCMonth() + 1,
    d: k.getUTCDate(),
    h: k.getUTCHours(),
    min: k.getUTCMinutes(),
  };
}

const pad = (n: number, len = 2) => String(n).padStart(len, '0');

function fmtDate(y: number, m: number, d: number) {
  return `${y}${pad(m)}${pad(d)}`;
}

/** KST 기준 오늘 날짜 YYYYMMDD */
export function kstToday(now: Date = new Date()): string {
  const p = kstParts(now);
  return fmtDate(p.y, p.m, p.d);
}

function shiftHours(now: Date, hours: number): Date {
  return new Date(now.getTime() + hours * 3600 * 1000);
}

/**
 * 초단기실황(getUltraSrtNcst): 매시 정시 자료, 정시+10분 이후 제공되나
 * 지연을 고려해 45분 이전에는 직전 시각을 사용한다.
 */
export function ultraSrtNcstBase(now: Date = new Date()): BaseDateTime {
  const p = kstParts(now);
  const t = p.min < 45 ? kstParts(shiftHours(now, -1)) : p;
  return { baseDate: fmtDate(t.y, t.m, t.d), baseTime: `${pad(t.h)}00` };
}

const VILAGE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

/** 단기예보(getVilageFcst): 02,05,...,23시 발표, 발표 +15분 이후 사용 */
export function vilageFcstBase(now: Date = new Date()): BaseDateTime {
  const p = kstParts(now);
  const minutes = p.h * 60 + p.min;
  const available = VILAGE_HOURS.filter((h) => h * 60 + 15 <= minutes);
  if (available.length === 0) {
    const y = kstParts(shiftHours(now, -24));
    return { baseDate: fmtDate(y.y, y.m, y.d), baseTime: '2300' };
  }
  return { baseDate: fmtDate(p.y, p.m, p.d), baseTime: `${pad(available[available.length - 1])}00` };
}

/**
 * 오늘의 최저/최고기온(TMN/TMX)을 모두 담고 있는 발표 시각.
 * 당일 02시 발표에 당일 TMN(06시)·TMX(15시)가 포함된다.
 */
export function dailyRangeBase(now: Date = new Date()): BaseDateTime {
  const p = kstParts(now);
  if (p.h * 60 + p.min >= 2 * 60 + 15) {
    return { baseDate: fmtDate(p.y, p.m, p.d), baseTime: '0200' };
  }
  const y = kstParts(shiftHours(now, -24));
  return { baseDate: fmtDate(y.y, y.m, y.d), baseTime: '2300' };
}

/** 'YYYYMMDD' + 'HHmm' → KST ISO 문자열 */
export function kmaToIso(date: string, time: string): string {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:${time.slice(2, 4)}:00+09:00`;
}
