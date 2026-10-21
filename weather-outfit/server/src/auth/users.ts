import { randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import type { UserProfile } from '@wo/core';
import type { ProviderId, SocialProfile } from './providers';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  accounts: { provider: ProviderId; providerUserId: string }[];
  /** 옷차림 추천용 신체·온도감 정보. 온보딩 전에는 없음 */
  profile?: UserProfile;
  /** 프로필(키·몸무게·체형) 수집·이용 동의 시각 */
  profileConsentAt?: string;
  status: UserStatus;
  /** 관리자 메모 (사용자에게 노출되지 않음) */
  adminMemo?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface UserQuery {
  q?: string;
  provider?: ProviderId;
  status?: UserStatus;
  page?: number;
  pageSize?: number;
}

interface Row {
  id: string;
  name: string;
  email: string | null;
  avatar_url: string | null;
  status: UserStatus;
  profile_json: string | null;
  profile_consent_at: string | null;
  admin_memo: string | null;
  created_at: string;
  last_login_at: string;
}

/**
 * SQLite 기반 사용자 저장소.
 * 가족 구성원·건강 정보는 서버에 저장하지 않는다 (기기에만 저장).
 */
export class UserStore {
  constructor(private readonly db: DatabaseSync) {}

  private accountsOf(userId: string) {
    return this.db
      .prepare('SELECT provider, provider_user_id FROM user_accounts WHERE user_id = ?')
      .all(userId)
      .map((r) => {
        const a = r as { provider: ProviderId; provider_user_id: string };
        return { provider: a.provider, providerUserId: a.provider_user_id };
      });
  }

  private toUser(r: Row): User {
    return {
      id: r.id,
      name: r.name,
      email: r.email ?? undefined,
      avatarUrl: r.avatar_url ?? undefined,
      accounts: this.accountsOf(r.id),
      profile: r.profile_json ? (JSON.parse(r.profile_json) as UserProfile) : undefined,
      profileConsentAt: r.profile_consent_at ?? undefined,
      status: r.status,
      adminMemo: r.admin_memo ?? undefined,
      createdAt: r.created_at,
      lastLoginAt: r.last_login_at,
    };
  }

  async upsertFromProfile(p: SocialProfile, now = new Date()): Promise<User> {
    const ts = now.toISOString();
    const link = this.db
      .prepare('SELECT user_id FROM user_accounts WHERE provider = ? AND provider_user_id = ?')
      .get(p.provider, p.providerUserId) as { user_id: string } | undefined;

    if (link) {
      this.db
        .prepare('UPDATE users SET email = COALESCE(?, email), avatar_url = COALESCE(?, avatar_url), last_login_at = ? WHERE id = ?')
        .run(p.email ?? null, p.avatarUrl ?? null, ts, link.user_id);
      return (await this.get(link.user_id))!;
    }

    const id = randomUUID();
    this.db
      .prepare('INSERT INTO users (id, name, email, avatar_url, status, created_at, last_login_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, p.name, p.email ?? null, p.avatarUrl ?? null, 'active', ts, ts);
    this.db
      .prepare('INSERT INTO user_accounts (provider, provider_user_id, user_id) VALUES (?, ?, ?)')
      .run(p.provider, p.providerUserId, id);
    return (await this.get(id))!;
  }

  async get(id: string): Promise<User | undefined> {
    const r = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as Row | undefined;
    return r ? this.toUser(r) : undefined;
  }

  async update(id: string, patch: Partial<Pick<User, 'name' | 'profile' | 'profileConsentAt' | 'status' | 'adminMemo'>>) {
    const u = await this.get(id);
    if (!u) return undefined;
    const next = { ...u, ...patch };
    this.db
      .prepare('UPDATE users SET name = ?, profile_json = ?, profile_consent_at = ?, status = ?, admin_memo = ? WHERE id = ?')
      .run(next.name, next.profile ? JSON.stringify(next.profile) : null, next.profileConsentAt ?? null, next.status, next.adminMemo ?? null, id);
    return this.get(id);
  }

  async delete(id: string): Promise<boolean> {
    const r = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return r.changes > 0;
  }

  async list(query: UserQuery = {}) {
    const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
    const page = Math.max(query.page ?? 1, 1);
    const where: string[] = [];
    const args: (string | number)[] = [];
    if (query.q?.trim()) {
      const q = `%${query.q.trim().toLowerCase()}%`;
      where.push("(LOWER(name) LIKE ? OR LOWER(COALESCE(email, '')) LIKE ? OR id LIKE ?)");
      args.push(q, q, `${query.q.trim()}%`);
    }
    if (query.provider) {
      where.push('id IN (SELECT user_id FROM user_accounts WHERE provider = ?)');
      args.push(query.provider);
    }
    if (query.status) {
      where.push('status = ?');
      args.push(query.status);
    }
    const w = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = (this.db.prepare(`SELECT COUNT(*) AS c FROM users ${w}`).get(...args) as { c: number }).c;
    const rows = this.db
      .prepare(`SELECT * FROM users ${w} ORDER BY created_at DESC LIMIT ? OFFSET ?`)
      .all(...args, pageSize, (page - 1) * pageSize) as unknown as Row[];
    return { total, page, pageSize, items: rows.map((r) => this.toUser(r)) };
  }

  async all(): Promise<User[]> {
    return (this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as unknown as Row[]).map((r) => this.toUser(r));
  }
}
