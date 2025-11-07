"use strict";
/**
 * Generic file download utility
 * Merges downloadAstro + downloadJSON (eliminates 99% code duplication)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadFile = downloadFile;
exports.downloadAstro = downloadAstro;
exports.downloadJSON = downloadJSON;
/**
 * Download file with auto-cleanup
 * @param data - File content
 * @param options - Download options
 */
function downloadFile(data, options) {
    const { extension, filename, mimeType } = options;
    // Generate filename
    const defaultPrefix = extension === 'astro' ? 'index' : 'canvas';
    const defaultFilename = `${defaultPrefix}-${Date.now()}.${extension}`;
    const finalFilename = filename || defaultFilename;
    // Detect MIME type
    const defaultMimeType = extension === 'json' ? 'application/json' : 'text/plain';
    const finalMimeType = mimeType || defaultMimeType;
    try {
        const blob = new Blob([data], { type: finalMimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = finalFilename;
        a.click();
        // Cleanup
        URL.revokeObjectURL(url);
    }
    catch (error) {
        console.error('[downloadFile] Failed:', error);
        throw new Error(`File download failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
/**
 * Download Astro file (backwards-compatible)
 * @param data - Astro code string to download
 * @param filename - Optional filename (defaults to index-{timestamp}.astro)
 */
function downloadAstro(data, filename) {
    downloadFile(data, { extension: 'astro', filename });
}
/**
 * Download JSON file (backwards-compatible)
 * @param data - JSON string to download
 * @param filename - Optional filename (defaults to canvas-{timestamp}.json)
 */
function downloadJSON(data, filename) {
    downloadFile(data, { extension: 'json', filename });
}
//# sourceMappingURL=download.js.map