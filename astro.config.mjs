import { defineConfig } from 'astro/config';
import { defineConfig } from 'vite';

// import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        
        output: {
          entryFileNames: 'entry.[hash].mjs',
          chunkFileNames: 'chunks/chunk.[hash].mjs',
          assetFileNames: 'assets/main[extname]',
        },
      },
    },
  },
})




// https://astro.build/config
// export default defineConfig({
//     compressHTML: false,
//     inlineStylesheets: `never`,
//     output: 'static',
//     // vite
//     // base: '',
//     //     resolve: {
//     //         alias: {
//     //           '@': fileURLToPath(new URL('./src', import.meta.url)),
//     //         },
//     //       },
//     // }
// });



// export default defineConfig({
//   vite: {
//     build: {
//       rollupOptions: {
//         output: {
//           entryFileNames: 'entry.[hash].mjs',
//           chunkFileNames: 'chunks/chunk.[hash].mjs',
//           assetFileNames: 'assets/asset.[hash][extname]',
//         },
//       },
//     },
//   },
// })


