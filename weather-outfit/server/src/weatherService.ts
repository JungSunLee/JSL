import {
  dailyRange,
  kstToday,
  latLonToGrid,
  mockWeather,
  parseHourly,
  parseNcst,
  type WeatherSnapshot,
} from '@wo/core';
import { TtlCache } from './cache';
import type { Config } from './config';
import type { FetchLike } from './http';
import { fetchAirQuality, fetchNearestStation } from './sources/airkorea';
import { fetchUltraSrtNcst, fetchUvIndex, fetchVilageFcst } from './sources/kma';
import { reverseGeocode, type Region } from './sources/kakaoLocal';

const MIN = 60_000;
/** 지역명을 알 수 없을 때 자외선지수 기본 지역 (서울특별시) */
const DEFAULT_AREA_NO = '1100000000';

export interface WeatherServiceDeps {
  config: Config;
  fetch?: FetchLike;
  now?: () => Date;
  log?: { warn: (obj: unknown, msg?: string) => void };
}

export function createWeatherService({ config, fetch: f = fetch, now = () => new Date(), log }: WeatherServiceDeps) {
  const cache = new TtlCache();
  const key = config.dataGoKrKey;

  /** 부가 정보(자외선·미세먼지·지역명)는 실패해도 날씨 자체는 보여준다 */
  async function soft<T>(label: string, p: Promise<T>): Promise<T | null> {
    try {
      return await p;
    } catch (err) {
      log?.warn({ err: String(err) }, `${label} unavailable — 날씨는 표시하고 이 항목만 비웁니다`);
      return null;
    }
  }

  async function getWeather(lat: number, lon: number, fallbackName?: string): Promise<WeatherSnapshot> {
    const t = now();
    const region: Region | null = config.kakao.restKey
      ? await soft('region', cache.get(`rg:${lat.toFixed(3)},${lon.toFixed(3)}`, 24 * 60 * MIN, () => reverseGeocode(f, config.kakao.restKey!, lat, lon)))
      : null;

    if (!key) return mockWeather(t, `${region?.name ?? fallbackName ?? '성남시 중원구 중앙동'} (데모)`);

    const { nx, ny } = latLonToGrid(lat, lon);
    const g = `${nx},${ny}`;
    const hourKey = Math.floor(t.getTime() / (10 * MIN));

    const [ncst, fcst, rangeFcst, uv, air] = await Promise.all([
      cache.get(`ncst:${g}:${hourKey}`, 10 * MIN, () => fetchUltraSrtNcst(f, key, nx, ny, t)),
      cache.get(`fcst:${g}:${hourKey}`, 30 * MIN, () => fetchVilageFcst(f, key, nx, ny, t)),
      cache.get(`range:${g}:${kstToday(t)}`, 3 * 60 * MIN, () => fetchVilageFcst(f, key, nx, ny, t, true)),
      soft('uv', cache.get(`uv:${region?.areaNo ?? DEFAULT_AREA_NO}:${hourKey}`, 60 * MIN, () =>
        fetchUvIndex(f, key, region?.areaNo ?? DEFAULT_AREA_NO, t))),
      soft('air', (async () => {
        const station = await cache.get(`st:${lat.toFixed(2)},${lon.toFixed(2)}`, 24 * 60 * MIN, () => fetchNearestStation(f, key, lat, lon));
        return station ? cache.get(`air:${station}:${hourKey}`, 20 * MIN, () => fetchAirQuality(f, key, station)) : null;
      })()),
    ]);

    const current = parseNcst(ncst);
    const today = kstToday(t);
    const nowIso = t.toISOString();
    const hourly = parseHourly(fcst).filter((h) => new Date(h.time).getTime() >= new Date(nowIso).getTime() - 60 * MIN).slice(0, 24);
    const todayHours = parseHourly(rangeFcst).filter((h) => h.time.startsWith(`${today.slice(0, 4)}-${today.slice(4, 6)}-${today.slice(6, 8)}`));
    const range = dailyRange(rangeFcst, today) ?? { min: current.temp, max: current.temp };
    const remaining = todayHours.filter((h) => new Date(h.time).getTime() >= t.getTime() - 60 * MIN);
    const next = hourly[0];

    const sources = ['기상청 단기예보'];
    if (uv != null) sources.push('기상청 생활기상지수');
    if (air) sources.push('한국환경공단 에어코리아');

    return {
      locationName: region?.name ?? fallbackName ?? `격자 ${g}`,
      observedAt: current.observedAt,
      temp: current.temp,
      tempMin: Math.min(range.min, current.temp),
      tempMax: Math.max(range.max, current.temp),
      humidity: current.humidity,
      windSpeed: current.windSpeed,
      sky: next?.sky ?? 'clear',
      precipType: current.precipType !== 'none' ? current.precipType : (next?.precipType ?? 'none'),
      precipProbMax: Math.max(0, ...(remaining.length ? remaining : hourly.slice(0, 12)).map((h) => h.precipProb)),
      uvIndex: uv,
      pm10: air?.pm10 ?? null,
      pm25: air?.pm25 ?? null,
      hourly,
      sources,
    };
  }

  return { getWeather };
}

export type WeatherService = ReturnType<typeof createWeatherService>;
