import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
    // Registriere den Befehl für das Haupt-Webview
    let disposable = vscode.commands.registerCommand('vscExtension.showWebview', () => {
        const panel = vscode.window.createWebviewPanel(
            'extensionWebview',
            'VSC-ExtensionName',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist'))],
                retainContextWhenHidden: true, // Behalte die Webview aktiv, wenn sie versteckt wird
            }
        );

        const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist', 'index.html'));
        let html = fs.readFileSync(indexPath.fsPath, 'utf-8');

        // Webview-URIs für Assets (JS & CSS)
        const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.js')));
        const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.css')));

        // CSP-Header setzen
        const cspSource = panel.webview.cspSource;
        const cspMetaTag = `
            <meta http-equiv="Content-Security-Policy" content="
                default-src 'self' ${cspSource}; 
                script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri}; 
                style-src 'unsafe-inline' ${cspSource} ${styleUri};
            ">
        `;

        // Setze den HTML-Inhalt
        html = html.replace('<head>', `<head>${cspMetaTag}
            <link rel="stylesheet" href="${styleUri}">
            <script type="module" src="${scriptUri}" defer></script>
        `);

        panel.webview.html = html;
    });

    // Register webview view provider for sidebar
    const sidebarProvider = new SidebarWebviewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscExtension.quickAccess', sidebarProvider));

    context.subscriptions.push(disposable);
}

class SidebarWebviewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(this.context.extensionPath)
            ]
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        // Listen for messages from the webview
        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openMainPanel':
                        vscode.commands.executeCommand('vscExtension.showWebview');
                        break;
                    case 'alert':
                        vscode.window.showInformationMessage(message.text);
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        // Get CSP source
        const cspSource = webview.cspSource;

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${cspSource} 'unsafe-inline'; script-src ${cspSource} 'unsafe-inline';">
            <title>VSC Extension Sidebar</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-sideBar-background);
                    margin: 0;
                    padding: 10px;
                }
                .button {
                    display: block;
                    width: 100%;
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: var(--vscode-font-size);
                }
                .button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .button:active {
                    background-color: var(--vscode-button-background);
                    transform: translateY(1px);
                }
                .section {
                    margin-bottom: 16px;
                }
                .section-title {
                    font-weight: bold;
                    margin-bottom: 8px;
                    color: var(--vscode-sideBarTitle-foreground);
                }
                .info-text {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 8px;
                }
            </style>
        </head>
        <body>
            <div class="section">
                <div class="section-title">Quick Actions</div>
                <button class="button" onclick="openMainPanel()">
                    📋 Open Extension Panel
                </button>
                <button class="button" onclick="showAlert('Hello from sidebar!')">
                    💬 Show Alert
                </button>
                <button class="button" onclick="showAlert('Feature coming soon!')">
                    ⚙️ Settings
                </button>
            </div>
            
            <div class="section">
                <div class="section-title">Tools</div>
                <button class="button" onclick="showAlert('Tool 1 activated!')">
                    🔧 Tool 1
                </button>
                <button class="button" onclick="showAlert('Tool 2 activated!')">
                    🔨 Tool 2
                </button>
            </div>
            
            <div class="section">
                <div class="info-text">
                    VSC Extension v0.0.1<br>
                    Ready to use!
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function openMainPanel() {
                    vscode.postMessage({
                        command: 'openMainPanel'
                    });
                }

                function showAlert(text) {
                    vscode.postMessage({
                        command: 'alert',
                        text: text
                    });
                }
            </script>
        </body>
        </html>`;
    }
}


export function deactivate() {}
