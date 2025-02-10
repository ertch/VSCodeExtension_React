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

    context.subscriptions.push(disposable);

    // Registriere die View in der Aktivitätsleiste (Sidebar)
    const viewProvider = new vscExtensionViewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscExtension.view', viewProvider));
}

class vscExtensionViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
        this._view = webviewView;

        // Setze Webview-Optionen
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, 'src', 'ui', 'dist'))],
        };

        // Lade `index.html`
        const indexPath = vscode.Uri.file(path.join(this.context.extensionPath, 'src/ui/dist', 'index.html'));
        let html = fs.readFileSync(indexPath.fsPath, 'utf-8');

        // Webview-URIs für Assets (JS & CSS)
        const scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'src/ui/dist/assets/index.js')));
        const styleUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, 'src/ui/dist/assets/index.css')));

        // CSP-Header setzen
        const cspSource = webviewView.webview.cspSource;
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

        webviewView.webview.html = html;
    }
}

export function deactivate() {}
