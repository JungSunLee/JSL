/**
 * 기상청 단기예보 조회서비스(VilageFcstInfoService_2.0) 응답 정규화.
 * 네트워크 호출은 서버에서 하고, 여기서는 순수 변환만 담당한다.
 */
import type { HourlyForecast, PrecipType, Sky } from './types';
import { kmaToIso } from './kmaTime';

export interface KmaNcstItem {
  baseDate: string;
  baseTime: string;
  category: string;
  obsrValue: string;
}

export interface KmaFcstItem {
  baseDate: string;
  baseTime: string;
  category: string;
  fcstDate: string;
  fcstTime: string;
  fcstValue: string;
}

export function skyFromCode(code: number): Sky {
  if (code >= 4) return 'cloudy';
  if (code >= 3) return 'partly';
  return 'clear';
}

/** PTY: 0 없음, 1 비, 2 비/눈, 3 눈, 4 소나기, 5 빗방울, 6 빗방울눈날림, 7 눈날림 */
export function precipFromCode(code: number): PrecipType {
  switch (code) {
    case 1:
    case 5:
      return 'rain';
    case 2:
    case 6:
      return 'rainSnow';
    case 3:
    case 7:
      return 'snow';
    case 4:
      return 'shower';
    default:
      return 'none';
  }
}

const num = (v: string | undefined, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export interface CurrentObservation {
  temp: number;
  humidity: number;
  windSpeed: number;
  precipType: PrecipType;
  observedAt: string;
}

export function parseNcst(items: KmaNcstItem[]): CurrentObservation {
  const by = Object.fromEntries(items.map((i) => [i.category, i.obsrValue]));
  const first = items[0];
  return {
    temp: num(by.T1H),
    humidity: num(by.REH),
    windSpeed: num(by.WSD),
    precipType: precipFromCode(num(by.PTY)),
    observedAt: first ? kmaToIso(first.baseDate, first.baseTime) : new Date().toISOString(),
  };
}

export function parseHourly(items: KmaFcstItem[]): HourlyForecast[] {
  const slots = new Map<string, Record<string, string>>();
  for (const it of items) {
    const key = `${it.fcstDate}${it.fcstTime}`;
    const slot = slots.get(key) ?? { date: it.fcstDate, time: it.fcstTime };
    slot[it.category] = it.fcstValue;
    slots.set(key, slot);
  }
  return [...slots.keys()]
    .sort()
    .map((k) => slots.get(k)!)
    .filter((s) => s.TMP !== undefined)
    .map((s) => ({
      time: kmaToIso(s.date, s.time),
      temp: num(s.TMP),
      sky: skyFromCode(num(s.SKY, 1)),
      precipType: precipFromCode(num(s.PTY)),
      precipProb: num(s.POP),
      humidity: num(s.REH),
      windSpeed: num(s.WSD),
    }));
}

/** 특정 날짜(YYYYMMDD)의 최저/최고 기온. TMN/TMX가 없으면 시간별 기온으로 계산 */
export function dailyRange(items: KmaFcstItem[], date: string): { min: number; max: number } | null {
  const day = items.filter((i) => i.fcstDate === date);
  const tmn = day.find((i) => i.category === 'TMN');
  const tmx = day.find((i) => i.category === 'TMX');
  const temps = day.filter((i) => i.category === 'TMP').map((i) => num(i.fcstValue));
  if (!tmn && !tmx && temps.length === 0) return null;
  return {
    min: tmn ? num(tmn.fcstValue) : Math.min(...temps),
    max: tmx ? num(tmx.fcstValue) : Math.max(...temps),
  };
}
