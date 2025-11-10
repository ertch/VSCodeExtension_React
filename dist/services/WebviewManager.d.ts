/**
 * WebviewManager - Manages VSCode Webview Panel
 * Combines Panel Management + Resource Loading + CSP Building
 */
import * as vscode from 'vscode';
export declare class WebviewManager {
    private context;
    private panel;
    private readonly distPath;
    private htmlCache;
    private readonly outputChannel;
    constructor(context: vscode.ExtensionContext, outputChannel?: vscode.OutputChannel);
    /**
     * Create or show existing webview panel
     */
    createOrShow(): Promise<void>;
    /**
     * Get webview options
     */
    private getWebviewOptions;
    /**
     * Load and cache index.html with injected resources
     */
    private loadIndexHTML;
    /**
     * Convert local file path to webview URI
     */
    private getWebviewUri;
    /**
     * Build Content Security Policy meta tag
     */
    private buildCSP;
    /**
     * Handle messages from webview
     */
    private handleMessage;
    /**
     * Generate Astro file from JSON data
     */
    private handleAstroGeneration;
    /**
     * Clear HTML cache (e.g., after hot reload)
     */
    clearCache(): void;
    /**
     * Dispose panel and cleanup
     */
    dispose(): void;
}
//# sourceMappingURL=WebviewManager.d.ts.map