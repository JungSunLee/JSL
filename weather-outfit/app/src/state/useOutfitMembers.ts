import { memberFromProfile, type FamilyMember } from '@wo/core';
import { useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useFamily } from './FamilyContext';

export const ME_ID = 'me';

/** 코디 추천 대상: 로그인 + 프로필이 있으면 [나, ...가족], 아니면 빈 목록 */
export function useOutfitMembers(): FamilyMember[] {
  const { user } = useAuth();
  const { members } = useFamily();
  return useMemo(() => {
    if (!user?.profile) return [];
    return [memberFromProfile(ME_ID, user.name, user.profile), ...members.filter((m) => m.relation !== 'me')];
  }, [user, members]);
}
