"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadJSON = void 0;
/**
 * Downloads JSON data as a file
 * @param data - JSON string to download
 * @param filename - Optional filename (defaults to canvas-{timestamp}.json)
 */
const downloadJSON = (data, filename = `canvas-${Date.now()}.json`) => {
    const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(new Blob([data], { type: 'application/json' })),
        download: filename
    });
    a.click();
    URL.revokeObjectURL(a.href);
};
exports.downloadJSON = downloadJSON;
//# sourceMappingURL=downloadJSON.js.map