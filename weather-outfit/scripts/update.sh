#!/usr/bin/env bash
# 최신 코드를 GitHub(master)에서 받아오고 필요한 패키지를 설치한다.
# 사용: npm run update   (weather-outfit 폴더에서)
set -euo pipefail
cd "$(dirname "$0")/.."
echo "▶ GitHub에서 최신 코드 받는 중..."
git -C .. pull --ff-only origin master
echo "▶ 패키지 설치 중..."
npm install --no-audit --no-fund >/dev/null
echo "✅ 업데이트 완료. 서버: npm run dev:server / 미리보기: npm run preview:live"
