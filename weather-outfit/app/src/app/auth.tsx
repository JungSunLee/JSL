import { Redirect } from 'expo-router';

/** 로그인 후 weatherfit://auth 딥링크로 돌아올 때 빈 화면 대신 홈으로 */
export default function AuthReturn() {
  return <Redirect href="/" />;
}
