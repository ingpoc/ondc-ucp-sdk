import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ondc-agent/shared': '@ondc-website/shared',
    },
  },
  optimizeDeps: {
    exclude: ['@ondc-agent/shared', '@ondc-website/shared'],
  },
  server: {
    port: 3002,
    proxy: {
      '/api': 'http://localhost:3001',
      '/on_search': 'http://localhost:3001',
    },
  },
});
