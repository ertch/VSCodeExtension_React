import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cheerio from 'cheerio';

let mainPanel: vscode.WebviewPanel | undefined;

// Snippet definitions with attributes structure
const snippetDefinitions = {
    'Layout': {
        attributes: { campaignNr: '', campaignTitle: '', jsFiles: '', header_imgs: '', header_title: '', pattern: '', query: '' },
        childs: {}
    },
    'NavTabs': {
        attributes: { tabs: '' },
        childs: {}
    },
    'TabWrapper': {
        attributes: {},
        childs: {}
    },
    'TabPage': {
        attributes: { id: '', tab: '', isVisible: '' },
        childs: {}
    },
    'Field': {
        attributes: { id: '', legend: '', klasse: '' },
        childs: {}
    },
    'Input': {
        attributes: { id: '', label: '', type: '', validate: '', blur: '', preset: '', required: '' },
        childs: {}
    },
    'Select': {
        attributes: { id: '', label: '', call: '', firstOption: '', options: '' },
        childs: {}
    },
    'Gatekeeper': {
        attributes: { id: '', label: '', options: '', actions: '', gate: '', submitTo: '', pageLock: '', required: '', firstOption: '' },
        childs: {}
    },
    'Gate': {
        attributes: { id: '', klasse: '' },
        childs: {}
    },
    'GateGroup': {
        attributes: { id: '', klasse: '', group: '' },
        childs: {}
    },
    'SQL_Select': {
        attributes: { id: '', label: '', call: '', load: '', required: '' },
        childs: {}
    },
    'Suggestion': {
        attributes: { id: '', label: '', options: '', actions: '', type: '', validate: '', gatekeeper: '', gate: '', submitTo: '' },
        childs: {}
    },
    'ConBlock': {
        attributes: { id: '', klasse: '', group: '', If: '', setPosSale: '' },
        childs: {}
    },
    'RecordBtn': {
        attributes: { id: '', callState: '', showInfo: '', txt_info: '', txt_btn: '' },
        childs: {}
    },
    'FinishBtn': {
        attributes: { auto: '' },
        childs: {}
    },
    'NextPageBtn': {
        attributes: {},
        childs: {}
    }
};

// Static config block (always present)
const staticConfigBlock = `
<div style="border: 2px solid #333; padding: 12px; margin: 10px 0; background: #f5f5f5; border-radius: 8px;">
    <h3 style="margin-top: 0;">📋 Static Config Block</h3>
    <div style="font-size: 12px; color: #666;">
        <div><strong>Layout</strong> → NavTabs → TabWrapper</div>
        <div>Diese Struktur ist immer vorhanden</div>
    </div>
</div>
`;

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
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    private handleSnippetInsertion(componentName: string) {
        vscode.commands.executeCommand('vscExtension.showWebview');
        
        try {
            const snippet = this.generateSnippet(componentName);
            
            setTimeout(() => {
                if (mainPanel) {
                    mainPanel.webview.postMessage({
                        command: 'insertSnippet',
                        tool: componentName,
                        content: snippet
                    });
                }
            }, 100);
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error}`);
        }
    }

    private readAstroFile() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;

        const folder = workspaceFolders[0];
        const srcPagesPath = path.join(folder.uri.fsPath, 'src', 'pages');
        
        if (fs.existsSync(srcPagesPath)) {
            const entries = fs.readdirSync(srcPagesPath, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const indexPath = path.join(srcPagesPath, entry.name, 'index.astro');
                    if (fs.existsSync(indexPath)) {
                        this.astroContent = fs.readFileSync(indexPath, 'utf-8');
                        this.generateFromAstro();
                        return;
                    }
                }
            }
        }
    }

    private generateFromAstro() {
        if (!this.astroContent) return;
        
        vscode.commands.executeCommand('vscExtension.showWebview');
        
        setTimeout(() => {
            if (mainPanel) {
                // First send static config block
                mainPanel.webview.postMessage({
                    command: 'insertSnippet',
                    tool: 'StaticConfig',
                    content: staticConfigBlock
                });
                
                // Parse and send components
                const $ = cheerio.load(this.astroContent, { xmlMode: true });
                const foundComponents: string[] = [];
                
                Object.keys(snippetDefinitions).forEach(componentName => {
                    if ($(componentName).length > 0) {
                        foundComponents.push(componentName);
                    }
                });
                
                // Send each found component
                foundComponents.forEach((component, index) => {
                    setTimeout(() => {
                        if (mainPanel) {
                            const snippet = this.generateSnippet(component);
                            mainPanel.webview.postMessage({
                                command: 'insertSnippet',
                                tool: component,
                                content: snippet
                            });
                        }
                    }, (index + 1) * 200);
                });
            }
        }, 100);
    }

    private generateSnippet(componentName: string): string {
        if (!this.astroContent) {
            return `<div style="padding: 16px; border: 1px solid #ccc; margin: 10px 0;"><h3>${componentName}</h3><p>No Astro content loaded</p></div>`;
        }
        
        const $ = cheerio.load(this.astroContent, { xmlMode: true });
        const element = $(componentName).first();
        
        if (element.length === 0) {
            return `<div style="padding: 16px; border: 1px solid #ccc; margin: 10px 0;"><h3>${componentName}</h3><p>Component not found</p></div>`;
        }
        
        const definition = snippetDefinitions[componentName as keyof typeof snippetDefinitions];
        if (!definition) {
            return `<div style="padding: 16px; border: 1px solid #ccc; margin: 10px 0;"><h3>${componentName}</h3><p>No definition found</p></div>`;
        }
        
        // Extract attributes
        const values: Record<string, string> = {};
        Object.keys(definition.attributes).forEach(attr => {
            values[attr] = element.attr(attr) || '';
        });
        
        const valuesScript = JSON.stringify(values, null, 2);
        
        return `<div style="border: 2px solid #007acc; padding: 16px; margin: 10px 0; border-radius: 8px; background: #f8f9fa;">
    <h3 style="margin-top: 0; color: #007acc;">🧩 ${componentName}</h3>
    ${Object.entries(values).map(([key, val]) => `<div><strong>${key}:</strong> ${val || 'N/A'}</div>`).join('')}
</div>
<script>
let values = ${valuesScript};
console.log('${componentName} values:', values);
</script>`;
    }

    private getHtmlForWebview(): string {
        return `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: var(--vscode-font-family); padding: 10px; }
                .button { display: block; width: 100%; padding: 8px; margin: 4px 0; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; }
                .section { margin: 16px 0; }
                .section-title { font-weight: bold; margin-bottom: 8px; }
            </style>
        </head>
        <body>
            <div class="section">
                <div class="section-title">Astro Code Generator</div>
                <button class="button" onclick="readAstroFile()">📖 Read Astro File</button>
                <button class="button" onclick="openMainPanel()">📋 Open Panel</button>
            </div>
            
            <div class="section">
                <div class="section-title">Components</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                    <button class="button" onclick="insertSnippet('Layout')" style="padding: 4px; font-size: 9px;">🚀 Layout</button>
                    <button class="button" onclick="insertSnippet('NavTabs')" style="padding: 4px; font-size: 9px;">📋 NavTabs</button>
                    <button class="button" onclick="insertSnippet('TabWrapper')" style="padding: 4px; font-size: 9px;">📦 TabWrapper</button>
                    <button class="button" onclick="insertSnippet('TabPage')" style="padding: 4px; font-size: 9px;">📄 TabPage</button>
                    <button class="button" onclick="insertSnippet('Field')" style="padding: 4px; font-size: 9px;">🏷️ Field</button>
                    <button class="button" onclick="insertSnippet('Input')" style="padding: 4px; font-size: 9px;">📝 Input</button>
                    <button class="button" onclick="insertSnippet('Select')" style="padding: 4px; font-size: 9px;">🔽 Select</button>
                    <button class="button" onclick="insertSnippet('Gatekeeper')" style="padding: 4px; font-size: 9px;">🚪 Gatekeeper</button>
                    <button class="button" onclick="insertSnippet('Gate')" style="padding: 4px; font-size: 9px;">🔓 Gate</button>
                    <button class="button" onclick="insertSnippet('GateGroup')" style="padding: 4px; font-size: 9px;">🗂️ GateGroup</button>
                    <button class="button" onclick="insertSnippet('SQL_Select')" style="padding: 4px; font-size: 9px;">🗄️ SQL_Select</button>
                    <button class="button" onclick="insertSnippet('Suggestion')" style="padding: 4px; font-size: 9px;">💡 Suggestion</button>
                    <button class="button" onclick="insertSnippet('ConBlock')" style="padding: 4px; font-size: 9px;">🧩 ConBlock</button>
                    <button class="button" onclick="insertSnippet('RecordBtn')" style="padding: 4px; font-size: 9px;">🎙️ RecordBtn</button>
                    <button class="button" onclick="insertSnippet('FinishBtn')" style="padding: 4px; font-size: 9px;">✅ FinishBtn</button>
                    <button class="button" onclick="insertSnippet('NextPageBtn')" style="padding: 4px; font-size: 9px;">➡️ NextPageBtn</button>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                function openMainPanel() { vscode.postMessage({command: 'openMainPanel'}); }
                function insertSnippet(tool) { vscode.postMessage({command: 'insertSnippet', tool: tool}); }
                function readAstroFile() { vscode.postMessage({command: 'readAstroFile'}); }
            </script>
        </body>
        </html>`;
    }
}

export function deactivate() {}