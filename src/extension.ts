import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { staticConfigBlock } from './snippetDefinitions';
import { AstroParser } from './astroParser';
import { sidebarHtml } from './sidebarHtml';

let mainPanel: vscode.WebviewPanel | undefined;

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('vscExtension.showWebview', () => {
        if (mainPanel) {
            mainPanel.reveal(vscode.ViewColumn.One);
            return;
        }

        mainPanel = vscode.window.createWebviewPanel(
            'extensionWebview', 'Astro Code Generator', vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist'))],
                retainContextWhenHidden: true
            }
        );

        mainPanel.onDidDispose(() => { mainPanel = undefined; });

        const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist', 'index.html'));
        let html = fs.readFileSync(indexPath.fsPath, 'utf-8');
        
        const scriptUri = mainPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.js')));
        const styleUri = mainPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.css')));
        const cspSource = mainPanel.webview.cspSource;
        
        html = html.replace('<head>', `<head>
            <meta http-equiv="Content-Security-Policy" content="default-src 'self' ${cspSource}; script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri}; style-src 'unsafe-inline' ${cspSource} ${styleUri};">
            <link rel="stylesheet" href="${styleUri}">
            <script type="module" src="${scriptUri}" defer></script>
        `);

        mainPanel.webview.html = html;
    });

    const sidebarProvider = new SidebarWebviewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscExtension.quickAccess', sidebarProvider));
    context.subscriptions.push(disposable);
}

class SidebarWebviewProvider implements vscode.WebviewViewProvider {
    private astroContent: string = '';

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.html = this.getHtmlForWebview();

        webviewView.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'openMainPanel':
                        vscode.commands.executeCommand('vscExtension.showWebview');
                        break;
                    case 'insertSnippet':
                        this.handleSnippetInsertion(message.tool);
                        break;
                    case 'readAstroFile':
                        this.readAstroFile();
                        break;
                    case 'addComponent':
                        this.handleAddComponent(message.tool);
                        break;
                    case 'generateCode':
                        this.handleGenerateCode();
                        break;
                    case 'clearAll':
                        this.handleClearAll();
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private handleSnippetInsertion(componentName: string) {
        vscode.commands.executeCommand('vscExtension.showWebview');
        const snippet = this.generateSnippet(componentName);
        
        setTimeout(() => mainPanel?.webview.postMessage({
            command: 'insertSnippet',
            tool: componentName,
            content: snippet
        }), 100);
    }

    private handleAddComponent(componentName: string) {
        vscode.commands.executeCommand('vscExtension.showWebview');
        
        setTimeout(() => mainPanel?.webview.postMessage({
            command: 'addComponent',
            tool: componentName
        }), 100);
    }

    private handleGenerateCode() {
        vscode.commands.executeCommand('vscExtension.showWebview');
        
        setTimeout(() => mainPanel?.webview.postMessage({
            command: 'generateCode'
        }), 100);
    }

    private handleClearAll() {
        vscode.commands.executeCommand('vscExtension.showWebview');
        
        setTimeout(() => mainPanel?.webview.postMessage({
            command: 'clearAll'
        }), 100);
    }

    private readAstroFile() {
        const folder = vscode.workspace.workspaceFolders?.[0];
        if (!folder) return;
        
        const srcPages = path.join(folder.uri.fsPath, 'src', 'pages');
        if (!fs.existsSync(srcPages)) return;
        
        const indexPath = fs.readdirSync(srcPages, { withFileTypes: true })
            .find(entry => entry.isDirectory() && fs.existsSync(path.join(srcPages, entry.name, 'index.astro')));
            
        if (indexPath) {
            this.astroContent = fs.readFileSync(path.join(srcPages, indexPath.name, 'index.astro'), 'utf-8');
            this.generateFromAstro();
        }
    }

    private generateFromAstro() {
        if (!this.astroContent) return;
        vscode.commands.executeCommand('vscExtension.showWebview');
        
        setTimeout(() => {
            mainPanel?.webview.postMessage({ command: 'insertSnippet', tool: 'StaticConfig', content: staticConfigBlock });
            AstroParser.findComponents(this.astroContent).forEach((component, index) => 
                setTimeout(() => mainPanel?.webview.postMessage({
                    command: 'insertSnippet', tool: component, content: this.generateSnippet(component)
                }), (index + 1) * 200));
        }, 100);
    }

    private generateSnippet(componentName: string): string {
        return this.astroContent 
            ? AstroParser.generateSnippet(componentName, AstroParser.extractComponentAttributes(componentName, this.astroContent))
            : `<div><h3>${componentName}</h3><p>No Astro content loaded</p></div>`;
    }

    private getHtmlForWebview(): string {
        return sidebarHtml;
    }
}

export function deactivate() {}