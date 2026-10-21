import 'react-native-svg';

/**
 * phosphor-react-native 아이콘 소스가 Svg에 className을 넘기는데,
 * 현재 react-native-svg 타입에는 없어서 타입 검사만 통과시키려는 보강. 런타임 영향 없음.
 */
declare module 'react-native-svg' {
  interface SvgProps {
    className?: string;
  }
}
