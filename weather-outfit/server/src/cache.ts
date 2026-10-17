/** 간단한 TTL 메모리 캐시 + 동시 요청 합치기. 공공API 일일 트래픽 한도를 아끼기 위함. */
export class TtlCache {
  private store = new Map<string, { exp: number; value: Promise<unknown> }>();

  constructor(private readonly max = 500) {}

  async get<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const hit = this.store.get(key);
    if (hit && hit.exp > now) return hit.value as Promise<T>;
    const value = load();
    this.store.set(key, { exp: now + ttlMs, value });
    value.catch(() => this.store.delete(key));
    if (this.store.size > this.max) {
      const oldest = this.store.keys().next().value;
      if (oldest !== undefined) this.store.delete(oldest);
    }
    return value;
  }
}
