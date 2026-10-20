# 03. 실제 서비스 연결 가이드 (키 발급 · 로그인 · 보안)

앱은 지금 **예시 날씨**와 **테스트 로그인**으로 동작합니다. 아래 키를 발급받아 `weather-outfit/server/.env` 파일에 넣으면 실제 날씨와 실제 로그인이 동작합니다.
모든 발급은 **무료**이고, 각 단계는 10~20분 정도 걸립니다. 승인 대기가 있는 항목은 따로 표시했습니다.

> `.env` 파일은 비밀번호와 같습니다. GitHub에 올라가지 않도록 이미 막아 두었지만, 메신저·메일로도 보내지 마세요.

---

## 1. 실제 날씨·미세먼지·자외선 연결 — 공공데이터포털 (data.go.kr)

기상청과 한국환경공단의 공식 데이터입니다. **키 하나로 아래 4개 서비스를 모두** 씁니다.

### 1-1. 회원가입
1. https://www.data.go.kr 접속 → 오른쪽 위 **회원가입** → 개인 회원으로 가입 (휴대폰 본인인증)
2. 로그인

### 1-2. 서비스 4개 "활용신청"
아래 4개를 각각 검색해서 **활용신청** 버튼을 누릅니다. 신청 화면에서 묻는 내용은 모두 같습니다.

| 순서 | 검색어 | 서비스 이름 | 용도 |
|---|---|---|---|
| ① | `기상청_단기예보 조회서비스` | 기상청_단기예보 ((구)_동네예보) 조회서비스 | 현재 기온, 시간별 예보, 최저/최고 |
| ② | `기상청_생활기상지수 조회서비스` | 기상청_생활기상지수 조회서비스(3.0) | 자외선지수 |
| ③ | `한국환경공단_에어코리아_대기오염정보` | 한국환경공단_에어코리아_대기오염정보 | 미세먼지·초미세먼지 |
| ④ | `한국환경공단_에어코리아_측정소정보` | 한국환경공단_에어코리아_측정소정보 | 내 위치에서 가까운 측정소 찾기 |

활용신청 화면 입력 예시:
- **활용목적**: 앱 개발 (기타)
- **상세기능정보**: 전부 체크
- **활용 내용**: `날씨와 미세먼지에 맞춰 가족 구성원별 옷차림을 추천하는 모바일 앱`
- **라이선스 표시**: 동의

> ①②③④ 모두 **자동 승인**이라 신청 즉시 사용할 수 있습니다. (일부는 "심의"로 표시돼도 보통 1~2시간 내 승인됩니다.)

### 1-3. 인증키 복사
1. 로그인 후 **마이페이지 → 데이터활용 → Open API → 활용신청 현황**
2. 아무 서비스나 클릭하면 **일반 인증키 (Decoding)** 이 보입니다. 이 값을 복사합니다.
   - Encoding 키가 아니라 **Decoding** 키입니다. (`%` 기호가 없는 쪽)
3. `server/.env`에 붙여넣기:
   ```
   DATA_GO_KR_SERVICE_KEY=여기에_붙여넣기
   ```

### 1-4. 확인
서버를 다시 켜고 브라우저에서 `http://localhost:4000/health` 를 열어 `"live":true` 가 나오면 성공입니다. 앱 화면의 "데모" 표시가 사라지고 실제 지역 날씨가 나옵니다.

### 알아둘 점
- **일일 호출 한도**: 개발계정은 서비스당 하루 1만 건입니다. 서버에서 10~30분 단위로 저장해 두고 재사용하므로, 사용자 수백 명까지는 충분합니다. 사용자가 늘면 같은 화면에서 **운영계정 전환 신청**(무료, 심사 1~2일)을 하면 한도가 크게 올라갑니다.
- **출처 표시**: 공공누리 조건에 따라 앱에 "기상청·한국환경공단" 출처를 표시해야 합니다. 앱 "오늘" 화면 맨 아래에 이미 표시하고 있습니다.
- 키가 새로 발급된 직후에는 **최대 1시간** 동안 "SERVICE_KEY_IS_NOT_REGISTERED" 오류가 날 수 있습니다. 잠시 기다리면 됩니다.

---

## 2. 카카오 로그인 — Kakao Developers

카카오 키는 **로그인**과 **좌표 → 동네 이름 변환**(앱 상단 "서울 중구" 표시) 두 가지에 쓰입니다.

1. https://developers.kakao.com 접속 → 카카오 계정으로 로그인 → **내 애플리케이션 → 애플리케이션 추가하기**
   - 앱 이름: `우리집 옷날씨`, 회사명: 본인 이름 또는 회사명
2. 만든 앱 클릭 → **앱 설정 → 앱 키**에서 **REST API 키** 복사
   ```
   KAKAO_REST_API_KEY=여기에_붙여넣기
   ```
3. **제품 설정 → 카카오 로그인** → 활성화 설정 **ON**
4. 같은 화면 **Redirect URI** 등록:
   - 개발 중: `http://localhost:4000/v1/auth/kakao/callback`
   - 서버 배포 후: `https://내서버주소/v1/auth/kakao/callback` (둘 다 등록 가능)
5. **제품 설정 → 카카오 로그인 → 동의항목**: 닉네임(필수), 프로필 사진(선택), 카카오계정(이메일)(선택) 설정
   - 이메일은 "비즈 앱" 전환 후 필수로 받을 수 있습니다. 처음에는 선택으로 두면 됩니다.
6. **제품 설정 → 카카오 로그인 → 보안**: **Client Secret** 생성 → 활성화 상태 "사용함" → 코드 복사
   ```
   KAKAO_CLIENT_SECRET=여기에_붙여넣기
   ```
7. (선택) **앱 설정 → 플랫폼**에 Web 플랫폼 추가: `http://localhost:4000`

> 승인 대기 없이 바로 됩니다. 출시 전에 **비즈 앱 전환**(사업자등록번호 또는 개인개발자 인증)을 하면 이메일 필수 동의와 월간 사용자 제한 해제가 됩니다.

---

## 3. 네이버 로그인 — Naver Developers

1. https://developers.naver.com 접속 → 네이버 로그인 → **Application → 애플리케이션 등록**
2. 입력:
   - 애플리케이션 이름: `우리집 옷날씨`
   - 사용 API: **네이버 로그인** 선택
   - 제공 정보 선택: 회원이름(필수), 이메일(필수), 별명(선택), 프로필 사진(선택)
   - 로그인 오픈 API 서비스 환경: **PC웹** 추가
     - 서비스 URL: `http://localhost:4000`
     - 네이버 로그인 Callback URL: `http://localhost:4000/v1/auth/naver/callback`
     - (배포 후 `https://내서버주소/v1/auth/naver/callback` 추가)
3. 등록 완료 화면에서 **Client ID**, **Client Secret** 복사
   ```
   NAVER_CLIENT_ID=여기에
   NAVER_CLIENT_SECRET=여기에
   ```

> 승인 대기 없이 바로 됩니다. 단, 처음에는 "개발 중" 상태라 **등록한 테스트 아이디만** 로그인할 수 있습니다. 출시 전에 **애플리케이션 → 멤버관리 → 검수 요청**을 하면(1~3일) 모든 네이버 사용자가 로그인할 수 있습니다.

---

## 4. 구글 로그인 — Google Cloud Console

1. https://console.cloud.google.com 접속 → 구글 계정 로그인 → 위쪽 프로젝트 선택 → **새 프로젝트** (이름: `weatherfit`)
2. 왼쪽 메뉴 **API 및 서비스 → OAuth 동의 화면**
   - 사용자 유형: **외부**
   - 앱 이름: `우리집 옷날씨`, 지원 이메일: 본인 이메일, 개발자 연락처: 본인 이메일
   - 범위: `email`, `profile`, `openid` 추가
   - 테스트 사용자: 본인 구글 이메일 추가
3. **API 및 서비스 → 사용자 인증 정보 → 사용자 인증 정보 만들기 → OAuth 클라이언트 ID**
   - 애플리케이션 유형: **웹 애플리케이션** (앱이 아니라 "웹"입니다. 로그인을 서버가 처리하기 때문입니다)
   - 이름: `weatherfit-server`
   - 승인된 리디렉션 URI: `http://localhost:4000/v1/auth/google/callback`
     (배포 후 `https://내서버주소/v1/auth/google/callback` 추가)
4. 만들어진 **클라이언트 ID**, **클라이언트 보안 비밀번호** 복사
   ```
   GOOGLE_CLIENT_ID=여기에
   GOOGLE_CLIENT_SECRET=여기에
   ```

> "테스트" 상태에서는 등록한 테스트 사용자만 로그인됩니다. 출시 전에 OAuth 동의 화면에서 **앱 게시**를 누르면 모든 사용자가 로그인할 수 있습니다. (이메일·프로필만 요청하므로 구글 검수 없이 게시됩니다.)

---

## 5. 관리자 홈페이지 계정

`server/.env`에 직접 정합니다.
```
ADMIN_EMAIL=본인이메일@example.com
ADMIN_PASSWORD=12자이상_영문숫자특수문자_섞어서
```
실제 서비스 환경에서는 12자 미만이면 서버가 켜지지 않습니다.

---

## 6. 모두 넣은 뒤 `.env` 예시

```
PORT=4000
PUBLIC_BASE_URL=http://localhost:4000
JWT_SECRET=아무_긴_임의_문자열_32자_이상_xxxxxxxxxxxxxxxx
APP_REDIRECT_ALLOWLIST=weatherfit://,exp://,http://localhost:8081

DATA_GO_KR_SERVICE_KEY=...
KAKAO_REST_API_KEY=...
KAKAO_CLIENT_SECRET=...
NAVER_CLIENT_ID=...
NAVER_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

ALLOW_DEV_LOGIN=true
ADMIN_EMAIL=...
ADMIN_PASSWORD=...
```

`JWT_SECRET`은 로그인 토큰을 서명하는 비밀값입니다. 아무 문자열이나 길게(32자 이상) 넣으면 됩니다. 터미널에서 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 로 만들 수 있습니다.

---

## 7. GitHub 저장소 보안 (한 번만)

1. **비공개로 전환**: https://github.com/JungSunLee/JSL/settings → 맨 아래 **Danger Zone → Change repository visibility → Make private**
2. **2단계 인증**: https://github.com/settings/security → Two-factor authentication 켜기
3. **master 보호**: https://github.com/JungSunLee/JSL/settings/branches → **Add branch ruleset** (또는 Add rule)
   - 대상: `master`
   - 체크: `Require a pull request before merging`, `Block force pushes`, `Restrict deletions`
   - 승인 인원(Required approvals)은 **0**으로 두세요. 혼자 작업하는 저장소에서 1 이상이면 본인 PR을 합칠 수 없습니다.
4. **Claude 앱 권한 확인**: https://github.com/settings/installations → Claude → Configure → Repository access가 **Only select repositories: JSL** 인지 확인

---

## 8. 서버를 인터넷에 올리기 (휴대폰에서 실제로 쓰려면)

지금은 PC에서만 서버가 돕니다. 휴대폰에서 어디서나 쓰려면 서버를 인터넷에 올려야 합니다. 작게 시작하기 좋은 곳:

| 서비스 | 비용 | 장점 |
|---|---|---|
| **Fly.io** | 소규모 무료~월 $5 | 도쿄 리전(한국과 가까움), Node 배포 간단 |
| **Railway** | 월 $5~ | 설정이 가장 쉬움 |
| **네이버클라우드 / AWS 라이트세일** | 월 5천원~ | 국내 리전, 익숙한 환경 |

올린 뒤 할 일:
1. `.env`의 `PUBLIC_BASE_URL`을 `https://실제주소`로 변경
2. 카카오·네이버·구글 콘솔에 `https://실제주소/v1/auth/.../callback` 추가
3. `app/eas.json`의 `EXPO_PUBLIC_API_URL`을 실제 주소로 변경
4. 회원 저장소를 파일(`server/data/users.json`)에서 데이터베이스로 바꾸기 (서버를 다시 배포해도 회원 정보가 남도록). 요청하시면 바로 작업합니다.

배포 작업은 계정만 만들어 주시면 설정 파일과 명령어를 제가 준비해 드립니다.
