# 01. 시장·경쟁 조사: 가족 맞춤 날씨 옷차림 추천 앱

- 작성일: 2026-10-17
- 범위: 국내·글로벌 날씨 앱 구성, 날씨 기반 옷차림 추천 유사 서비스, 공식 데이터 API, 소셜 로그인과 건강정보 법규
- 표기 규칙: 제품에 관한 사실 주장에는 출처 URL을 붙였습니다. 출처로 검증하지 못한 내용은 **확인 필요**로 표시했습니다.
- 조사 한계: 조사 환경에서 apps.apple.com, data.go.kr, kma.go.kr, kakaocorp.com, docs.expo.dev는 직접 열 수 없었습니다(DNS 차단). 그래서 해당 페이지 내용은 검색엔진이 색인한 본문 발췌로 확인했고, API 경로는 GitHub 공개 코드의 실제 호출 예로 교차 확인했습니다. 앱스토어 설명은 버전에 따라 바뀌므로 기획을 확정하기 전에 실기기에서 한 번 더 확인해야 합니다.

---

## 0. 핵심 결론 (TL;DR)

1. 국내 주요 날씨 앱(기상청 날씨알리미, 네이버, 다음, 케이웨더, 웨더아이, 원기날씨)은 모두 **기온·시간별·주간·미세먼지·특보 알림** 중심입니다. 이 중 **옷차림 추천을 핵심 기능으로 둔 앱은 확인되지 않았습니다.** 네이버는 검색 AI 브리핑에서 "14도 옷차림" 같은 질의에 답하는 수준입니다.
2. 옷차림 추천 기능은 **날씨날씨(미세미세 계열)**, **날씨돌(날씨옷장)**, Weather Fit, Kirim, Fitcast, 핏프티 같은 **소규모 단일 사용자 앱**과, 에이클로젯·Whering·Cladwell·Smart Closet 같은 **디지털 옷장 앱**에 흩어져 있습니다.
3. **가족 구성원별 프로필(부모와 아이 각각), 나이, 건강 상태, 추위·더위 민감도를 함께 반영하는 서비스는 국내외 모두 확인되지 않았습니다.** 아이용 앱(Wetterbaby, Tiny Weather, Baby Weather & Outfit, Forecast & What to Wear)은 영유아 한 명 또는 교육용에 머뭅니다.
4. 국내 공식 데이터(기상청 단기·중기예보, 생활기상지수 V4 자외선, 에어코리아)를 조합한 **가족 단위 + 민감도 보정 + 쇼핑 연결**이 빈 자리입니다. 무신사는 2026년 대화형(카카오톡·ChatGPT) 추천에서 날씨를 맥락 요소로 쓰기 시작했으므로, 쇼핑 플랫폼이 이 영역에 들어오는 속도는 지켜봐야 합니다.
5. 건강 정보(지병, 체온 등)를 받으면 개인정보보호법상 **민감정보(제23조)**로 다룰 가능성이 크므로 별도 동의를 받아야 합니다. 14세 미만 자녀 정보는 **법정대리인 동의(제22조의2)**가 필요합니다. MVP에서는 건강 정보를 "추위 많이 탐 / 보통 / 더위 많이 탐" 같은 **민감도 슬라이더로 추상화**해 받는 쪽을 권합니다.

---

## 1. 국내 주요 날씨 앱 구성 분석

### 1.1 요약 표

| 앱 | 메인 화면 구성(확인된 범위) | 미세먼지 | 생활지수 | 옷차림 추천 | 비즈니스 모델 |
|---|---|---|---|---|---|
| 기상청 날씨알리미 | 관심 지역 날씨, 위험기상(지진·특보) 알림, 위젯, 제보 | 확인 필요 | 확인 필요 | 확인되지 않음 | 공공(무료) |
| 네이버 날씨 | 시간별 예보 비교(강수확률 포함), 날씨 지도 6종, 최대 56시간 재생 | 한·중·일 초미세먼지 흐름 지도 | 확인 필요 | 검색 AI 브리핑의 옷차림 답변만 있음 | 포털 광고·검색 |
| 다음(카카오) 날씨 | 동네날씨/전국/영상/기상특보 탭, 실시간·시간별·주간, 예보사 선택, CCTV | 미세먼지·황사·오존, 영상 탭 | 확인 필요 | 확인되지 않음 | 포털 광고 |
| 케이웨더 날씨 | 카드형 구성(순서 변경 가능), 오늘·내일 예보 푸시, 레이더 | 동 단위 실황 지도, 자체 미세먼지 예보 | 확인 필요 | 확인되지 않음 | 광고 제거를 내세움, 공기질 B2B·기기 연동(Air365) |
| 웨더아이 | 현재 기온을 어제 같은 시각과 비교, 3시간 간격 예보, 11일 예보 | 미세먼지 농도 | 불쾌지수 | 확인되지 않음 | 민간 기상사업자, 확인 필요 |
| 원기날씨 | 동·읍·면 날씨, 즐겨찾기 5곳, 위젯 여러 크기, 날씨 연동 배경 테마 | 에어코리아 기반, WHO 또는 국내 기준 선택 | 확인 필요 | 확인되지 않음 | 무료 배포. 유료 플랜은 확인 필요 |
| (참고) 날씨날씨 | 쉬운 말 예보("약한 비"), 강수 알림 | 있음(미세미세 계열) | 체감온도 | **있음** | 확인 필요 |

### 1.2 앱별 상세

**기상청 날씨알리미 (공식)**
- 사용자 위치를 기준으로 지진·기상특보 같은 위험기상정보를 알려 주는 맞춤형 알림 서비스로 소개됩니다. 관심 지역 날씨 조회, 위젯, 지진 같은 특이현상 제보·공유 기능이 있습니다. 출처: https://apps.apple.com/kr/app/id1495603760 , https://v.daum.net/v/20250717175711979?f=p
- 출시 관련 기상청 보도자료(2020-01-29): https://www.kma.go.kr/kma/flexer/html/press/2020/01/29/ATC202001291444121_1fda2aeb-d5c8-49c7-bb1d-39ab89875c88.hwp.files/Sections1.html (본문 직접 열람 불가, **확인 필요**)
- 옷차림 기능은 확인되지 않았습니다. 기상청 생활기상지수는 웹(날씨누리)과 API로 따로 제공됩니다(5장 참조). 출처: https://data.kma.go.kr/data/lwi/lwiRltmList.do

**네이버 날씨**
- 2023년 개편에서 기온·날씨·체감기온·강수·풍속과 바람·습도·바다 등 6종 정보별 지도와 최대 56시간 시간별 예보 재생을 추가했습니다. 출처: https://news.bizwatch.co.kr/article/mobile/2023/09/13/0009
- 시간별 예보 비교 항목에 강수확률을 추가하고, 해외 지역 날씨까지 범위를 넓혔습니다. 출처: https://byline.network/2023/07/28-312/
- 대기질은 한·중·일 초미세먼지 흐름 지도로 제공합니다(2017년 강화). 출처: https://news.bizwatch.co.kr/article/mobile/2017/05/05/0001
- 옷차림: 네이버 검색 "AI 브리핑"이 "14도 날씨 옷차림" 같은 질의에 이미지 콘텐츠와 요약 코디(경량 패딩, 니트 등)를 보여 줍니다(2025-03-27 정식 출시 보도). 날씨 탭에 개인화된 옷차림 카드가 있는지는 **확인 필요**합니다. 출처: https://www.hankyung.com/article/202503273377g
- 2026년 8월 KT와 협력해 생활 밀착형 공기질 정보를 고도화한다는 보도가 있습니다. 세부 내용은 **확인 필요**합니다. 출처: https://www.insight.co.kr/news/346587 , https://www.venturesquare.net/817792/
- 비즈니스 모델: 포털 검색·광고(일반적 추정. 날씨 단독 수익 구조는 **확인 필요**).

**다음/카카오 날씨**
- 2024-07-25 날씨 전용 페이지를 열었습니다. 탭은 동네날씨/전국/영상/기상특보이고, 동네날씨 탭은 실시간·시간별·주간 예보를 보여 줍니다. 케이웨더·아큐웨더 등 예보 업체를 골라 볼 수 있고 주변 CCTV도 제공합니다. 영상 탭에서는 적외영상·레이더·대기흐름·미세먼지를 영상으로 보여 줍니다. 그 밖에 미세먼지·황사·오존, 일출·일몰, 월출·월몰, 날씨 뉴스를 제공합니다. 출처: https://www.kakaocorp.com/page/detail/11165 , https://www.ddaily.co.kr/page/view/2024072509103668756
- 당시 9월 업데이트로 내 지역 날씨 알람과 골프장·야구장 테마 날씨를 예고했습니다. 실제 반영 여부는 **확인 필요**합니다(같은 출처).
- 2025년 1월 다음 앱 전면 개편 뒤 날씨는 홈 탭의 생활 정보 중 하나로 들어갔습니다. 출처: https://news.mtn.co.kr/news-detail/2025011318030477993
- 옷차림 기능은 확인되지 않았습니다.

**케이웨더 날씨 / 케이웨더 Air365**
- 날씨 앱: 자체 예보센터가 만든 기상·미세먼지 예보, 동 단위 미세먼지 실황 지도, 레이더, 오늘·내일 예보와 사전 강수 푸시를 제공합니다. 날씨 카드 순서를 카테고리별로 바꿀 수 있고 광고를 없앴다고 밝힙니다. 현재 날씨는 기상청 관측값으로 1시간마다 갱신됩니다. 출처: https://apps.apple.com/KR/app/id372326740
- Air365: 실내외 측정기 기반으로 PM10, PM2.5, CO2, 온습도, VOC, 소음 등 8종을 기본으로 최대 20종을 보여 줍니다. 공기질 등급이 바뀌면 푸시를 보내고, 일부 통계는 유료(프리미엄)이며, 공기청정기·환기청정기 같은 가전과 연동됩니다. 출처: https://apps.apple.com/us/app/id1525303049 , https://news.bizwatch.co.kr/article/market/2024/02/05/0010
- 비즈니스 모델: 측정기·B2B 공기질 관리(예: 취약계층시설 환기청정기)와 유료 기능. 출처: https://www.mt.co.kr/stock/2024/10/10/2024101009059667837
- 생활지수와 옷차림은 앱 설명에서 확인되지 않았습니다(**확인 필요**).

**웨더아이(weatheri)**
- 2016-10-19 앱 출시 공지가 있습니다. 전 세계 약 3만 개 지역의 11일 예보, 국내 3시간 간격 예보를 제공하고, 현재 기온·체감 날씨를 어제 같은 시각과 비교합니다. 미세먼지 농도, 불쾌지수, 일출·일몰, 반경 10km 강수 감지 푸시, 특보 발표·해제 푸시, 태풍 정보도 있습니다. 출처: https://weatheri.co.kr/board/board03_read.php?id=267
- 현재 앱스토어 상태와 최신 기능은 **확인 필요**합니다(2016년 공지 이후 자료를 확인하지 못함).

**원기날씨**
- 기상청 데이터로 동·읍·면 단위 날씨를 보여 주고, 즐겨찾기를 최대 5곳 저장합니다. 미세먼지는 에어코리아 데이터를 쓰며 WHO 기준과 국내 기준 중 고를 수 있습니다. 위젯은 여러 크기로 제공하고, 눈·비·대기질 악화 알림과 날씨에 따라 바뀌는 배경·아이콘 테마가 있습니다. 기상청 모바일 앱 공모전 우수상 수상작으로 소개됩니다. iPhone 전용·무료입니다. 출처: https://apps.apple.com/kr/app/id1118737186
- 옷차림 기능은 확인되지 않았고, 유료 플랜은 **확인 필요**합니다.

**기타 국내 앱(참고)**
- 오늘날씨: 시간별 대기질(AQI, PM10, PM2.5, 오존)과 통합대기지수, 체감온도·불쾌지수·자외선 같은 생활지수를 제공합니다. 출처: https://apps.apple.com/kr/app/id1041700694
- 웨더링크: 기상청 등 여러 데이터 소스의 예보를 비교하고, 이슬점·자외선·가시거리·초미세먼지 등 세부 정보를 보여 줍니다. 출처: https://apps.apple.com/kr/app/%EC%9B%A8%EB%8D%94%EB%A7%81%ED%81%AC-%EA%B8%B0%EC%83%81%EC%B2%AD-%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80-%EB%82%A0%EC%94%A8-%ED%8A%B9%EB%B3%B4/id6738366207
- 에어코리아(공식): 우리동네 대기정보. 출처: https://apps.apple.com/ch/app/%EC%97%90%EC%96%B4%EC%BD%94%EB%A6%AC%EC%95%84-%EC%9A%B0%EB%A6%AC%EB%8F%99%EB%84%A4%EB%8C%80%EA%B8%B0%EC%A0%95%EB%B3%B4/id873915685
- 삼성 날씨(One UI 8): 테스트 빌드 유출 자료에서 날씨에 맞는 옷을 입은 캐릭터가 걸어 들어오는 애니메이션이 확인됐습니다. 시간별 기온·강수, 자외선, 일출·일몰, 꽃가루 정보가 함께 표시됩니다. 정식 기능으로 출시됐는지는 **확인 필요**합니다. 출처: https://9to5google.com/2025/04/22/one-ui-8-weather-app/ , https://www.sammobile.com/news/one-ui-8-weather-app-desing-first-look-leak/

### 1.3 국내 앱 공통 패턴(기획 시사점)
- 첫 화면 순서: **현재 기온·체감 → 시간별 스트립 → 주간 → 미세먼지 → 특보/알림**. 생활지수는 하위 카드나 별도 메뉴로 빠지는 경우가 많습니다.
- 미세먼지는 한국 앱의 필수 카드이고, 대부분 에어코리아 데이터를 씁니다(원기날씨는 출처를 명시).
- "예보 수치를 쉬운 말로 풀어 주는" 방향(날씨날씨의 "약한 비")과 "어제와 비교"(웨더아이)가 사용자 이해를 높이는 장치로 쓰입니다.

---

## 2. 글로벌 주요 날씨 앱: UI 구성 패턴(시안 참고)

| 앱 | 구성·패턴 | 수익 모델 |
|---|---|---|
| Apple Weather | 위치별 스크롤 화면. 가로 스와이프 **시간별 스트립**, **10일 예보**(강수확률·최고/최저 막대), 모듈 카드(대기질은 "더 보기"로 건강 정보·오염물질 상세), 확대 가능한 **지도 오버레이**(강수·대기질·기온). iOS 26에서 여행지 예측 기반 악천후 알림과 위젯 추가 | OS 기본 앱 |
| Google(Pixel Weather) | 드래그 앤 드롭 **데이터 블록** 커스터마이즈, 상단 **AI Weather Report**(예: "아침 기온 쾌적, 자외선 높음"), 날씨 지도, 12시간 분 단위 강수, AI 배경. 심각한 특보가 있으면 AI 리포트 숨김 | OS 기본 앱 |
| AccuWeather | **MinuteCast**(분 단위 강수, 2~4시간. 문서마다 범위 다름), **RealFeel / RealFeel Shade**(햇빛·그늘 체감), 지도 레이어 | 광고 + 구독(Premium+ $3.99/월, $24.99/년, 미국 기준). Premium은 2025-09-02부터 신규 판매 중단 |
| The Weather Channel | 레이더 중심. 프리미엄 레이더·정밀 강수 타임라인은 유료라는 보도 | 광고 + 구독(가격 **확인 필요**) |
| CARROT Weather | "성격 있는" 대사, **UI 전체 커스터마이즈**, Sky 레이아웃(사실적 날씨 효과), 데이터 소스 전환 | Premium / Premium Ultra / **Premium Family(가족 공유 최대 5인)** 구독 |
| Windy | 지도 중심(50종 이상 레이어). ECMWF·GFS·ICON 등 **모델 비교** | 무료 + Premium(15일 시간별, 레이더 아카이브 등) |

출처
- Apple: https://support.apple.com/102594 , https://support.apple.com/en-am/guide/ipod-touch/iph1ac0b35f/ios , https://www.mactrast.com/2025/06/ios-26-watchos-26-brings-severe-weather-alerts-and-widgets-for-locations-you-may-visit/
- Google Pixel Weather: https://www.androidauthority.com/pixel-8-ai-weather-forecast-3581759 , https://apkmirror.com/apk/google-inc/weather-14
- AccuWeather: https://app.accuweather.com/app-download , https://support.accuweather.com/?p=81
- The Weather Channel: 최근(2025~2026) 공식 리디자인 발표는 찾지 못했습니다(**확인 필요**). 과거 리디자인 참고: https://www.iclarified.com/22025/the-weather-channel-app-gets-a-major-redesign
- CARROT: https://apps.apple.com/us/app/carrot-weather-alerts-radar/id961390574 , https://www.applevis.com/apps/ios/weather/carrot-weather-alerts-radar
- Windy: https://apps.apple.com/kr/app/windy-com-필요한-유일한-날씨-앱/id1161387262 , https://www.thegreatoutdoorsmag.com/?p=54585

**시안에 가져올 패턴**
1. **상단 히어로 = 한 줄 요약**: Pixel의 AI Weather Report처럼 "오늘 아이는 얇은 패딩 + 마스크, 아빠는 바람막이" 같은 문장 카드를 맨 위에 둡니다.
2. **가로 시간별 스트립**: Apple과 Google 공통 패턴입니다. 등원·출근·하원 시각을 스트립 위에 마커로 표시합니다.
3. **모듈형 카드(재배치 가능)**: Pixel의 데이터 블록, 케이웨더의 카드 순서 변경처럼 사용자가 순서를 바꿀 수 있게 합니다.
4. **체감 보정 표기**: AccuWeather RealFeel Shade처럼 햇빛·그늘 차이를 보여 주는 방식을 "사람별 체감" 표기로 확장합니다.
5. **가족 공유 과금**: CARROT의 Premium Family(최대 5인)가 가족 단위 구독의 선례입니다.
6. **위젯**: 잠금화면·홈 위젯에 "가족 구성원별 아이콘 + 핵심 아이템"을 넣습니다.

---

## 3. 유사 서비스(날씨 기반 옷차림 추천)

### 3.1 국내

| 서비스 | 하는 일 | 가족/다중 프로필 | 나이·건강·민감도 | 쇼핑 연계 | 상태 |
|---|---|---|---|---|---|
| 날씨날씨(미세미세 계열, LifeOverflow) | 체감온도·바람·습도·**활동시간**을 반영한 기온별 옷차림, 쉬운 말 예보, 강수 알림 | 확인되지 않음 | 확인되지 않음 | 확인되지 않음 | 앱스토어 등록(활성) |
| 날씨돌(Hecto Innovation) | **날씨옷장**: 체감온도로 오늘·내일 코디 추천, 실제 입은 옷과 그날 날씨를 기록해 "나만의 체감온도 옷장" 만들기, 음성 브리핑, 위젯 7종 | 확인되지 않음 | **개인 기록으로 체감 학습**(민감도에 가까움) | 확인되지 않음 | 활성(iOS 15+, iPhone) |
| Weather Fit | 남녀 캐릭터가 날씨에 맞는 옷을 입은 모습, 위젯, 프리미엄(광고 제거, 레이더, 데이터 소스 선택) | 확인되지 않음 | 확인되지 않음 | 확인되지 않음 | 활성, 구독 |
| Kirim - 기온별 옷차림 | 외출 시간대의 평균 기온·강수확률에 맞춘 옷차림, 위젯 | 확인되지 않음 | 확인되지 않음 | 확인되지 않음 | 등록 확인 |
| Fitcast / 옷차림표 류 | 28도 이상부터 영하 5도 이하까지 10단계 기온별 옷차림 가이드 | 없음 | 없음 | 없음 | 등록 확인 |
| 핏프티 | 영하 15도부터 영상 35도까지 날씨별 코디 추천 | 확인되지 않음 | 확인되지 않음 | 지그재그 카테고리 표기(연계 여부 **확인 필요**) | 등록 확인 |
| Weady | 출근·퇴근 시점 날씨 비교, 캐릭터 착장, 기상청·에어코리아 데이터 | 확인되지 않음 | 확인되지 않음 | 확인되지 않음 | 등록 확인 |
| 에이클로젯(Acloset) | AI 디지털 옷장. 날씨·일정·TPO 기반 데일리 코디 추천, 위시리스트 아이템 활용 | 확인되지 않음 | 없음 | 위시리스트(구매 연계 정도는 **확인 필요**) | 활성 |
| 무신사 | 2026-03 "ChatGPT for Kakao" 패션 파트너, 2026-06 ChatGPT 전용 앱. **TPO·날씨·시즌 맥락**으로 상품 추천 | 없음 | 없음 | **직접 커머스** | 활성(대화형) |
| 지그재그 | 날씨 코디 기능은 확인되지 않음 | - | - | - | **확인 필요** |
| 네이버 AI 브리핑 | "N도 옷차림" 검색에 요약 코디와 이미지 | 없음 | 없음 | 쇼핑형 브리핑 유형 존재 | 활성 |
| 한국관광공사 '꾸온꾸' | 여행지 날씨에 맞춘 옷차림(2022 오픈 보도) | 없음 | 없음 | 확인 필요 | 현재 운영 여부 **확인 필요** |

출처
- 날씨날씨: https://apps.apple.com/kr/app/%EB%82%A0%EC%94%A8%EB%82%A0%EC%94%A8-%EB%82%A0%EC%94%A8-%EB%AF%B8%EC%84%B8%EB%A8%BC%EC%A7%80-%EA%B8%B0%EC%98%A8%EB%B3%84-%EC%98%B7%EC%B0%A8%EB%A6%BC/id1462255869
- 날씨돌: https://apps.apple.com/kr/app/id6740074461
- Weather Fit: https://apps.apple.com/KR/app/id1194408342
- Kirim: https://apps.apple.com/us/app/kirim-%EA%B8%B0%EC%98%A8%EB%B3%84-%EC%98%B7%EC%B0%A8%EB%A6%BC/id6443530004?l=ko
- Fitcast: https://apps.apple.com/kr/app/fitcast-%EA%B8%B0%EC%98%A8%EB%B3%84-%EC%98%B7%EC%B0%A8%EB%A6%BC/id6474090221 , 10단계 앱: https://mwm.ai/apps/app/6759080588
- 핏프티: https://apps.apple.com/es/app/%ED%95%8F%ED%94%84%ED%8B%B0-%EB%82%A0%EC%94%A8%EC%97%90-%EB%A7%9E%EB%8A%94-%EC%BD%94%EB%94%94-%EC%B6%94%EC%B2%9C/id6444907480?l=ca
- Weady: https://mwm.ai/apps/weady/6768869837
- 에이클로젯: https://apps.apple.com/KR/app/id1542311809 , https://www.allurekorea.com/?p=206734
- 무신사: https://newsroom.musinsa.com/newsroom-menu/2026-0324 , https://www.heraldk.com/article/2026032317473837764 , https://www.heraldk.com/article/2026060815331772445
- 네이버 AI 브리핑: https://www.hankyung.com/article/202503273377g
- 꾸온꾸: https://lady.khan.co.kr/travel/article/202210070928021
- 학술 참고(체감온도 공식만으로 옷차림을 추천하는 방식의 한계 논의): https://www.koreascience.or.kr/article/CFKO202232249583461.pdf

### 3.2 글로벌

| 서비스 | 하는 일 | 가족/다중 프로필 | 나이·건강·민감도 | 쇼핑 연계 | 상태 |
|---|---|---|---|---|---|
| Whering | 디지털 옷장. **W Pick**이 개인 스타일과 예보로 매일 코디 제안, Dress Me 셔플 | 없음 | 없음 | 리테일러 이미지·위시리스트(제휴 수익은 확인되지 않음) | 활성, 무료 |
| Cladwell | 보유 옷·날씨·자주 입는 옷 기반 데일리 코디 | 없음 | 없음 | 확인 필요 | 활성(iOS 26 대응 업데이트) |
| Smart Closet: Your AI Stylist | 실시간 날씨 기반 제안, 코디 캘린더 | 없음 | 없음 | 확인 필요 | 활성 |
| Indyx | 옷장 정리, 사람 스타일리스트(유료). 날씨 기능은 확인되지 않음 | 없음 | 없음 | 리세일·스타일링 | 활성 |
| Stylebook | 캘린더·착용당 비용·패킹. 날씨 추천은 확인되지 않음 | 없음 | 없음 | - | 활성 |
| Fits | 옷장·코디 메이커. 날씨 기능은 확인되지 않음 | 없음 | 없음 | - | 활성(iOS) |
| What2Wear(여러 동명 앱) | (1) AI 옷장: 날씨·기온·최근 착용 반영 (2) 스포츠용: 기온과 개인 선호 반영 | 없음 | 개인 선호(스포츠판) | 확인 필요 | 활성 |
| Weather: What to Wear / Weather & Outfit Planner | 예보 기반 옷 제안, AI 스타일 팁, 프리미엄 | 없음 | 없음 | 확인 필요 | 활성 |
| Forecast & What to Wear (아이) | 아이용 예보와 옷 추천, 아바타 입히기 게임, **온도 구간 사용자 정의** | 아바타 8종(프로필 저장은 확인되지 않음) | 온도 구간 커스텀 | 없음 | 활성 |
| Tiny Weather: Dress Baby Right | 5세 이하. 기온·체감·바람·강수·습도 반영, 여행 패킹 리스트 | 확인되지 않음 | **나이** | 없음 | 활성 |
| Baby Weather & Outfit | 아이 나이를 입력하면 발달 단계에 맞춘 옷 추천 | 확인되지 않음 | **나이** | 없음 | 활성 |
| Wetterbaby | 약 2세까지. 오늘·내일·모레 머리부터 발끝까지 추천, UV 지수, Plus 7일 체험 | 확인되지 않음 | 나이 | 확인 필요 | 활성 |
| Reima 앱 | 아동복 브랜드 앱. 날씨 기반 아이 옷차림 제안과 장비 알림 | "kid(s)" 표기(다중 여부 **확인 필요**) | 확인 필요 | **자사 브랜드 커머스** | 확인 필요 |
| Layerly | 아기 나이, **개인 체온 선호(warmth preference)**, 실제 보유 옷, 활동(집·산책·차량)을 결합한 웹 도구 | 확인되지 않음 | **나이 + 민감도** | 확인되지 않음 | 개발자 소개 단계 |
| iDress for Weather / My Weather - For Kids | 특수교육·교육용 그림 기반 옷 고르기 | 없음 | 없음 | 없음 | 교육용 |
| "Dress My Kid", "Dressed" | 해당 이름의 앱은 찾지 못했습니다 | - | - | - | **확인 필요** |

출처
- Whering: https://whering.co.uk/faq/outfit-suggestions-on-Whering , https://getwardrobe.com/compare/whering/
- Cladwell: https://apps.apple.com/app/id1140550878
- Smart Closet: https://apps.apple.com/us/app/id1263105601
- Indyx: https://apps.apple.com/us/app/-/id1599179405 , https://getwardrobe.com/compare/indyx/ (경쟁사 작성)
- Stylebook: https://www.whowhatwear.com/stylebook-app
- Fits: https://fits-app.com/posts/top-8-closet-outfit-planning-apps-reviewed
- What2Wear: https://mwm.ai/apps/ai/6764898167 , https://apps.apple.com/lb/app/what2wear/id6468504368
- Weather: What to Wear: https://apps.apple.com/app/id6748601093 , Weather & Outfit Planner: https://apps.apple.com/kr/app/%EB%82%A0%EC%94%A8-%EB%B0%8F-%EC%9D%98%EC%83%81-%ED%94%8C%EB%9E%98%EB%84%88/id6737645412
- Forecast & What to Wear: https://apps.apple.com/app/id1396769360
- Tiny Weather: https://apps.apple.com/app/id6745492497
- Baby Weather & Outfit: https://mwm.ai/apps/app/6757762387
- Wetterbaby: https://www.wetterbaby.com/en/app
- Reima: https://apps.appfollow.io/ios/reima/1465067591?country=pt
- Layerly: https://fi.linkedin.com/in/klimakovoleg (개발자 게시물, 신뢰도 낮음)
- iDress for Weather: https://www.commonsensemedia.org/app-reviews/idress-for-weather , My Weather: https://apps.apple.com/app/id947134111

---

## 4. 차별화 포인트 결론

### 4.1 직접 대응되는 서비스가 있는가?
**확인된 범위에서는 없습니다.** 아래 네 조건을 모두 갖춘 서비스는 국내외에서 찾지 못했습니다.

| 조건 | 가장 가까운 사례 | 부족한 점 |
|---|---|---|
| 가족 구성원별 프로필(부모 + 아이 여러 명) | CARROT Premium Family(결제 공유일 뿐 옷 추천 아님), Forecast & What to Wear(아바타) | 구성원별 추천이 없음 |
| 나이·건강·추위/더위 민감도 반영 | Tiny Weather·Baby Weather(나이), Layerly(warmth preference), 날씨돌(개인 기록), What2Wear 스포츠판(개인 선호) | 영유아 한정이거나 1인 기준 |
| 한국 공식 데이터(기상청 + 에어코리아) | 원기날씨, Weady, 날씨날씨 | 가족 옷차림 기능 없음 |
| 쇼핑 연계 | 무신사 대화형 추천, Reima(자사몰), 에이클로젯 위시리스트 | 날씨·가족 프로필과 결합되지 않음 |

### 4.2 공백과 기회
1. **"우리 가족 오늘 옷차림" 한 화면**: 엄마·아빠·첫째·둘째 카드를 가로로 넘기는 구성입니다. 각 카드에 겉옷, 레이어 수, 우산, 마스크(PM2.5), 선크림·모자(UV)를 보여 줍니다.
2. **시간대 기반 추천**: 등원(08:30)과 하원(16:00)의 기온 차를 반영해 "벗기 쉬운 레이어"를 추천합니다. Kirim과 Weady가 시간대 개념을 쓰지만 1인용입니다.
3. **민감도 보정 + 피드백 학습**: "추위 탐 -2 ~ 더위 탐 +2" 보정값으로 체감 기준을 옮깁니다. 날씨돌처럼 "오늘 추웠어요/더웠어요" 피드백을 받아 개인 보정값을 학습합니다.
4. **건강 조건 규칙**: 천식·비염은 PM2.5와 PM10 기준을 낮추고, 영유아·고령자는 폭염·한파 기준을 강화합니다(**의학적 기준은 전문가 검토 필요**). 질병관리청은 2026년 체감온도 38℃ 이상에서 고령층과 기저질환자의 위험이 커진다고 발표했고, 2026년부터 폭염중대경보가 신설됐습니다. 출처: https://www.kdca.go.kr/bbs/kdca/41/311676/artclView.do , https://wikidocs.net/blog/@goodhosup/27457/ (블로그, 기상청 원문 **확인 필요**)
5. **쇼핑 연결은 "부족한 아이템" 중심으로**: "둘째 우비 없음" 같은 옷장 갭이나 다음 주 한파 예보를 근거로 추천하면 일반 광고보다 전환 근거가 분명합니다. 무신사가 대화형 채널에서 날씨 맥락 추천을 시작했으므로 **제휴(어필리에이트) 또는 API 연동 후보**로 검토합니다.
6. **리스크**: 삼성 날씨나 Pixel AI 리포트 같은 OS 기본 앱이 옷차림 요약을 기본 탑재하면 1인용 추천은 빠르게 범용화됩니다. 차별화의 축은 **가족 + 민감도 + 아이**입니다.

---

## 5. 공식 데이터 소스 확인

> 공통: 공공데이터포털(data.go.kr) 활용신청 후 serviceKey를 발급받습니다. 디코딩 키에 들어 있는 `+ / =` 문자는 반드시 URL 인코딩해야 합니다(그렇지 않으면 `SERVICE_KEY_IS_NOT_REGISTERED_ERROR`). 출처: https://pub.dev/documentation/data_go_kr/latest/
> 아래 경로는 data.go.kr 색인 정보와 GitHub 공개 코드의 실제 호출 예로 교차 확인했습니다. **파라미터 세부와 응답 스키마는 각 서비스의 활용가이드(docx/hwp) 원문과 한 번 더 대조해야 합니다.**

### 5.1 기상청 단기예보 조회서비스 (VilageFcstInfoService_2.0)
- 포털: https://www.data.go.kr/data/15084084/openapi.do
- Base URL: `https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0`
- 오퍼레이션
  - `getUltraSrtNcst`: 초단기실황(현재 관측)
  - `getUltraSrtFcst`: 초단기예보(약 6시간)
  - `getVilageFcst`: 단기예보(초단기 이후부터 최대 5일). 출처: https://data.kma.go.kr/community/nuriLovePopup.do
  - `getFcstVersion`: 예보 버전 조회(**확인 필요**)
- 공통 요청 파라미터: `serviceKey`, `pageNo`, `numOfRows`, `dataType=JSON`, `base_date=YYYYMMDD`, `base_time=HHmm`, `nx`, `ny`(5km 격자 좌표). 위경도를 격자로 바꾸는 LCC 변환은 활용가이드의 변환 코드를 사용합니다.
  - base_date는 최근 3일까지만 조회할 수 있습니다. 출처: https://data.kma.go.kr/community/nuriLovePopup.do
  - 전국을 5km 격자 37,697개로 나누며, 예보가 1시간 단위로 상세화됐습니다. 출처: https://www.data.go.kr/data/15084084/openapi.do
  - 단기예보 base_time은 02/05/08/11/14/17/20/23시(하루 8회)로 알려져 있습니다(**활용가이드로 확인 필요**).
- 카테고리 코드
  - 초단기실황/예보: `T1H`(기온), `RN1`(1시간 강수량), `SKY`(하늘상태, 예보만), `PTY`(강수형태), `REH`(습도), `UUU`/`VVV`(동서·남북 바람성분), `VEC`(풍향), `WSD`(풍속), `LGT`(낙뢰, 예보만). 출처(실사용 코드): https://github.com/WizardFactory/TodayWeather (server2/tools/golden/kma_s3/grid-fixtures.js)
    - 같은 코드에 따르면 2026-06-23 11시 발표분부터 초단기예보에 `POP`이 추가된 것으로 처리돼 있습니다. **공식 공지 확인 필요**.
  - 단기예보: `TMP`(1시간 기온), `TMN`(일 최저), `TMX`(일 최고), `SKY`, `PTY`, `POP`(강수확률), `PCP`(1시간 강수량, 문자열 범주), `SNO`(1시간 신적설), `REH`, `WSD`, `VEC`, `UUU`, `VVV`, `WAV`(파고). 코드 목록은 활용가이드 기준이며 **원문 대조 필요**.
- 트래픽: **개발계정 10,000건/일**. 운영계정은 활용사례를 등록해 증량을 신청하며, 무료이고 개발·운영 모두 자동승인입니다. 출처: https://www.data.go.kr/data/15084084/openapi.do
- 대안 경로: 기상청 API허브 `https://apihub.kma.go.kr/api/typ02/openApi/...`(authKey 방식)에서도 같은 서비스를 호출하는 사례가 있습니다. 출처: https://github.com/murianwind/weather-calendar (update_calendar.py)

### 5.2 기상청 생활기상지수 조회서비스 3.0 (LivingWthrIdxServiceV5)
- 포털: https://www.data.go.kr/en/data/15085288/openapi.do
- Base URL: `https://apis.data.go.kr/1360000/LivingWthrIdxServiceV5`
- 제공 지수: 자외선지수, 대기정체지수, (여름철) 대상별 체감온도. 출처: 위 포털 페이지
- 오퍼레이션(실사용 코드로 확인)
  - `getUVIdxV5`: 자외선지수. 파라미터 `serviceKey`, `areaNo`(10자리 행정구역코드, 예: 1121571000), `time=YYYYMMDDHH`, `dataType=JSON`, `pageNo`, `numOfRows`. 출처: https://github.com/ShimPyoSo/ShimPyo_FE (src/app/api/uv/route.ts), https://github.com/d4eh0/pack-for-today (src/pages/api/uv.js)
  - `getAirDiffusionIdxV4`: 대기정체지수. 출처: https://github.com/yeonjulee1005/dewdew_v3 (stores/locationWeatherData.ts)
  - `getSenTaIdxV4`: 체감온도(포털 예시 오퍼레이션). 출처: https://www.data.go.kr/en/data/15085288/openapi.do
- 자외선 단계: 낮음 3 미만, 보통 3~5, 높음 6~7, 매우높음 8~10, 위험 11 이상(연중 제공). 출처: https://data.kma.go.kr/data/lwi/lwiRltmList.do
- 주의: 기상청 자료포털에 "체감온도 서비스는 2026-05-11 종료"되고 "대상·환경별 세분화된 체감온도 서비스로 변경"된다는 안내가 있습니다. `getSenTaIdxV4`의 현재 제공 여부와 후속 서비스명은 **확인 필요**합니다. 출처: https://data.kma.go.kr/data/lwi/lwiRltmList.do
- 트래픽: **확인 필요**(포털 상세 페이지에서 확인)

### 5.3 기상청 중기예보 조회서비스 (MidFcstInfoService)
- 포털(파일 데이터 페이지): https://www.data.go.kr/data/15043491/fileData.do (Open API 상세 페이지 번호는 **확인 필요**)
- Base URL: `https://apis.data.go.kr/1360000/MidFcstInfoService`
- 오퍼레이션: `getMidFcst`(중기전망, `stnId`), `getMidLandFcst`(육상예보: 강수확률·하늘상태, `regId`), `getMidTa`(기온: 최저·최고, `regId`), `getMidSeaFcst`(해상). 출처: https://github.com/WizardFactory/TodayWeather (server/lib/collectTownForecast.js, server2/src/domestic/family.rs)
- 공통 파라미터: `serviceKey`, `dataType`, `pageNo`, `numOfRows`, `regId`(예보구역코드), `tmFc=YYYYMMDDHHmm`(06시 또는 18시 발표). 4~7일차는 오전/오후로, 8~10일차는 일 단위로 제공합니다. 출처: https://www.data.go.kr/data/15043491/fileData.do , https://malgleam.hexdocs.pm/malgleam/mid_term.html
- 트래픽: **확인 필요**

### 5.4 에어코리아 대기오염정보 (ArpltnInforInqireSvc)
- 포털: https://www.data.go.kr/data/15073861/openapi.do (색인 페이지는 확인하지 못함. 측정소별 실시간 신규 데이터셋 https://data.go.kr/catalog/15156659/openapi.json 도 있으므로 **어느 쪽이 현행인지 확인 필요**)
- Base URL: `https://apis.data.go.kr/B552584/ArpltnInforInqireSvc`
- 오퍼레이션
  - `getMsrstnAcctoRltmMesureDnsty`: 측정소별 실시간 측정정보. 파라미터 `serviceKey`, `returnType=json`, `numOfRows`, `pageNo`, `stationName`(예: 강남구), `dataTerm`(DAILY / MONTH / 3MONTH), `ver`(1.3 또는 1.4 등. 버전에 따라 PM2.5 등급·1시간 값 등 응답 필드가 늘어남). 출처: https://github.com/jeremyko/airwatch_tft_240_240_pio (README), https://github.com/NomaDamas/k-skill (docs/features/fine-dust-location.md), https://github.com/sungholion/EZDG_OpenData
  - `getCtprvnRltmMesureDnsty`: 시도별 실시간 측정정보. 파라미터 `sidoName`(서울, 경기 등), `ver`. 출처: https://wikidocs.net/110747 , https://github.com/WizardFactory/TodayWeather (docs/rewrite/external-providers.md, `ver=1.3`)
  - `getMinuDustFrcstDspth`: 미세먼지 예보통보(`searchDate=YYYY-MM-DD`, `ver=1.1`). 출처: 위 TodayWeather 문서
- 측정 항목: PM10, PM2.5, O3, NO2, CO, SO2, 통합대기지수(KHAI). 출처: https://data.go.kr/catalog/15156659/openapi.json
- 운영계정: 포털에서 "한국환경공단 에어코리아 OpenAPI 기술문서"의 신청 가이드를 따르라고 안내합니다. 출처: https://www.data.go.kr/biz/dcat/metadata/15073877.do
- 트래픽: 개발계정 한도는 **확인 필요**(흔히 500건/일로 알려져 있으나 출처로 검증하지 못함)
- 구 도메인 `openapi.airkorea.or.kr`은 폐기됐고 `apis.data.go.kr/B552584`로 일원화된 것으로 정리돼 있습니다. 출처: https://github.com/WizardFactory/TodayWeather (docs/architecture/weather-collection.md)

### 5.5 에어코리아 측정소정보 (MsrstnInfoInqireSvc)
- 포털: https://www.data.go.kr/biz/dcat/metadata/15073877.do (신규 영문 데이터셋: https://data.go.kr/catalog/15156708/openapi.json)
- Base URL: `https://apis.data.go.kr/B552584/MsrstnInfoInqireSvc`
- 오퍼레이션
  - `getNearbyMsrstnList`: 근접측정소 목록. 파라미터 `serviceKey`, `returnType=json`, `tmX`, `tmY`(**TM 좌표**), `ver=1.1`(선택). 가까운 순서로 측정소명(`stationName`)과 거리를 반환합니다.
  - `getMsrstnList`: 측정소 목록(`dmX`/`dmY` 좌표 포함)
  - `getTMStdrCrdnt`: 읍면동 이름으로 TM 기준좌표 조회(오퍼레이션명은 **확인 필요**)
  - 출처: https://www.data.go.kr/biz/dcat/metadata/15073877.do , https://github.com/WizardFactory/TodayWeather (docs/rewrite/external-providers.md), https://github.com/boostcamp3-iOS/team-c2 (FineDust/Dust/DustObservatoryManager.swift)
- **좌표 변환**: GPS(WGS84) 값을 TM으로 바꿔야 합니다. TodayWeather는 Kakao 좌표 변환 API를 먼저 호출합니다. 서버에서 proj4로 직접 변환할 수도 있는데, 이때 TM 원점·타원체 정의(EPSG 코드)는 **기술문서로 확인 필요**합니다.
- 권장 흐름: 위경도 → TM 변환 → `getNearbyMsrstnList` → 1순위 stationName으로 `getMsrstnAcctoRltmMesureDnsty` 호출 → 값이 비어 있으면 2순위 측정소로 넘어갑니다.

### 5.6 라이선스(공공누리)
- 기상청 저작권 정책: 공공누리 제1~4유형이 붙은 자료는 유형별 조건을 지켜야 하고, 공공누리 표시가 없는 자료는 사전 협의가 필요합니다(문의: 정보통신기술과 02-2181-0432). 출처: https://www.kma.go.kr/kma/guide/copyright.jsp
- 제1유형은 출처를 표시하면 상업적 이용과 변경이 가능합니다. 출처: https://wiki.openstreetmap.org/wiki/Ko:Korea_Open_Government_License
- **각 API의 실제 공공누리 유형은 포털 상세 페이지의 "이용허락범위"로 확인 필요**합니다. 앱 안에 "자료: 기상청, 한국환경공단(에어코리아)"라는 출처 표기는 넣어 두는 쪽이 안전합니다.
- 에어코리아 실시간 자료는 확정 전 값으로 바뀔 수 있다는 고지 문구를 화면에 넣기를 권합니다(일반 관행, **에어코리아 고지 원문 확인 필요**).

### 5.7 아키텍처 메모
- 앱이 공공 API를 직접 호출하지 않게 합니다. **서버에서 수집·캐시**합니다(격자 nx·ny 단위, 측정소 단위). 그래야 키가 노출되지 않고 일 트래픽 한도도 지킬 수 있습니다. TodayWeather는 여러 키를 순환하고 할당량을 초과(HTTP 429 / 코드 22)하면 다음 키로 넘어가는 방식으로 운영합니다(참고 사례).

---

## 6. 소셜 로그인 구현 메모 (Expo / React Native)

### 6.1 라이브러리

| 제공자 | 권장 라이브러리 | Expo 설정 | Expo Go 사용 |
|---|---|---|---|
| 카카오 | `@react-native-seoul/kakao-login` | config plugin(`kakaoAppKey`, 선택: `overrideKakaoSDKVersion`). Android는 `expo-build-properties`로 카카오 Maven 저장소 추가 | **불가**. Development Build(EAS 또는 로컬 빌드)만 지원 |
| 네이버 | `@react-native-seoul/naver-login` | config plugin(`urlScheme`). `initialize({consumerKey, consumerSecret, appName, serviceUrlSchemeIOS})`. iOS `LSApplicationQueriesSchemes`에 `naversearchapp`, `naversearchthirdlogin` 추가 | 문서는 dev client 사용을 안내합니다. Expo Go 불가 여부는 명시돼 있지 않지만 네이티브 SDK이므로 사실상 불가로 판단합니다(**확인 필요**) |
| 구글 | `@react-native-google-signin/google-signin` 또는 `react-native-nitro-google-signin` | config plugin과 development build가 필요합니다. Android Credential Manager는 nitro 쪽이 기본 지원하고, google-signin은 유료 버전에서 제공합니다 | **불가**(커스텀 네이티브 코드) |
| 구글(대안) | `expo-auth-session` (브라우저 기반 OAuth) | 브라우저를 엽니다. Expo는 가능하면 제공자 공식 네이티브 라이브러리를 쓰라고 권장합니다. SDK 53에서 Google 흐름 회귀 이슈가 보고됐습니다 | Expo Go에서 동작하는지는 **확인 필요** |

출처
- 카카오: https://github.com/crossplatformkorea/react-native-kakao-login
- 네이버: https://github.com/crossplatformkorea/react-native-naver-login
- 구글: https://docs.expo.dev/guides/google-authentication/ , https://docs.expo.dev/versions/latest/sdk/auth-session/ , https://clerk.com/articles/expo-google-sign-in-without-a-webview-the-native-approach-using-clerk
- Apple 로그인: App Store 심사 지침상 제3자 소셜 로그인을 넣으면 "Sign in with Apple" 같은 동등한 옵션이 요구될 수 있습니다(지침 4.8). **현행 지침 원문 확인 필요**.

### 6.2 권장 구성
- **결론: Expo Go는 포기하고 처음부터 EAS Development Build로 갑니다.** 카카오·네이버·구글 네이티브 SDK가 모두 dev build를 요구합니다.
- 토큰 처리: 앱이 받은 제공자 access token(또는 Google idToken)을 **자체 서버로 보냅니다. 서버가 제공자 API로 검증한 뒤 자체 세션/JWT를 발급**하는 구조입니다.
- **대안: 서버 사이드 OAuth(웹 리다이렉트)**
  - 앱에서 `expo-web-browser`나 AuthSession으로 `https://api.<도메인>/auth/{kakao|naver|google}/start`를 엽니다. 서버가 authorize, callback, code 교환을 처리한 뒤 앱 딥링크(`myapp://auth?token=...`)로 돌려보냅니다.
  - 장점: 네이티브 SDK 없이 세 제공자를 같은 코드로 처리하고, client secret이 서버에만 있습니다. 단점: 카카오톡·네이버 앱 간편 로그인(앱 전환) UX를 못 쓰고 브라우저를 거칩니다.
  - MVP는 웹 리다이렉트로 빠르게 시작하고, 정식 출시 때 카카오만 네이티브 SDK로 바꾸는 단계적 전략도 가능합니다.

### 6.3 개인정보보호법: 건강정보 = 민감정보
- 건강 관련 정보는 개인정보보호법 **제23조와 시행령 제18조의 민감정보**에 속합니다(개인정보위 2024 해석 사례집 소개). 민감정보는 **다른 개인정보 처리 동의와 별도로 동의**를 받아야 하고, 안전성 확보 조치 의무가 따릅니다. 출처: https://shinkim.com/kor/media/newsletter/2510 , https://www.sen.go.kr/resources/www/data/infoprotect_3_03.pdf
- **만 14세 미만 아동**의 개인정보를 처리하려면 **법정대리인 동의**가 필요하고 동의 사실을 확인해야 합니다(제22조의2, 2023-03-14 개정으로 신설). 출처: https://www.nepla.ai/wiki/it-정보-방송통신/개인정보-위치정보-신용정보/아동의-개인정보-보호-g6w93voqnojp
  - 이 앱에서는 부모 계정이 자녀 프로필을 만드는 구조입니다. 그래서 가입한 부모가 곧 법정대리인으로서 자녀 정보 처리에 동의하는 절차(체크박스와 기록 보관)를 설계해야 합니다.
- 체온 값 자체가 "건강정보"인지는 처리 목적과 맥락에 따라 판단이 달라질 수 있습니다(**법률 자문 필요**). 보수적으로 민감정보에 준해 다루기를 권합니다.
- **설계 권고**
  1. MVP는 "추위 많이 탐 / 보통 / 더위 많이 탐"과 "실외활동 많음" 같은 **선호·체감 정보만** 받고, 질병명은 받지 않습니다.
  2. 2단계에서 "호흡기 민감(미세먼지 기준 강화)" 같은 건강 옵션을 넣을 때 **민감정보 별도 동의 화면**, 목적 제한, 암호화 저장, 삭제 기능을 함께 갖춥니다.
  3. 위치정보도 받으므로 「위치정보법」상 위치기반서비스사업 신고 대상인지 검토합니다(**확인 필요**).

### 6.4 체온 데이터: Apple HealthKit / Google Health Connect
- **Apple HealthKit**
  - `HKQuantityTypeIdentifier.bodyTemperature`(체온, 체온계 등 기기 입력·수동 입력)를 사용자 권한 아래 읽을 수 있습니다. Info.plist에 `NSHealthShareUsageDescription`이 필요합니다. 출처: https://developer.apple.com/documentation/healthkit/hkquantitytypeidentifier/bodytemperature (페이지 본문 렌더링 불가, 세부 **확인 필요**)
  - Apple Watch 수면 중 손목 온도(`appleSleepingWristTemperature`)도 제3자 앱이 HealthKit으로 읽는 사례가 있습니다. Series 8 / Ultra 이상이어야 하고 수면 집중 모드 조건이 붙으며, 기준선 대비 편차 위주라 "현재 체온"으로 쓰기는 어렵습니다. 출처: https://developer.apple.com/forums/thread/725445 , https://apps.apple.com/us/app/watch-wrist-temp/id6740745491
- **Google Health Connect**
  - `BodyTemperatureRecord`(권한 `android.permission.health.READ_BODY_TEMPERATURE`), `SkinTemperatureRecord`(`READ_SKIN_TEMPERATURE`, 편차 시계열), `BasalBodyTemperatureRecord`(주기 추적)가 있습니다. 출처: https://developer.android.com/health-and-fitness/health-connect/data-types
  - RN에서는 `react-native-health-connect`를 씁니다. Android 전용이고 Expo는 config plugin과 dev build가 필요합니다(Expo Go 불가). 사용자가 권한 요청을 두 번 거절하면 다시 요청할 수 없습니다. 출처: https://github.com/matinzd/react-native-health-connect/wiki , https://dev.to/tapan-7/integrating-health-connect-in-android-react-native-apps-2cj4
- **판단**: 체온 연동은 데이터를 가진 사용자가 적고(웨어러블·스마트 체온계 보유자), 민감정보 부담이 큽니다. **MVP에서는 제외하고**, 2단계에서 "아이가 열이 있으면 외출 대신 실내 옷차림 안내" 같은 기능의 옵션으로 검토합니다.

---

## 부록 A. 확인 필요 목록(다음 단계 액션)
1. 각 앱 실기기 캡처로 메인 화면 구성 확인: 네이버 날씨 생활지수·옷차림 카드 유무, 기상청 날씨알리미 생활지수 유무, 케이웨더 생활지수
2. data.go.kr 상세 페이지: 생활기상지수 V4·중기예보·에어코리아의 일 트래픽과 공공누리 유형
3. 기상청 "대상·환경별 체감온도" 후속 API 이름과 엔드포인트(2026-05-11 이후)
4. 초단기예보 `POP` 추가(2026-06) 공식 공지
5. 에어코리아 TM 좌표계 정의, `getTMStdrCrdnt` 오퍼레이션명, `ver` 최신값
6. 무신사·지그재그·29CM 제휴 프로그램(어필리에이트/파트너 API) 존재 여부
7. App Store 지침 4.8(Sign in with Apple)과 위치정보법 신고 필요 여부
8. 민감정보 범위(체온, "추위 탐" 같은 체질 정보)에 대한 법률 자문
