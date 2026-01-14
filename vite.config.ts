import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { streamPolyfill } from './vite-plugin-stream-polyfill';

export default defineConfig({
  plugins: [
    react(),
    streamPolyfill(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@incident-tracker/shared': path.resolve(__dirname, './shared/src'),
    },
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      // Inject stream polyfill during optimization
      inject: [],
    },
    exclude: ['stream'],
    include: [],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
