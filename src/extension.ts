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

    // Simple tree data provider for the sidebar
    const treeDataProvider = new QuickAccessProvider();
    vscode.window.registerTreeDataProvider('vscExtension.quickAccess', treeDataProvider);

    context.subscriptions.push(disposable);
}

class QuickAccessProvider implements vscode.TreeDataProvider<QuickAccessItem> {
    getTreeItem(element: QuickAccessItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: QuickAccessItem): Thenable<QuickAccessItem[]> {
        if (!element) {
            return Promise.resolve([new QuickAccessItem('Open Extension Panel', vscode.TreeItemCollapsibleState.None)]);
        }
        return Promise.resolve([]);
    }
}

class QuickAccessItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(label, collapsibleState);
        this.command = {
            command: 'vscExtension.showWebview',
            title: 'Open Extension',
            arguments: []
        };
    }
}


export function deactivate() {}
