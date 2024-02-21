import { defineConfig } from 'astro/config';
import { defineConfig } from 'vite';
// import { fileURLToPath, URL } from 'node:url';

// https://astro.build/config
export default defineConfig({
    compressHTML: false,
    inlineStylesheets: `never`,
    output: 'static',
    // vite
    // base: '',
    //     resolve: {
    //         alias: {
    //           '@': fileURLToPath(new URL('./src', import.meta.url)),
    //         },
    //       },
    // }
});


