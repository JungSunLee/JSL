import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * SQLite 데이터베이스 (Node 내장 node:sqlite — 별도 설치 불필요).
 * 파일 하나(data/app.db)에 회원과 사용 로그를 저장한다. 테스트는 ':memory:'.
 * 운영 규모가 커지면 PostgreSQL 로 옮기되, 테이블 구조는 그대로 쓸 수 있게 설계했다.
 */
export function openDatabase(file: string): DatabaseSync {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      avatar_url TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      profile_json TEXT,              -- 키·몸무게·체형·온도감 (JSON)
      profile_consent_at TEXT,
      admin_memo TEXT,
      created_at TEXT NOT NULL,
      last_login_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_accounts (     -- 소셜 계정 연결 (한 사용자가 여러 로그인 수단)
      provider TEXT NOT NULL,
      provider_user_id TEXT NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      PRIMARY KEY (provider, provider_user_id)
    );
    CREATE INDEX IF NOT EXISTS idx_user_accounts_user ON user_accounts(user_id);

    CREATE TABLE IF NOT EXISTS events (            -- 사용 로그: 화면 보기, 버튼 누름 등
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ts TEXT NOT NULL,                            -- 발생 시각 (ISO)
      day TEXT NOT NULL,                           -- KST 날짜 YYYY-MM-DD (DAU/MAU 집계용)
      device_id TEXT NOT NULL,                     -- 앱 설치 단위 익명 ID
      user_id TEXT,                                -- 로그인했으면 사용자 ID
      session_id TEXT,
      name TEXT NOT NULL,                          -- 예: screen_view, tap
      screen TEXT,                                 -- 예: today, settings
      target TEXT,                                 -- 예: login_button, outfit_card
      props_json TEXT,                             -- 추가 정보 (JSON)
      platform TEXT,                               -- ios / android / web
      app_version TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_events_day ON events(day);
    CREATE INDEX IF NOT EXISTS idx_events_name ON events(name, target);
    CREATE INDEX IF NOT EXISTS idx_events_user ON events(user_id);
  `);
  return db;
}

/** KST 기준 날짜 문자열 */
export function kstDay(iso: string | Date): string {
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  return new Date(d.getTime() + 9 * 3600_000).toISOString().slice(0, 10);
}
