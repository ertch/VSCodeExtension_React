/**
 * Generic file download utility
 * Merges downloadAstro + downloadJSON (eliminates 99% code duplication)
 */
/**
 * File download options
 */
export interface DownloadOptions {
    /** File extension (used for default filename) */
    extension: 'astro' | 'json';
    /** Custom filename (optional) */
    filename?: string;
    /** MIME type (auto-detected if not provided) */
    mimeType?: string;
}
/**
 * Download file with auto-cleanup
 * @param data - File content
 * @param options - Download options
 */
export declare function downloadFile(data: string, options: DownloadOptions): void;
/**
 * Download Astro file (backwards-compatible)
 * @param data - Astro code string to download
 * @param filename - Optional filename (defaults to index-{timestamp}.astro)
 */
export declare function downloadAstro(data: string, filename?: string): void;
/**
 * Download JSON file (backwards-compatible)
 * @param data - JSON string to download
 * @param filename - Optional filename (defaults to canvas-{timestamp}.json)
 */
export declare function downloadJSON(data: string, filename?: string): void;
//# sourceMappingURL=download.d.ts.map