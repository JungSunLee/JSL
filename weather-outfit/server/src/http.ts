export type FetchLike = typeof fetch;

/**
 * 공공데이터포털은 시간대에 따라 응답이 수 초~십수 초 걸릴 때가 있어
 * 기본 대기 시간을 넉넉히(20초) 두고, 시간 초과 시 한 번 더 시도한다.
 */
export const DEFAULT_TIMEOUT_MS = Number(process.env.UPSTREAM_TIMEOUT_MS ?? 20000);

export async function getJson<T>(f: FetchLike, url: string, init?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS, retries = 1): Promise<T> {
  let res: Response;
  try {
    res = await f(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  } catch (err) {
    if (retries > 0 && err instanceof Error && err.name === 'TimeoutError') {
      return getJson<T>(f, url, init, timeoutMs, retries - 1);
    }
    throw err;
  }
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url.split('?')[0]}: ${text.slice(0, 200)}`);
  try {
    return JSON.parse(text) as T;
  } catch {
    // data.go.kr은 인증 오류 시 XML을 돌려준다
    throw new Error(`Non-JSON response from ${url.split('?')[0]}: ${text.slice(0, 200)}`);
  }
}
