import { getJson, type FetchLike } from '../http';

interface RegionDoc {
  region_type: 'B' | 'H';
  code: string;
  address_name: string;
  region_1depth_name: string;
  region_2depth_name: string;
  region_3depth_name: string;
}

export interface Region {
  name: string;
  /** 생활기상지수 areaNo로 쓰는 시군구 단위 행정구역 코드 (10자리) */
  areaNo: string;
}

export async function reverseGeocode(f: FetchLike, restKey: string, lat: number, lon: number): Promise<Region | null> {
  const json = await getJson<{ documents: RegionDoc[] }>(
    f,
    `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lon}&y=${lat}`,
    { headers: { Authorization: `KakaoAK ${restKey}` } },
  );
  const doc = json.documents.find((d) => d.region_type === 'H') ?? json.documents[0];
  if (!doc) return null;
  return {
    name: [doc.region_2depth_name, doc.region_3depth_name].filter(Boolean).join(' ') || doc.address_name,
    areaNo: `${doc.code.slice(0, 5)}00000`,
  };
}
