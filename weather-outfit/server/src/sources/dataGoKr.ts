import { getJson, type FetchLike } from '../http';

interface DataGoKrEnvelope<T> {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: { item?: T[] } | T[] | '' };
  };
}

/** 공공데이터포털 공통 응답 → item 배열. resultCode '00'이 아니면 예외 */
export async function callDataGoKr<T>(
  f: FetchLike,
  baseUrl: string,
  serviceKey: string,
  params: Record<string, string | number>,
): Promise<T[]> {
  const qs = new URLSearchParams({ serviceKey, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const json = await getJson<DataGoKrEnvelope<T>>(f, `${baseUrl}?${qs}`);
  const header = json.response?.header;
  if (header?.resultCode && header.resultCode !== '00') {
    throw new Error(`data.go.kr ${baseUrl.split('/').slice(-1)[0]}: ${header.resultCode} ${header.resultMsg ?? ''}`);
  }
  const items = json.response?.body?.items;
  if (!items) return [];
  return Array.isArray(items) ? items : (items.item ?? []);
}
