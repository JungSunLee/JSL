import { jwtVerify, SignJWT } from 'jose';
import { randomBytes } from 'node:crypto';
import type { ProviderId } from './providers';

export class Tokens {
  private key: Uint8Array;

  constructor(secret: string) {
    this.key = new TextEncoder().encode(secret);
  }

  /** OAuth state: 위변조 방지 + 앱 복귀 주소를 서명해서 전달 */
  async signState(provider: ProviderId, appRedirect: string): Promise<string> {
    return new SignJWT({ p: provider, r: appRedirect, n: randomBytes(8).toString('hex') })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('10m')
      .setAudience('oauth-state')
      .sign(this.key);
  }

  async verifyState(state: string): Promise<{ provider: ProviderId; appRedirect: string }> {
    const { payload } = await jwtVerify(state, this.key, { audience: 'oauth-state' });
    return { provider: payload.p as ProviderId, appRedirect: payload.r as string };
  }

  async signAccess(userId: string): Promise<string> {
    return new SignJWT({})
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(userId)
      .setIssuedAt()
      .setExpirationTime('30d')
      .setAudience('app')
      .sign(this.key);
  }

  async verifyAccess(token: string): Promise<string> {
    const { payload } = await jwtVerify(token, this.key, { audience: 'app' });
    if (!payload.sub) throw new Error('no subject');
    return payload.sub;
  }
}
