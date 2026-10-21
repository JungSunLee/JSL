import { memberFromProfile, type FamilyMember } from '@wo/core';
import { useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useFamily } from './FamilyContext';

export const ME_ID = 'me';

/**
 * 로그인 전·프로필 입력 전에 보여주는 "일반 기준" 구성원.
 * 30대 성인, 보통 체형, 추위·더위 보통, 출퇴근 정도의 활동량.
 */
export const GENERIC_MEMBER: FamilyMember = {
  id: 'generic',
  name: '일반 기준',
  relation: 'other',
  birthYear: new Date().getFullYear() - 35,
  sensitivity: 0,
  conditions: [],
  activity: 'commute',
  bodyType: 'average',
  emoji: '👤',
};

/** 옷차림 추천 대상: 로그인 + 프로필이 있으면 [나, ...가족], 아니면 빈 목록 */
export function useOutfitMembers(): FamilyMember[] {
  const { user } = useAuth();
  const { members } = useFamily();
  return useMemo(() => {
    if (!user?.profile) return [];
    return [memberFromProfile(ME_ID, user.name, user.profile), ...members.filter((m) => m.relation !== 'me')];
  }, [user, members]);
}
