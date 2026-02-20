import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 개발 시 API 요청을 백엔드(3001)로 넘기기 위함
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
      '/socket.io': { target: 'http://localhost:3001', ws: true }
    }
  }
});
