import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-ops',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        ops: path.resolve(__dirname, 'index.ops.html'),
      },
    },
  },
  server: {
    port: 3001,
  },
});
