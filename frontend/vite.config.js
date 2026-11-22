import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // The browser calls /api on the page's own origin and Vite forwards it to the
  // backend, so sign-in works on any port or host alias without CORS setup.
  const proxy = {
    '/api': { target: env.API_PROXY_TARGET || 'http://127.0.0.1:4000', changeOrigin: true },
  };
  return {
    plugins: [react()],
    server: { port: 5173, proxy },
    preview: { port: 4173, proxy },
  };
});
