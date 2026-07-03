import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// Front roda em 5173 (origem já liberada no CORS da API via CORS_ORIGIN).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: false,
  },
});
