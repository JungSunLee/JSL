# 서버 인터넷 배포 가이드 (Render.com 기준)

> 목표: 휴대폰·PC 어디서든 `https://내주소` 로 접속하면 **앱 웹 버전**이 뜨고, 같은 주소의 `/admin` 이 관리자 홈페이지, `/v1/...` 이 앱 API가 되게 한다.
> 서버 하나(Docker)에 세 가지를 모두 담았다. 데이터(SQLite)는 영구 디스크 `/data` 에 저장되어 재배포해도 남는다.

## 준비물
- GitHub 저장소 (JungSunLee/JSL) — 이미 있음
- 공공데이터포털 인증키 (`server/env.local.txt` 에 있는 `DATA_GO_KR_SERVICE_KEY` 값)
- Render.com 계정 (https://render.com — GitHub 계정으로 가입 가능). 영구 디스크는 Starter 플랜(월 7달러)이 필요합니다.

## 1. Render 에서 서비스 만들기 (약 10분)
1. https://dashboard.render.com 접속 → 오른쪽 위 **New +** → **Blueprint**
2. **Connect GitHub** 로 JungSunLee/JSL 저장소를 연결하고 선택
3. 저장소 안의 `weather-outfit/render.yaml` 을 자동으로 읽어 "nalssi-server" 서비스가 미리 채워집니다. **Apply** 를 누릅니다.
4. 환경변수 입력 화면이 나오면 아래처럼 채웁니다 (나중에 서비스 → **Environment** 탭에서도 바꿀 수 있어요).

| 이름 | 값 | 설명 |
|---|---|---|
| `DATA_GO_KR_SERVICE_KEY` | 내 인증키 | env.local.txt 의 값을 그대로 |
| `ADMIN_EMAIL` | 관리자 이메일 | 관리자 홈페이지 로그인 아이디 |
| `ADMIN_PASSWORD` | 12자 이상 비밀번호 | 관리자 홈페이지 로그인 비밀번호 |
| `PUBLIC_BASE_URL` | (배포 후 입력) | 예: `https://nalssi-server.onrender.com` |
| `KAKAO_REST_API_KEY` | (선택) | 넣으면 위치 → "성남시 중원구 중앙동" 지역명 변환이 서버에서도 됨 |

5. 첫 배포가 시작됩니다 (5~10분). 완료되면 서비스 상단에 `https://nalssi-server.onrender.com` 같은 주소가 생깁니다.
6. 그 주소를 복사해 **Environment** 탭의 `PUBLIC_BASE_URL` 에 넣고 저장 → 자동 재배포.

## 2. 잘 됐는지 확인
- `https://내주소/health` 를 열면 아래처럼 나와야 합니다.
  ```json
  {"ok":true,"live":true,"db":{"ok":true,"file":"/data/app.db","users":0},"devLogin":true,"version":"dev"}
  ```
  - `live: true` → 공공데이터 키가 인식됨 (실제 날씨). `false` 면 키를 다시 확인
  - `db.ok: true` → DB 파일이 영구 디스크에 만들어짐
- `https://내주소/` → 앱 웹 버전 (휴대폰 브라우저에서 열고 "홈 화면에 추가" 하면 앱처럼 쓸 수 있어요). 위치 권한을 허용하면 GPS 기준 날씨가 나옵니다.
- `https://내주소/admin` → 관리자 홈페이지

## 3. 이후 업데이트
master 에 PR 을 머지하면 Render 가 **자동으로 다시 배포**합니다 (Auto-Deploy 기본 켜짐). 따로 할 일 없음.

## 4. 데이터(DB) 관리
- 파일 위치: 영구 디스크 `/data/app.db` (SQLite, WAL 모드). 재배포·재시작해도 유지됩니다.
- 백업: Render 서비스 → **Disks** 탭 → **Snapshots** (일 1회 자동 스냅샷, 복원 가능)
- 용량: 1GB 로 시작. 사용 로그가 수십만 건이어도 수십 MB 수준이라 충분합니다.
- 회원이 수만 명 규모로 커지면 PostgreSQL 로 옮깁니다 (테이블 구조는 그대로 사용 가능하게 설계됨).

## 5. 로그인에 대해
- 소셜 로그인 키(카카오·네이버·구글)를 아직 넣지 않았으므로 지금은 **테스트 로그인**만 됩니다 (`ALLOW_DEV_LOGIN=true`).
  누구나 "테스트 사용자"로 들어올 수 있으니 **시범 운영 동안만** 켜 두고, 소셜 로그인 키를 넣은 뒤에는 `ALLOW_DEV_LOGIN` 을 `false` 로 바꾸세요.
- 소셜 로그인 키를 넣을 때 각 개발자 콘솔의 리다이렉트 주소는 `https://내주소/v1/auth/kakao/callback` 형식입니다 (`docs/03-setup-keys.md` 참고).

## 대안: Fly.io
`fly.toml` 도 함께 넣어 두었습니다. 터미널에서 `fly launch --no-deploy` → `fly volumes create data --size 1 --region nrt` → `fly secrets set DATA_GO_KR_SERVICE_KEY=... JWT_SECRET=... ADMIN_EMAIL=... ADMIN_PASSWORD=... PUBLIC_BASE_URL=https://nalssi-server.fly.dev` → `fly deploy`.

## 휴대폰 앱(스토어용) 빌드는?
안드로이드 APK / iOS 앱 파일은 Expo 의 **EAS Build** 로 만듭니다 (Expo 계정 필요, 무료 플랜 월 30회).
```bash
cd ~/Downloads/JSL/weather-outfit/app
npx eas-cli login          # expo.dev 계정
npx eas-cli build -p android --profile preview   # 설치용 APK
```
빌드 전에 `app/app.json` 의 `extra.apiBaseUrl` 을 배포 주소(`https://내주소`)로 바꿔야 합니다. 이 부분은 서버 배포가 끝난 뒤 함께 진행하면 됩니다.
