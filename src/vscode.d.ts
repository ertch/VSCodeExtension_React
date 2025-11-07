/**
 * VSCode Webview API (type-safe)
 */
export interface VsCodeApi {
  /**
   * Post message to extension
   */
  postMessage(message: unknown): void;

  /**
   * Get webview state (persisted across reloads)
   */
  getState(): unknown | undefined;

  /**
   * Set webview state
   */
  setState(state: unknown): void;
}

/**
 * Extend Window interface
 */
declare global {
  interface Window {
    vscodeApi?: VsCodeApi;
  }
}

/**
 * Get VSCode API (type guard)
 */
export function getVsCodeApi(): VsCodeApi | undefined {
  return typeof window !== 'undefined' && 'vscodeApi' in window
    ? (window as Window).vscodeApi
    : undefined;
}

/**
 * Check if VSCode API is available
 */
export function hasVsCodeApi(): boolean {
  return typeof window !== 'undefined' && 'vscodeApi' in window && !!window.vscodeApi;
}
