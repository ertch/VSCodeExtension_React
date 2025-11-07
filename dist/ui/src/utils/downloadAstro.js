"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadAstro = void 0;
/**
 * Downloads Astro code as a file
 * @param data - Astro code string to download
 * @param filename - Optional filename (defaults to index-{timestamp}.astro)
 */
const downloadAstro = (data, filename = `index-${Date.now()}.astro`) => {
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([data], { type: 'text/plain' })),
        download: filename
    });
    a.click();
    URL.revokeObjectURL(a.href);
};
exports.downloadAstro = downloadAstro;
//# sourceMappingURL=downloadAstro.js.map