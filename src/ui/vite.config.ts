import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // CRITICAL: Required for VSCode webview resource loading!
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Fixed names (no hashes) for easier HTML injection in webview.ts
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        manualChunks: undefined,  // Single bundle - no code splitting
      },
    },
  },
  esbuild: {
    drop: ['debugger'],
  },
});
