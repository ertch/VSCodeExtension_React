"use strict";
/**
 * WebviewManager - Manages VSCode Webview Panel
 * Combines Panel Management + Resource Loading + CSP Building
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const ExtensionErrors_1 = require("../errors/ExtensionErrors");
class WebviewManager {
    constructor(context, outputChannel) {
        this.context = context;
        this.htmlCache = null;
        this.distPath = path.join(context.extensionPath, 'src', 'ui', 'dist');
        this.outputChannel = outputChannel ?? vscode.window.createOutputChannel('TT-Editor');
    }
    /**
     * Create or show existing webview panel
     */
    async createOrShow() {
        if (this.panel) {
            this.panel.reveal(vscode.ViewColumn.Active, false);
            this.outputChannel.appendLine('[WebviewManager] Panel revealed');
            return;
        }
        try {
            this.outputChannel.appendLine('[WebviewManager] Creating new panel...');
            this.panel = vscode.window.createWebviewPanel('extensionWebview', 'TT-Editor', { viewColumn: vscode.ViewColumn.Active, preserveFocus: false }, {
                ...this.getWebviewOptions(),
                retainContextWhenHidden: true
            });
            this.panel.onDidDispose(() => {
                this.panel = undefined;
                this.outputChannel.appendLine('[WebviewManager] Panel disposed');
            });
            // Setup message handler
            this.panel.webview.onDidReceiveMessage(message => this.handleMessage(message), null, this.context.subscriptions);
            const html = await this.loadIndexHTML(this.panel.webview);
            this.panel.webview.html = html;
            this.outputChannel.appendLine('[WebviewManager] Panel created successfully');
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`[WebviewManager] ERROR: ${message}`);
            vscode.window.showErrorMessage(`TT-Editor konnte nicht geöffnet werden: ${message}`);
            throw error;
        }
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
    async loadIndexHTML(webview) {
        // Check cache first
        if (this.htmlCache) {
            this.outputChannel.appendLine('[WebviewManager] Using cached HTML');
            return this.htmlCache;
        }
        const indexPath = vscode.Uri.file(path.join(this.distPath, 'index.html'));
        try {
            const htmlBuffer = await vscode.workspace.fs.readFile(indexPath);
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
     * Handle messages from webview
     */
    async handleMessage(message) {
        switch (message.type) {
            case 'generateAstro':
                await this.handleAstroGeneration(message.data);
                break;
            default:
                this.outputChannel.appendLine(`[WebviewManager] Unknown message type: ${message.type}`);
        }
    }
    /**
     * Generate Astro file from JSON data
     */
    async handleAstroGeneration(data) {
        try {
            const { mergeAstro } = await Promise.resolve().then(() => __importStar(require('../generator')));
            const astroCode = mergeAstro(data.jsonData, data.metadata);
            // Send back to webview for download
            this.panel?.webview.postMessage({
                type: 'astroGenerated',
                data: { astroCode, filename: 'index.astro' }
            });
            this.outputChannel.appendLine('[WebviewManager] Astro code generated successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.outputChannel.appendLine(`[WebviewManager] Astro generation failed: ${errorMessage}`);
            this.panel?.webview.postMessage({
                type: 'astroError',
                data: { error: errorMessage }
            });
        }
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
        this.panel?.dispose();
        this.panel = undefined;
        this.outputChannel.appendLine('[WebviewManager] Manager disposed');
    }
}
exports.WebviewManager = WebviewManager;
//# sourceMappingURL=WebviewManager.js.map