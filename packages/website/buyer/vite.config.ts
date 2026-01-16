import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ondc-agent/shared': '@ondc-website/shared',
      crypto: 'crypto-browserify',
    },
  },
  optimizeDeps: {
    exclude: ['@ondc-agent/shared', '@ondc-website/shared'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('development'),
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
      '/on_search': 'http://localhost:3001',
    },
  },
});
