import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { activityApi } from './server/activity.mjs';

export default defineConfig({
  plugins: [react(), activityApi()],
  server: { host: '127.0.0.1', port: 5173, strictPort: true },
  preview: { host: '127.0.0.1', port: 4173, strictPort: true },
  build: { sourcemap: false },
});
