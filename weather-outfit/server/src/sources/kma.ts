import {
  dailyRangeBase,
  type KmaFcstItem,
  type KmaNcstItem,
  ultraSrtNcstBase,
  vilageFcstBase,
} from '@wo/core';
import type { FetchLike } from '../http';
import { callDataGoKr } from './dataGoKr';

const VILAGE = 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const LIVING = 'https://apis.data.go.kr/1360000/LivingWthrIdxServiceV4';

export async function fetchUltraSrtNcst(f: FetchLike, key: string, nx: number, ny: number, now: Date) {
  const { baseDate, baseTime } = ultraSrtNcstBase(now);
  return callDataGoKr<KmaNcstItem>(f, `${VILAGE}/getUltraSrtNcst`, key, {
    pageNo: 1, numOfRows: 100, dataType: 'JSON', base_date: baseDate, base_time: baseTime, nx, ny,
  });
}

export async function fetchVilageFcst(f: FetchLike, key: string, nx: number, ny: number, now: Date, forDailyRange = false) {
  const { baseDate, baseTime } = forDailyRange ? dailyRangeBase(now) : vilageFcstBase(now);
  return callDataGoKr<KmaFcstItem>(f, `${VILAGE}/getVilageFcst`, key, {
    pageNo: 1, numOfRows: 1000, dataType: 'JSON', base_date: baseDate, base_time: baseTime, nx, ny,
  });
}

interface UvItem {
  date: string; // YYYYMMDDHH (발표시각)
  [h: `h${number}`]: string;
}

/**
 * 생활기상지수 자외선지수. 발표시각 기준 h0, h3, h6 ... 형태로 3시간 간격 값이 온다.
 * time 파라미터는 발표시각(YYYYMMDDHH). 06·18시 발표분을 사용한다.
 */
export async function fetchUvIndex(f: FetchLike, key: string, areaNo: string, now: Date): Promise<number | null> {
  const kst = new Date(now.getTime() + 9 * 3600_000);
  const h = kst.getUTCHours();
  const issue = new Date(kst);
  if (h >= 6 && h < 18) issue.setUTCHours(6);
  else if (h >= 18) issue.setUTCHours(18);
  else {
    issue.setUTCDate(issue.getUTCDate() - 1);
    issue.setUTCHours(18);
  }
  const time = `${issue.getUTCFullYear()}${String(issue.getUTCMonth() + 1).padStart(2, '0')}${String(issue.getUTCDate()).padStart(2, '0')}${String(issue.getUTCHours()).padStart(2, '0')}`;
  const items = await callDataGoKr<UvItem>(f, `${LIVING}/getUVIdxV4`, key, {
    pageNo: 1, numOfRows: 10, dataType: 'JSON', areaNo, time,
  });
  const item = items[0];
  if (!item) return null;
  const elapsed = Math.floor((kst.getTime() - issue.getTime()) / 3600_000);
  // 현재 시각 이후 가장 가까운 슬롯부터, 오늘 낮 최대값을 보기 위해 앞으로 12시간 중 최대값 사용
  const values: number[] = [];
  for (let s = Math.floor(elapsed / 3) * 3; s <= elapsed + 12; s += 3) {
    const v = Number(item[`h${s}`]);
    if (item[`h${s}`] !== '' && Number.isFinite(v)) values.push(v);
  }
  return values.length ? Math.max(...values) : null;
}
