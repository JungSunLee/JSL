import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ProviderId, SocialProfile } from './providers';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  accounts: { provider: ProviderId; providerUserId: string }[];
  createdAt: string;
}

/**
 * MVP용 파일 기반 사용자 저장소. 운영 전환 시 DB(PostgreSQL 등)로 교체한다.
 * 건강 관련 정보는 서버에 저장하지 않는다 (가족 프로필은 기기에만 저장).
 */
export class UserStore {
  private users = new Map<string, User>();
  private loaded = false;

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
      for (const u of list) this.users.set(u.id, u);
    } catch {
      /* 최초 실행 */
    }
  }

  private async save() {
    if (!this.file || !this.dir) return;
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.file, JSON.stringify([...this.users.values()], null, 2));
  }

  async upsertFromProfile(p: SocialProfile): Promise<User> {
    await this.load();
    const existing = [...this.users.values()].find((u) =>
      u.accounts.some((a) => a.provider === p.provider && a.providerUserId === p.providerUserId),
    );
    const user: User = existing
      ? { ...existing, name: p.name || existing.name, email: p.email ?? existing.email, avatarUrl: p.avatarUrl ?? existing.avatarUrl }
      : {
          id: randomUUID(),
          name: p.name,
          email: p.email,
          avatarUrl: p.avatarUrl,
          accounts: [{ provider: p.provider, providerUserId: p.providerUserId }],
          createdAt: new Date().toISOString(),
        };
    this.users.set(user.id, user);
    await this.save();
    return user;
  }

  async get(id: string): Promise<User | undefined> {
    await this.load();
    return this.users.get(id);
  }

  async delete(id: string): Promise<boolean> {
    await this.load();
    const ok = this.users.delete(id);
    if (ok) await this.save();
    return ok;
  }
}
