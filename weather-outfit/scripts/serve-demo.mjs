// 데모 웹 빌드를 PC 브라우저에서 휴대폰 화면 모양으로 보여주는 아주 작은 서버 (서버·키 없이 동작)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const root = process.argv[2];
const port = Number(process.env.PORT ?? 8090);
const types = { '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.png': 'image/png', '.ico': 'image/x-icon', '.json': 'application/json' };
const frame = `<!doctype html><meta charset="utf-8"><title>우리집 옷날씨 미리보기</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#e7ebf2;font-family:sans-serif}
.phone{width:390px;height:844px;background:#141926;border-radius:44px;padding:12px;box-shadow:0 24px 60px rgba(10,16,32,.28)}
iframe{width:100%;height:100%;border:0;border-radius:34px;background:#f4f6fa}</style>
<div class="phone"><iframe src="/app/index.html"></iframe></div>`;

http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/' || u === '/index.html') return res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }).end(frame);
  const p = path.join(root, u.replace(/^\/app/, ''));
  if (!p.startsWith(root) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) return res.writeHead(404).end('없는 파일: ' + u);
  res.writeHead(200, { 'Content-Type': types[path.extname(p)] ?? 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
}).listen(port, () => console.log(`미리보기: http://localhost:${port}  (브라우저에서 여세요. Ctrl+C로 종료)`));
