"use strict";
/**
 * WebviewManager - Manages VSCode Webview Panel
 * Combines Panel Management + Resource Loading + CSP Building
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewManager = void 0;
const vscode = require("vscode");
const path = require("path");
const ExtensionErrors_1 = require("../errors/ExtensionErrors");
class WebviewManager {
    constructor(context, outputChannel) {
        this.context = context;
        this.htmlCache = null;
        this.distPath = path.join(context.extensionPath, 'src', 'ui', 'dist');
        this.outputChannel = outputChannel !== null && outputChannel !== void 0 ? outputChannel : vscode.window.createOutputChannel('TT-Editor');
    }
    /**
     * Create or show existing webview panel
     */
    createOrShow() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.panel) {
                this.panel.reveal(vscode.ViewColumn.Active, false);
                this.outputChannel.appendLine('[WebviewManager] Panel revealed');
                return;
            }
            try {
                this.outputChannel.appendLine('[WebviewManager] Creating new panel...');
                this.panel = vscode.window.createWebviewPanel('extensionWebview', 'TT-Editor', { viewColumn: vscode.ViewColumn.Active, preserveFocus: false }, Object.assign(Object.assign({}, this.getWebviewOptions()), { retainContextWhenHidden: true }));
                this.panel.onDidDispose(() => {
                    this.panel = undefined;
                    this.outputChannel.appendLine('[WebviewManager] Panel disposed');
                });
                const html = yield this.loadIndexHTML(this.panel.webview);
                this.panel.webview.html = html;
                this.outputChannel.appendLine('[WebviewManager] Panel created successfully');
            }
            catch (error) {
                const message = error instanceof Error ? error.message : String(error);
                this.outputChannel.appendLine(`[WebviewManager] ERROR: ${message}`);
                vscode.window.showErrorMessage(`TT-Editor konnte nicht geöffnet werden: ${message}`);
                throw error;
            }
        });
    }
    /**
     * Get webview options
     */
    getWebviewOptions() {
        return {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(this.distPath)]
        };
    }
    /**
     * Load and cache index.html with injected resources
     */
    loadIndexHTML(webview) {
        return __awaiter(this, void 0, void 0, function* () {
            // Check cache first
            if (this.htmlCache) {
                this.outputChannel.appendLine('[WebviewManager] Using cached HTML');
                return this.htmlCache;
            }
            const indexPath = vscode.Uri.file(path.join(this.distPath, 'index.html'));
            try {
                const htmlBuffer = yield vscode.workspace.fs.readFile(indexPath);
                let html = Buffer.from(htmlBuffer).toString('utf-8');
                const scriptUri = this.getWebviewUri(webview, 'assets/index.js');
                const styleUri = this.getWebviewUri(webview, 'assets/index.css');
                const cspMetaTag = this.buildCSP(webview, scriptUri, styleUri);
                html = html.replace('<head>', `<head>${cspMetaTag}
    <link rel="stylesheet" href="${styleUri}">
    <script type="module" src="${scriptUri}" defer></script>
  `);
                this.htmlCache = html;
                this.outputChannel.appendLine('[WebviewManager] HTML loaded and cached');
                return html;
            }
            catch (error) {
                throw new ExtensionErrors_1.ResourceLoadError(indexPath.fsPath, error instanceof Error ? error : new Error(String(error)));
            }
        });
    }
    /**
     * Convert local file path to webview URI
     */
    getWebviewUri(webview, relativePath) {
        const filePath = vscode.Uri.file(path.join(this.distPath, relativePath));
        return webview.asWebviewUri(filePath);
    }
    /**
     * Build Content Security Policy meta tag
     */
    buildCSP(webview, scriptUri, styleUri) {
        const cspSource = webview.cspSource;
        // In Production: Restriktivere CSP (kein unsafe-eval)
        const scriptSrc = process.env.NODE_ENV === 'production'
            ? `'unsafe-inline' ${cspSource} ${scriptUri}`
            : `'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri}`;
        return `
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self' ${cspSource};
      script-src ${scriptSrc};
      style-src 'unsafe-inline' ${cspSource} ${styleUri};
    ">
  `;
    }
    /**
     * Clear HTML cache (e.g., after hot reload)
     */
    clearCache() {
        this.htmlCache = null;
        this.outputChannel.appendLine('[WebviewManager] Cache cleared');
    }
    /**
     * Dispose panel and cleanup
     */
    dispose() {
        var _a;
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.dispose();
        this.panel = undefined;
        this.outputChannel.appendLine('[WebviewManager] Manager disposed');
    }
}
exports.WebviewManager = WebviewManager;
