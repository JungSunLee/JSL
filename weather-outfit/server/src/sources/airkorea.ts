import proj4 from 'proj4';
import type { FetchLike } from '../http';
import { callDataGoKr } from './dataGoKr';

const STATION = 'https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc/getNearbyMsrstnList';
const REALTIME = 'https://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMsrstnAcctoRltmMesureDnsty';

/** 에어코리아 근접측정소 조회에 쓰이는 TM 중부원점 좌표계 (Bessel, EPSG:2097) */
const TM_MID =
  '+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs ' +
  '+towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43';

export function wgs84ToTm(lat: number, lon: number): { tmX: number; tmY: number } {
  const [x, y] = proj4('EPSG:4326', TM_MID, [lon, lat]);
  return { tmX: Math.round(x * 100) / 100, tmY: Math.round(y * 100) / 100 };
}

interface StationItem {
  stationName: string;
  addr?: string;
  tm?: number;
}

interface RealtimeItem {
  dataTime: string;
  pm10Value?: string;
  pm25Value?: string;
}

export async function fetchNearestStation(f: FetchLike, key: string, lat: number, lon: number): Promise<string | null> {
  const { tmX, tmY } = wgs84ToTm(lat, lon);
  const items = await callDataGoKr<StationItem>(f, STATION, key, { returnType: 'json', tmX, tmY, ver: '1.1' });
  return items[0]?.stationName ?? null;
}

const toNum = (v?: string) => {
  const n = Number(v);
  return v && v !== '-' && Number.isFinite(n) ? n : null;
};

export async function fetchAirQuality(f: FetchLike, key: string, stationName: string) {
  const items = await callDataGoKr<RealtimeItem>(f, REALTIME, key, {
    returnType: 'json', numOfRows: 3, pageNo: 1, stationName, dataTerm: 'DAILY', ver: '1.3',
  });
  // 최근 값이 점검중('-')이면 직전 시간 값 사용
  const pm10 = items.map((i) => toNum(i.pm10Value)).find((v) => v != null) ?? null;
  const pm25 = items.map((i) => toNum(i.pm25Value)).find((v) => v != null) ?? null;
  return { pm10, pm25, dataTime: items[0]?.dataTime ?? null };
}
