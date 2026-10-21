// 앱 웹 빌드를 PC 브라우저에서 휴대폰 화면 모양으로 보여주는 작은 서버.
//   http://localhost:8090/frame      → 휴대폰 프레임 안에 앱
//   http://localhost:8090/           → 앱만 (전체 화면)
// 로그인 창이 돌아오는 /auth 같은 라우트 주소도 앱(index.html)으로 연결한다.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.argv[2]);
const port = Number(process.env.PORT ?? 8090);
const mode = process.argv[3] ?? 'demo';
const types = { '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
const label = mode === 'live' ? '실제 날씨 · PC 서버(localhost:4000) 연결 · 테스트 로그인' : '데모 · 예시 날씨 · 즉시 로그인';
const frame = `<!doctype html><meta charset="utf-8"><title>날씨를 입다 미리보기</title>
<style>body{margin:0;min-height:100vh;display:flex;flex-direction:column;align-items:center;gap:12px;padding:18px;box-sizing:border-box;background:#e7ebf2;font-family:-apple-system,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;color:#16202e}
.bar{width:390px;display:flex;justify-content:space-between;align-items:center;font-size:13px}.bar small{color:#5b6676}
button{font:inherit;font-size:13px;border:1px solid #d6dce6;background:#fff;border-radius:8px;padding:6px 10px;cursor:pointer}
.phone{width:390px;height:844px;background:#141926;border-radius:44px;padding:12px;box-shadow:0 24px 60px rgba(10,16,32,.28);box-sizing:border-box}
iframe{width:100%;height:100%;border:0;border-radius:34px;background:#f4f6fa}</style>
<div class="bar"><div><b>날씨를 입다</b><br><small>${label}</small></div><button onclick="const f=document.querySelector('iframe');try{f.contentWindow.localStorage.clear()}catch(e){};f.src='/?t='+Date.now()">데이터 초기화</button></div>
<div class="phone"><iframe src="/"></iframe></div>`;

http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/frame' || u === '/frame.html') return res.writeHead(200, { 'Content-Type': types['.html'] }).end(frame);
  let p = path.join(root, u);
  // 파일이 아니면(라우트 주소: /, /auth, /login ...) 앱 index.html 로
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) p = path.join(root, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(port, () => console.log(`\n미리보기: http://localhost:${port}/frame   (${label})\n브라우저에서 여세요. 끝내려면 Ctrl+C\n`));
