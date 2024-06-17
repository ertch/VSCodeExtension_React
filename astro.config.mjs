import { defineConfig } from 'astro/config';
import { defineConfig } from 'vite';
import path from "node:path";

// import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  vite: {
    // plugins:[{
    //     name: 'change-dir-prod',

    //     writeBundle(options, bundle) {
    //       for (const [key, value] of Object.entries(bundle)) {
    //         if (key.endsWith('.js')) {
    //           const newFilePath = path.join('dist', 'include', 'js', key);
    //           // Erstelle das Verzeichnis, falls es nicht existiert
    //           fs.mkdirSync(path.dirname(newFilePath), { recursive: true });
    //           // Verschiebe die Datei
    //           fs.renameSync(path.join('dist', value.fileName), newFilePath);
    //         }
    //       }
    //     }
    // }],
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


