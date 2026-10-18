import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { UserProfile } from '@wo/core';
import type { ProviderId, SocialProfile } from './providers';

export type UserStatus = 'active' | 'suspended';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  accounts: { provider: ProviderId; providerUserId: string }[];
  /** 코디 추천용 신체·온도감 정보. 온보딩 전에는 없음 */
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

/**
 * MVP용 파일 기반 사용자 저장소. 운영 전환 시 DB(PostgreSQL 등)로 교체한다.
 * 가족 구성원·건강 정보는 서버에 저장하지 않는다 (기기에만 저장).
 */
export class UserStore {
  private users = new Map<string, User>();
  private loaded = false;
  private writing: Promise<void> = Promise.resolve();

  constructor(private readonly dir?: string) {}

  private get file() {
    return this.dir ? join(this.dir, 'users.json') : undefined;
  }

  private async load() {
    if (this.loaded) return;
    this.loaded = true;
    if (!this.file) return;
    try {
      const list = JSON.parse(await readFile(this.file, 'utf8')) as User[];
      for (const u of list) this.users.set(u.id, { ...u, status: u.status ?? 'active', lastLoginAt: u.lastLoginAt ?? u.createdAt });
    } catch {
      /* 최초 실행 */
    }
  }

  /** 쓰기를 직렬화하고 임시 파일 → rename 으로 원자적으로 저장 */
  private save() {
    const file = this.file;
    const dir = this.dir;
    if (!file || !dir) return Promise.resolve();
    const snapshot = JSON.stringify([...this.users.values()], null, 2);
    this.writing = this.writing.then(async () => {
      await mkdir(dir, { recursive: true });
      await writeFile(`${file}.tmp`, snapshot);
      await rename(`${file}.tmp`, file);
    });
    return this.writing;
  }

  async upsertFromProfile(p: SocialProfile, now = new Date()): Promise<User> {
    await this.load();
    const existing = [...this.users.values()].find((u) =>
      u.accounts.some((a) => a.provider === p.provider && a.providerUserId === p.providerUserId),
    );
    const ts = now.toISOString();
    const user: User = existing
      ? {
          ...existing,
          name: existing.name || p.name,
          email: p.email ?? existing.email,
          avatarUrl: p.avatarUrl ?? existing.avatarUrl,
          lastLoginAt: ts,
        }
      : {
          id: randomUUID(),
          name: p.name,
          email: p.email,
          avatarUrl: p.avatarUrl,
          accounts: [{ provider: p.provider, providerUserId: p.providerUserId }],
          status: 'active',
          createdAt: ts,
          lastLoginAt: ts,
        };
    this.users.set(user.id, user);
    await this.save();
    return user;
  }

  async get(id: string): Promise<User | undefined> {
    await this.load();
    return this.users.get(id);
  }

  async update(id: string, patch: Partial<Pick<User, 'name' | 'profile' | 'profileConsentAt' | 'status' | 'adminMemo'>>) {
    await this.load();
    const u = this.users.get(id);
    if (!u) return undefined;
    const next = { ...u, ...patch };
    this.users.set(id, next);
    await this.save();
    return next;
  }

  async delete(id: string): Promise<boolean> {
    await this.load();
    const ok = this.users.delete(id);
    if (ok) await this.save();
    return ok;
  }

  async list(query: UserQuery = {}) {
    await this.load();
    const q = query.q?.trim().toLowerCase();
    const pageSize = Math.min(Math.max(query.pageSize ?? 20, 1), 100);
    const page = Math.max(query.page ?? 1, 1);
    const all = [...this.users.values()]
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q) || u.id.startsWith(q))
      .filter((u) => !query.provider || u.accounts.some((a) => a.provider === query.provider))
      .filter((u) => !query.status || u.status === query.status)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { total: all.length, page, pageSize, items: all.slice((page - 1) * pageSize, page * pageSize) };
  }

  async all(): Promise<User[]> {
    await this.load();
    return [...this.users.values()];
  }
}
