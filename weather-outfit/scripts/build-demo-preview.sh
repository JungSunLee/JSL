#!/usr/bin/env bash
# 서버 없이 동작하는 데모 웹 빌드를 만들고, 어느 경로에 올려도 동작하도록 주소를 상대 경로로 바꾼다.
# 사용: scripts/build-demo-preview.sh <출력 폴더>
set -euo pipefail
OUT="${1:?출력 폴더를 지정하세요}"
cd "$(dirname "$0")/../app"
rm -rf "$OUT"
EXPO_PUBLIC_DEMO=1 CI=1 npx expo export --platform web --output-dir "$OUT" >/dev/null
cd "$OUT"
# 번들 안의 절대 경로(/_expo, /assets)를 상대 경로로
find _expo -name '*.js' -exec sed -i 's#"/_expo/#"_expo/#g; s#"/assets/#"assets/#g' {} +
# 분할된 번들을 불러올 때 기준 주소를 현재 페이지 경로가 아닌 <base>로 잡는다
find _expo -name 'entry-*.js' -exec sed -i 's#url:location.origin+location.pathname#url:document.baseURI#g' {} +
# index.html: 문서 기준 <base>를 심고, 라우터가 "/"에서 시작하도록 주소를 바꾼 뒤 번들을 읽는다
sed -i 's#src="/_expo/#src="_expo/#g; s#href="/favicon.ico"#href="favicon.ico"#g' index.html
sed -i 's#<head>#<head><script>document.write(\x27<base href="\x27+location.href.replace(/[?\#].*$/,"").replace(/[^/]*$/,"")+\x27">\x27);try{history.replaceState(null,"","/")}catch(e){}</script>#' index.html
echo "demo preview: $OUT"
