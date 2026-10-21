#!/usr/bin/env bash
# 앱의 웹 빌드를 만들고, 어느 경로에 올려도 동작하도록 주소를 상대 경로로 바꾼다.
# 사용: scripts/build-web-preview.sh <출력 폴더> [demo|live] [서버 주소]
#   demo : 서버 없이 예시 날씨 + 즉시 로그인 (기본)
#   live : PC에서 켠 API 서버(기본 http://localhost:4000)의 실제 날씨 + 테스트 로그인
set -euo pipefail
OUT="${1:?출력 폴더를 지정하세요}"
MODE="${2:-demo}"
API_URL="${3:-http://localhost:4000}"
cd "$(dirname "$0")/../app"
rm -rf "$OUT"
if [ "$MODE" = "live" ]; then
  EXPO_PUBLIC_API_URL="$API_URL" CI=1 npx expo export --platform web --clear --output-dir "$OUT" >/dev/null
else
  EXPO_PUBLIC_DEMO=1 CI=1 npx expo export --platform web --clear --output-dir "$OUT" >/dev/null
fi
cd "$OUT"
# 번들 안의 절대 경로(/_expo, /assets)를 상대 경로로
find _expo -name '*.js' -exec sed -i.bak 's#"/_expo/#"_expo/#g; s#"/assets/#"assets/#g' {} + && find _expo -name '*.bak' -delete
# 분할된 번들을 불러올 때 기준 주소를 현재 페이지 경로가 아닌 <base>로 잡는다
find _expo -name 'entry-*.js' -exec sed -i.bak 's#url:location.origin+location.pathname#url:document.baseURI#g' {} + && find _expo -name '*.bak' -delete
# index.html: 문서 기준 <base>를 심고, 라우터가 "/"에서 시작하도록 주소를 바꾼 뒤 번들을 읽는다
# (로그인 팝업 창(window.opener 있음)은 돌아온 주소(/auth#token=...)를 그대로 둬야 로그인이 완료된다)
sed -i.bak 's#src="/_expo/#src="_expo/#g; s#href="/favicon.ico"#href="favicon.ico"#g' index.html
sed -i.bak 's#<head>#<head><script>document.write(\x27<base href="\x27+location.href.replace(/[?\#].*$/,"").replace(/[^/]*$/,"")+\x27">\x27);if(!window.opener){try{history.replaceState(null,"","/"+location.hash)}catch(e){}}</script>#' index.html
rm -f index.html.bak metadata.json
echo "web preview ($MODE): $OUT"
