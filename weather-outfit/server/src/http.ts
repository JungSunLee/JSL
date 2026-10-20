export type FetchLike = typeof fetch;

export async function getJson<T>(f: FetchLike, url: string, init?: RequestInit, timeoutMs = 5000): Promise<T> {
  const res = await f(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url.split('?')[0]}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    // data.go.kr은 인증 오류 시 XML을 돌려준다
    throw new Error(`Non-JSON response from ${url.split('?')[0]}: ${text.slice(0, 200)}`);
  }
}
