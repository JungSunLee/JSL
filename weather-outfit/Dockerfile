# 날씨를 입다 — 서버 + 관리자 홈페이지 + 앱 웹 버전을 한 이미지로 묶는다.
# Node 22 (node:sqlite 내장) 기준. 데이터(SQLite 파일)는 /data 볼륨에 둔다.
FROM node:22-bookworm-slim AS build
WORKDIR /src
ENV CI=1 EXPO_NO_TELEMETRY=1
COPY package.json package-lock.json ./
COPY packages/core/package.json packages/core/
COPY server/package.json server/
COPY app/package.json app/
COPY admin/package.json admin/
RUN npm ci --no-audit --no-fund
COPY . .
# 관리자 홈페이지(Vite) + 앱 웹 버전(Expo) 빌드
RUN npm run build:admin && bash scripts/build-web-preview.sh /src/app/dist-web deploy

FROM node:22-bookworm-slim
WORKDIR /srv
ENV NODE_ENV=production PORT=4000 DATA_DIR=/data \
    ADMIN_DIST=/srv/admin/dist WEB_DIST=/srv/app/dist-web
COPY --from=build /src/package.json /src/package-lock.json ./
COPY --from=build /src/packages ./packages
COPY --from=build /src/server ./server
COPY --from=build /src/admin/dist ./admin/dist
COPY --from=build /src/app/dist-web ./app/dist-web
# 서버 실행에 필요한 패키지만 설치 (앱·관리자 개발 의존성 제외)
RUN npm ci --omit=dev --workspace server --workspace @wo/core --no-audit --no-fund \
    && mkdir -p /data && chown -R node:node /data /srv
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://localhost:4000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
WORKDIR /srv/server
CMD ["npx", "tsx", "src/index.ts"]
