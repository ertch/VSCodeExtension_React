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
export function downloadFile(data: string, options: DownloadOptions): void {
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
  } catch (error) {
    console.error('[downloadFile] Failed:', error);
    throw new Error(`File download failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Download Astro file (backwards-compatible)
 * @param data - Astro code string to download
 * @param filename - Optional filename (defaults to index-{timestamp}.astro)
 */
export function downloadAstro(data: string, filename?: string): void {
  downloadFile(data, { extension: 'astro', filename });
}

/**
 * Download JSON file (backwards-compatible)
 * @param data - JSON string to download
 * @param filename - Optional filename (defaults to canvas-{timestamp}.json)
 */
export function downloadJSON(data: string, filename?: string): void {
  downloadFile(data, { extension: 'json', filename });
}
