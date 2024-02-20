import { defineConfig } from 'astro/config';
// import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
    compressHTML: true,
    inlineStylesheets: `never`,
    output: 'static',
    // vite: {
    //     resolve: {
    //         alias: {
    //           '@': fileURLToPath(new URL('./src', import.meta.url)),
    //         },
    //       },
    // }
});
