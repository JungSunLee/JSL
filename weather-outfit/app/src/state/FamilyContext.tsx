import type { FamilyMember } from '@wo/core';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getJson, setJson } from '@/lib/storage';

const MEMBERS_KEY = 'family.members.v1';
const CONSENT_KEY = 'family.healthConsent.v1';

/**
 * 가족 프로필은 MVP 단계에서 기기에만 저장한다.
 * 건강 상태는 개인정보보호법상 민감정보이므로, 별도 동의(healthConsent) 후에만 입력받는다.
 */
interface FamilyState {
  ready: boolean;
  members: FamilyMember[];
  healthConsent: boolean;
  upsert(m: FamilyMember): Promise<void>;
  remove(id: string): Promise<void>;
  setHealthConsent(v: boolean): Promise<void>;
}

const FamilyContext = createContext<FamilyState | null>(null);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [healthConsent, setConsent] = useState(false);

  useEffect(() => {
    Promise.all([getJson<FamilyMember[]>(MEMBERS_KEY, []), getJson(CONSENT_KEY, false)]).then(([m, c]) => {
      setMembers(m);
      setConsent(c);
      setReady(true);
    });
  }, []);

  const persist = useCallback(async (next: FamilyMember[]) => {
    setMembers(next);
    await setJson(MEMBERS_KEY, next);
  }, []);

  const upsert = useCallback(
    async (m: FamilyMember) => {
      const i = members.findIndex((x) => x.id === m.id);
      await persist(i >= 0 ? members.map((x) => (x.id === m.id ? m : x)) : [...members, m]);
    },
    [members, persist],
  );

  const remove = useCallback(async (id: string) => persist(members.filter((m) => m.id !== id)), [members, persist]);

  /** 동의 철회 시 입력된 건강 정보(질환·체온)를 즉시 삭제 */
  const setHealthConsent = useCallback(
    async (v: boolean) => {
      setConsent(v);
      await setJson(CONSENT_KEY, v);
      if (!v) await persist(members.map((m) => ({ ...m, conditions: [], bodyTempC: undefined })));
    },
    [members, persist],
  );

  const value = useMemo(
    () => ({ ready, members, healthConsent, upsert, remove, setHealthConsent }),
    [ready, members, healthConsent, upsert, remove, setHealthConsent],
  );
  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used within FamilyProvider');
  return ctx;
}
