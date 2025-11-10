/**
 * WebviewManager - Manages VSCode Webview Panel
 * Combines Panel Management + Resource Loading + CSP Building
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { ResourceLoadError } from '../errors/ExtensionErrors';

export class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private readonly distPath: string;
  private htmlCache: string | null = null;
  private readonly outputChannel: vscode.OutputChannel;

  constructor(
    private context: vscode.ExtensionContext,
    outputChannel?: vscode.OutputChannel
  ) {
    this.distPath = path.join(context.extensionPath, 'src', 'ui', 'dist');
    this.outputChannel = outputChannel ?? vscode.window.createOutputChannel('TT-Editor');
  }

  /**
   * Create or show existing webview panel
   */
  async createOrShow(): Promise<void> {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Active, false);
      this.outputChannel.appendLine('[WebviewManager] Panel revealed');
      return;
    }

    try {
      this.outputChannel.appendLine('[WebviewManager] Creating new panel...');

      this.panel = vscode.window.createWebviewPanel(
        'extensionWebview',
        'TT-Editor',
        { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
        {
          ...this.getWebviewOptions(),
          retainContextWhenHidden: true
        }
      );

      this.panel.onDidDispose(() => {
        this.panel = undefined;
        this.outputChannel.appendLine('[WebviewManager] Panel disposed');
      });

      // Setup message handler
      this.panel.webview.onDidReceiveMessage(
        message => this.handleMessage(message),
        null,
        this.context.subscriptions
      );

      const html = await this.loadIndexHTML(this.panel.webview);
      this.panel.webview.html = html;

      this.outputChannel.appendLine('[WebviewManager] Panel created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.outputChannel.appendLine(`[WebviewManager] ERROR: ${message}`);
      vscode.window.showErrorMessage(`TT-Editor konnte nicht geöffnet werden: ${message}`);
      throw error;
    }
  }

  /**
   * Get webview options
   */
  private getWebviewOptions(): vscode.WebviewOptions {
    return {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(this.distPath)]
    };
  }

  /**
   * Load and cache index.html with injected resources
   */
  private async loadIndexHTML(webview: vscode.Webview): Promise<string> {
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

    } catch (error) {
      throw new ResourceLoadError(
        indexPath.fsPath,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Convert local file path to webview URI
   */
  private getWebviewUri(webview: vscode.Webview, relativePath: string): vscode.Uri {
    const filePath = vscode.Uri.file(path.join(this.distPath, relativePath));
    return webview.asWebviewUri(filePath);
  }

  /**
   * Build Content Security Policy meta tag
   */
  private buildCSP(webview: vscode.Webview, scriptUri: vscode.Uri, styleUri: vscode.Uri): string {
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
  private async handleMessage(message: any): Promise<void> {
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
  private async handleAstroGeneration(data: { jsonData: any; metadata: any }): Promise<void> {
    try {
      this.outputChannel.appendLine('[WebviewManager] Starting Astro generation...');
      this.outputChannel.appendLine(`[WebviewManager] Metadata: ${JSON.stringify(data.metadata)}`);
      this.outputChannel.appendLine(`[WebviewManager] JSON data length: ${JSON.stringify(data.jsonData).length} characters`);

      const { mergeAstro } = await import('../generator');
      this.outputChannel.appendLine('[WebviewManager] Generator module imported successfully');

      const astroCode = mergeAstro(data.jsonData, data.metadata);
      this.outputChannel.appendLine(`[WebviewManager] Astro code generated: ${astroCode.length} characters`);
      this.outputChannel.appendLine(`[WebviewManager] First 100 chars: ${astroCode.substring(0, 100)}`);

      // Send back to webview for download
      this.panel?.webview.postMessage({
        type: 'astroGenerated',
        data: { astroCode, filename: 'index.astro' }
      });

      this.outputChannel.appendLine('[WebviewManager] Astro code sent to webview for download');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : '';
      this.outputChannel.appendLine(`[WebviewManager] Astro generation failed: ${errorMessage}`);
      if (errorStack) {
        this.outputChannel.appendLine(`[WebviewManager] Stack trace: ${errorStack}`);
      }

      this.panel?.webview.postMessage({
        type: 'astroError',
        data: { error: errorMessage }
      });
    }
  }

  /**
   * Clear HTML cache (e.g., after hot reload)
   */
  clearCache(): void {
    this.htmlCache = null;
    this.outputChannel.appendLine('[WebviewManager] Cache cleared');
  }

  /**
   * Dispose panel and cleanup
   */
  dispose(): void {
    this.panel?.dispose();
    this.panel = undefined;
    this.outputChannel.appendLine('[WebviewManager] Manager disposed');
  }
}
