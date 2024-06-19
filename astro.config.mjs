import { defineConfig } from 'astro/config';
import { defineConfig } from 'vite';


export default defineConfig({
  vite: {
    build: {
      outDir:'dist',
      rollupOptions: { 
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: 'assets/main[extname]',
        },
      },
    },
  },
})