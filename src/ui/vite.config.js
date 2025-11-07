import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  base: "./",
  resolve: {
    alias: {
      '@generator': path.resolve(__dirname, '../generator')
    }
  },
  build: {
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        assetFileNames: "assets/[name][extname]", // Entfernt Hashes aus Dateinamen
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js"
      }
    }
  }
});
