/**
 * 위경도 ↔ 기상청 동네예보 격자(nx, ny) 변환 (Lambert Conformal Conic).
 * 기상청 단기예보 조회서비스 활용가이드의 변환 상수를 그대로 사용한다.
 */
const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0;
const SLAT2 = 60.0;
const OLON = 126.0;
const OLAT = 38.0;
const XO = 43;
const YO = 136;

const DEG = Math.PI / 180.0;

const re = RE / GRID;
const slat1 = SLAT1 * DEG;
const slat2 = SLAT2 * DEG;
const olon = OLON * DEG;
const olat = OLAT * DEG;

const sn =
  Math.log(Math.cos(slat1) / Math.cos(slat2)) /
  Math.log(Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5));
const sf = (Math.pow(Math.tan(Math.PI * 0.25 + slat1 * 0.5), sn) * Math.cos(slat1)) / sn;
const ro = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + olat * 0.5), sn);

export interface Grid {
  nx: number;
  ny: number;
}

export function latLonToGrid(lat: number, lon: number): Grid {
  const ra = (re * sf) / Math.pow(Math.tan(Math.PI * 0.25 + lat * DEG * 0.5), sn);
  let theta = lon * DEG - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}
