import type { DatabaseSync } from 'node:sqlite';
import { kstDay } from '../db';

/** 앱이 보내는 사용 로그 1건 */
export interface IncomingEvent {
  name: string;
  ts?: string;
  screen?: string;
  target?: string;
  props?: Record<string, unknown>;
  sessionId?: string;
}

export interface EventBatch {
  deviceId: string;
  platform?: string;
  appVersion?: string;
  events: IncomingEvent[];
}

const NAME_RE = /^[a-z][a-z0-9_]{0,39}$/;
const SHORT = (v: unknown, max = 60) => (typeof v === 'string' ? v.slice(0, max) : null);

export class EventStore {
  constructor(private readonly db: DatabaseSync) {}

  /** 검증 후 저장. 저장한 건수를 돌려준다 (잘못된 건은 조용히 버림) */
  insertBatch(batch: EventBatch, userId: string | null, now = new Date()): number {
    const deviceId = SHORT(batch.deviceId, 64);
    if (!deviceId || !Array.isArray(batch.events)) return 0;
    const stmt = this.db.prepare(
      `INSERT INTO events (ts, day, device_id, user_id, session_id, name, screen, target, props_json, platform, app_version)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    let saved = 0;
    const platform = SHORT(batch.platform, 16);
    const appVersion = SHORT(batch.appVersion, 20);
    const nowMs = now.getTime();
    for (const e of batch.events.slice(0, 200)) {
      if (!e || typeof e.name !== 'string' || !NAME_RE.test(e.name)) continue;
      // 미래 시각이나 30일보다 오래된 시각은 서버 시각으로 보정
      let ts = typeof e.ts === 'string' ? new Date(e.ts) : now;
      if (Number.isNaN(ts.getTime()) || ts.getTime() > nowMs + 60_000 || nowMs - ts.getTime() > 30 * 86400_000) ts = now;
      const props = e.props && typeof e.props === 'object' ? JSON.stringify(e.props).slice(0, 2000) : null;
      stmt.run(ts.toISOString(), kstDay(ts), deviceId, userId, SHORT(e.sessionId, 64), e.name, SHORT(e.screen), SHORT(e.target), props, platform, appVersion);
      saved += 1;
    }
    return saved;
  }

  /** 관리자 대시보드용 집계 */
  stats(now = new Date()) {
    const today = kstDay(now);
    const dayAgo = (n: number) => kstDay(new Date(now.getTime() - n * 86400_000));
    const uniq = (from: string) =>
      (this.db.prepare('SELECT COUNT(DISTINCT device_id) AS c FROM events WHERE day >= ?').get(from) as { c: number }).c;
    const dauByDay = this.db
      .prepare('SELECT day, COUNT(DISTINCT device_id) AS c FROM events WHERE day >= ? GROUP BY day ORDER BY day')
      .all(dayAgo(13)) as { day: string; c: number }[];
    const days: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = dayAgo(i);
      days.push({ date: d, count: dauByDay.find((r) => r.day === d)?.c ?? 0 });
    }
    const topTaps = this.db
      .prepare(
        `SELECT COALESCE(screen, '') AS screen, COALESCE(target, '') AS target, COUNT(*) AS c
         FROM events WHERE name = 'tap' AND day >= ? GROUP BY screen, target ORDER BY c DESC LIMIT 10`,
      )
      .all(dayAgo(6)) as { screen: string; target: string; c: number }[];
    const topScreens = this.db
      .prepare(
        `SELECT COALESCE(screen, '') AS screen, COUNT(*) AS c
         FROM events WHERE name = 'screen_view' AND day >= ? GROUP BY screen ORDER BY c DESC LIMIT 10`,
      )
      .all(dayAgo(6)) as { screen: string; c: number }[];
    const total = (this.db.prepare('SELECT COUNT(*) AS c FROM events').get() as { c: number }).c;
    return {
      dau: uniq(today),
      wau: uniq(dayAgo(6)),
      mau: uniq(dayAgo(29)),
      totalEvents: total,
      dauByDay: days,
      topTaps: topTaps.map((r) => ({ screen: r.screen, target: r.target, count: r.c })),
      topScreens: topScreens.map((r) => ({ screen: r.screen, count: r.c })),
    };
  }
}
