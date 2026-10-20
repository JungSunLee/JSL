import { scryptSync, timingSafeEqual } from 'node:crypto';

/** 길이와 무관하게 상수 시간으로 비교 (타이밍 공격 방지) */
export function safeEqual(a: string, b: string): boolean {
  const salt = 'admin-compare';
  const ha = scryptSync(a, salt, 32);
  const hb = scryptSync(b, salt, 32);
  return timingSafeEqual(ha, hb);
}

/** 간단한 로그인 실패 제한: 키(IP)당 windowMs 동안 max회 실패하면 잠금 */
export class LoginLimiter {
  private fails = new Map<string, { count: number; until: number }>();

  constructor(private readonly max = 5, private readonly windowMs = 10 * 60_000) {}

  blocked(key: string, now = Date.now()): boolean {
    const f = this.fails.get(key);
    if (!f) return false;
    if (f.until < now) {
      this.fails.delete(key);
      return false;
    }
    return f.count >= this.max;
  }

  fail(key: string, now = Date.now()) {
    const f = this.fails.get(key);
    if (!f || f.until < now) this.fails.set(key, { count: 1, until: now + this.windowMs });
    else f.count += 1;
  }

  reset(key: string) {
    this.fails.delete(key);
  }
}
