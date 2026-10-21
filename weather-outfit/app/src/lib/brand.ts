import Constants from 'expo-constants';

/** 앱 이름(가칭). 확정되면 여기와 app.json 의 name 만 바꾸면 된다. */
export const APP_NAME = Constants.expoConfig?.name ?? '우리집 옷날씨';

export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';

/** 추천 기능을 부르는 말. "코디" 대신 날씨·생활 앱에 어울리는 표현을 쓴다. */
export const WORDING = {
  feature: '옷차림 추천',
  today: '오늘의 옷차림',
  familyToday: '오늘 우리 가족 옷차림',
  items: '오늘 입을 옷',
};
