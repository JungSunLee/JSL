import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { analytics } from './analytics';

/** 화면이 보일 때마다 screen_view 로그를 남긴다 (탭 전환·뒤로 가기 포함) */
export function useScreenView(screen: string) {
  useFocusEffect(
    useCallback(() => {
      analytics.screen(screen);
    }, [screen]),
  );
}
