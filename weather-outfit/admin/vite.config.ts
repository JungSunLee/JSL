import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// 빌드 결과는 API 서버가 /admin 경로로 함께 서빙한다. 개발 중에는 API를 프록시.
export default defineConfig({
  base: '/admin/',
  plugins: [react()],
  server: { port: 5173, proxy: { '/v1': 'http://localhost:4000' } },
});
