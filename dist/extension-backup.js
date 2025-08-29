"use strict";
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
// Global reference to the main panel
let mainPanel;
function activate(context) {
    // Registriere den Befehl für das Haupt-Webview
    let disposable = vscode.commands.registerCommand('vscExtension.showWebview', () => {
        // If panel already exists, just reveal it
        if (mainPanel) {
            mainPanel.reveal(vscode.ViewColumn.One);
            return;
        }
        mainPanel = vscode.window.createWebviewPanel('extensionWebview', 'VSC-ExtensionName', vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist'))],
            retainContextWhenHidden: true, // Behalte die Webview aktiv, wenn sie versteckt wird
        });
        // Handle panel disposal
        mainPanel.onDidDispose(() => {
            mainPanel = undefined;
        });
        const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist', 'index.html'));
        let html = fs.readFileSync(indexPath.fsPath, 'utf-8');
        // Webview-URIs für Assets (JS & CSS)
        const scriptUri = mainPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.js')));
        const styleUri = mainPanel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.css')));
        // CSP-Header setzen
        const cspSource = mainPanel.webview.cspSource;
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
        mainPanel.webview.html = html;
    });
    // Register webview view provider for sidebar
    const sidebarProvider = new SidebarWebviewProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscExtension.quickAccess', sidebarProvider));
    context.subscriptions.push(disposable);
}
class SidebarWebviewProvider {
    constructor(context) {
        this.context = context;
        this.storedAstroContent = '';
    }
    resolveWebviewView(webviewView, context, token) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(this.context.extensionPath)
            ]
        };
        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);
        // Listen for messages from the webview
        webviewView.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'openMainPanel':
                    vscode.commands.executeCommand('vscExtension.showWebview');
                    break;
                case 'alert':
                    vscode.window.showInformationMessage(message.text);
                    break;
                case 'insertSnippet':
                    this.handleSnippetInsertion(message.tool);
                    break;
                case 'findAstroFiles':
                    this.findAstroFiles();
                    break;
            }
        }, undefined, this.context.subscriptions);
    }
    handleSnippetInsertion(componentName) {
        // First open the main panel if it's not already open
        vscode.commands.executeCommand('vscExtension.showWebview');
        try {
            // Get component data from last scanned Astro file
            const componentData = this.getStoredComponentData(componentName);
            const snippetContent = this.generateSnippetWithData(componentName, componentData);
            // Wait a bit for the panel to be ready, then send the snippet
            setTimeout(() => {
                if (mainPanel) {
                    mainPanel.webview.postMessage({
                        command: 'insertSnippet',
                        tool: componentName,
                        content: snippetContent
                    });
                }
            }, 100);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Could not load snippet for ${componentName}: ${error}`);
        }
    }
    getStoredComponentData(componentName) {
        if (this.storedAstroContent) {
            return this.extractComponentData(componentName, this.storedAstroContent);
        }
        return {};
    }
    findAstroFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode.window.showInformationMessage('Open an Astro project folder first.');
                return;
            }
            // Just check if we're in an Astro project (has src/pages directory)
            const folder = workspaceFolders[0];
            const srcPagesPath = path.join(folder.uri.fsPath, 'src', 'pages');
            if (fs.existsSync(srcPagesPath)) {
                vscode.window.showInformationMessage('✅ Astro project detected!');
                // Now find and read index.astro files
                this.scanAndReadAstroFiles(folder.uri.fsPath, srcPagesPath);
                if (this._view) {
                    this._view.webview.postMessage({
                        command: 'astroProjectDetected',
                        workspacePath: folder.uri.fsPath
                    });
                }
            }
            else {
                vscode.window.showInformationMessage('❌ No Astro project structure found (missing src/pages/)');
            }
        });
    }
    scanAndReadAstroFiles(workspacePath, srcPagesPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const astroFiles = [];
                // Scan for project directories in src/pages
                const entries = fs.readdirSync(srcPagesPath, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const projectName = entry.name;
                        const indexPath = path.join(srcPagesPath, projectName, 'index.astro');
                        if (fs.existsSync(indexPath)) {
                            try {
                                const content = fs.readFileSync(indexPath, 'utf-8');
                                const analysis = this.analyzeAstroContent(content);
                                astroFiles.push({
                                    projectName,
                                    content,
                                    analysis
                                });
                                console.log(`📁 Found Astro project: ${projectName}`);
                                console.log(`🧩 Components: ${analysis.componentsInOrder.join(', ')}`);
                            }
                            catch (error) {
                                console.error(`Error reading ${indexPath}:`, error);
                            }
                        }
                    }
                }
                if (astroFiles.length > 0) {
                    vscode.window.showInformationMessage(`📖 Read ${astroFiles.length} Astro file(s)`);
                    // Generate snippets for each component found
                    this.generateSnippetsFromComponents(astroFiles);
                    // Auto-inject all components to React app (as if user clicked buttons)
                    const allComponents = astroFiles.flatMap(file => file.analysis.componentsInOrder);
                    vscode.commands.executeCommand('vscExtension.showWebview');
                    setTimeout(() => {
                        if (mainPanel) {
                            // Send each component as individual snippet with real data
                            allComponents.forEach((component, index) => {
                                setTimeout(() => {
                                    if (mainPanel) {
                                        const componentData = this.extractComponentData(component, astroFiles[0].content);
                                        const snippetContent = this.generateSnippetWithData(component, componentData);
                                        mainPanel.webview.postMessage({
                                            command: 'insertSnippet',
                                            tool: component,
                                            content: snippetContent
                                        });
                                    }
                                }, index * 150); // Small delay between injections
                            });
                        }
                    }, 300);
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error scanning Astro files: ${error}`);
            }
        });
    }
    analyzeAstroContent(content) {
        const analysis = {
            componentsInOrder: [],
            imports: []
        };
        // Extract imports from frontmatter to know available components
        const frontmatterMatch = content.match(/^---([\s\S]*?)---/);
        if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            // Find import statements
            const importRegex = /import\s+(\w+)\s+from\s+["']([^"']+)["']/g;
            let match;
            while ((match = importRegex.exec(frontmatter)) !== null) {
                const componentName = match[1];
                const importPath = match[2];
                analysis.imports.push(importPath);
            }
        }
        // Parse components in the order they appear in the HTML
        const htmlContent = content.replace(/^---([\s\S]*?)---/, ''); // Remove frontmatter
        const componentMatches = htmlContent.match(/<([A-Z][a-zA-Z0-9_]*)/g);
        if (componentMatches) {
            // Keep order and remove duplicates while preserving first occurrence
            const seen = new Set();
            analysis.componentsInOrder = componentMatches
                .map(match => match.slice(1)) // Remove < character
                .filter(component => {
                if (seen.has(component)) {
                    return false;
                }
                seen.add(component);
                return true;
            });
        }
        console.log('📋 Components in order:', analysis.componentsInOrder);
        return analysis;
    }
    generateSnippetsFromComponents(astroFiles) {
        try {
            // Ensure snippets directory exists
            const snippetsDir = path.join(this.context.extensionPath, 'src', 'snippets');
            if (!fs.existsSync(snippetsDir)) {
                fs.mkdirSync(snippetsDir, { recursive: true });
            }
            let totalComponents = 0;
            for (const file of astroFiles) {
                const components = file.analysis.componentsInOrder;
                for (let i = 0; i < components.length; i++) {
                    const componentName = components[i];
                    const snippetFilename = `${componentName}-snippet.html`;
                    const snippetPath = path.join(snippetsDir, snippetFilename);
                    // Generate appropriate snippet content based on component type
                    const snippetContent = this.generateSnippetContent(componentName, i + 1);
                    // Write snippet file
                    fs.writeFileSync(snippetPath, snippetContent, 'utf-8');
                    totalComponents++;
                    console.log(`✅ Generated snippet: ${snippetFilename}`);
                }
            }
            vscode.window.showInformationMessage(`🎯 Generated ${totalComponents} component snippets!`);
        }
        catch (error) {
            vscode.window.showErrorMessage(`Error generating snippets: ${error}`);
        }
    }
    generateSnippetContent(componentName, order) {
        // Generate snippet based on component type
        const componentTemplates = {
            'Layout': `<div style="border: 2px solid #ff5d01; border-radius: 8px; padding: 16px; margin: 10px 0; background: #fff5f0;">
    <h2 style="color: #ff5d01; margin-top: 0;">🚀 Layout Component</h2>
    <p>Campaign: <strong>{{campaignNr}}</strong></p>
    <p>Title: <strong>{{campaignTitle}}</strong></p>
    <div style="background: #f8f9fa; padding: 8px; border-radius: 4px; font-size: 12px;">
        Layout wrapper for the entire application
    </div>
</div>`,
            'NavTabs': `<div style="border: 2px solid #007acc; border-radius: 8px; padding: 16px; margin: 10px 0; background: #f0f8ff;">
    <h2 style="color: #007acc; margin-top: 0;">📋 NavTabs Component</h2>
    <div style="display: flex; gap: 8px;">
        <button style="padding: 4px 8px; background: #007acc; color: white; border: none; border-radius: 3px;">Tab 1</button>
        <button style="padding: 4px 8px; background: #ccc; border: none; border-radius: 3px;">Tab 2</button>
        <button style="padding: 4px 8px; background: #ccc; border: none; border-radius: 3px;">Tab 3</button>
    </div>
</div>`,
            'TabWrapper': `<div style="border: 2px solid #28a745; border-radius: 8px; padding: 16px; margin: 10px 0; background: #f8fff9;">
    <h2 style="color: #28a745; margin-top: 0;">📦 TabWrapper Component</h2>
    <p style="font-size: 12px; color: #666;">Form wrapper containing all input elements</p>
    <div style="background: #e8f5e8; padding: 8px; border-radius: 4px;">
        &lt;form&gt; container for data submission
    </div>
</div>`,
            'TabPage': `<div style="border: 2px solid #6f42c1; border-radius: 8px; padding: 16px; margin: 10px 0; background: #faf5ff;">
    <h2 style="color: #6f42c1; margin-top: 0;">📄 TabPage Component</h2>
    <p>Tab ID: <strong>{{tabId}}</strong></p>
    <div style="background: #f3e8ff; padding: 8px; border-radius: 4px; font-size: 12px;">
        Content area for individual tab
    </div>
</div>`
        };
        // Default template for unknown components
        const defaultTemplate = `<div style="border: 2px solid #6c757d; border-radius: 8px; padding: 16px; margin: 10px 0; background: #f8f9fa;">
    <h2 style="color: #6c757d; margin-top: 0;">🧩 ${componentName} Component</h2>
    <p>Order: ${order}</p>
    <div style="background: #e9ecef; padding: 8px; border-radius: 4px; font-size: 12px;">
        ${componentName} component placeholder
    </div>
</div>`;
        return componentTemplates[componentName] || defaultTemplate;
    }
    extractComponentData(componentName, astroContent) {
        const data = {};
        try {
            // Find the component in the Astro content and extract its attributes
            const regex = new RegExp(`<${componentName}([^>]*?)>`, 'gs');
            const matches = regex.exec(astroContent);
            if (matches && matches[1]) {
                const attributes = matches[1];
                // Extract attribute="value" patterns
                const attrRegex = /(\w+)=["']([^"']*?)["']|(\w+)=\{([^}]*?)\}/g;
                let attrMatch;
                while ((attrMatch = attrRegex.exec(attributes)) !== null) {
                    const key = attrMatch[1] || attrMatch[3];
                    const value = attrMatch[2] || attrMatch[4];
                    if (key && value !== undefined) {
                        data[key] = value;
                    }
                }
                // Extract boolean attributes (just attribute name without value)
                const boolAttrRegex = /\s+(\w+)(?=\s|$)/g;
                let boolMatch;
                while ((boolMatch = boolAttrRegex.exec(attributes)) !== null) {
                    const attr = boolMatch[1];
                    if (!data[attr] && !['class', 'style', 'id'].includes(attr)) {
                        data[attr] = 'true';
                    }
                }
            }
            console.log(`📊 Extracted data for ${componentName}:`, data);
        }
        catch (error) {
            console.error(`Error extracting data for ${componentName}:`, error);
        }
        return data;
    }
    generateSnippetWithData(componentName, data) {
        const valuesObject = JSON.stringify(data, null, 4);
        // Generate component-specific snippet with script values
        const componentSnippets = {
            'Layout': `<div style="border: 2px solid #ff5d01; border-radius: 8px; padding: 16px; margin: 10px 0; background: #fff5f0;">
    <h2 style="color: #ff5d01; margin-top: 0;">🚀 Layout Component</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;">
        <div><strong>Campaign Nr:</strong> ${data.campaignNr || 'N/A'}</div>
        <div><strong>Title:</strong> ${data.campaignTitle || 'N/A'}</div>
        <div><strong>Pattern:</strong> ${data.pattern || 'N/A'}</div>
        <div><strong>Query:</strong> ${data.query || 'N/A'}</div>
    </div>
</div>
<script>
let values = ${valuesObject};
console.log('Layout values:', values);
</script>`,
            'Gatekeeper': `<div style="border: 2px solid #dc3545; border-radius: 8px; padding: 16px; margin: 10px 0; background: #fdf2f2;">
    <h2 style="color: #dc3545; margin-top: 0;">🚪 Gatekeeper Component</h2>
    <div style="font-size: 12px;">
        <div><strong>ID:</strong> ${data.id || 'N/A'}</div>
        <div><strong>Label:</strong> ${data.label || 'N/A'}</div>
        <div><strong>Gate:</strong> ${data.gate || 'N/A'}</div>
        <div><strong>Required:</strong> ${data.required || 'false'}</div>
        <div><strong>Submit To:</strong> ${data.submitTo || 'N/A'}</div>
    </div>
</div>
<script>
let values = ${valuesObject};
console.log('Gatekeeper values:', values);
</script>`,
            'Input': `<div style="border: 2px solid #007bff; border-radius: 8px; padding: 16px; margin: 10px 0; background: #f0f8ff;">
    <h2 style="color: #007bff; margin-top: 0;">📝 Input Component</h2>
    <div style="font-size: 12px;">
        <div><strong>ID:</strong> ${data.id || 'N/A'}</div>
        <div><strong>Label:</strong> ${data.label || 'N/A'}</div>
        <div><strong>Type:</strong> ${data.type || 'text'}</div>
        <div><strong>Validate:</strong> ${data.validate || 'N/A'}</div>
        <div><strong>Required:</strong> ${data.required || 'false'}</div>
    </div>
    <input type="${data.type || 'text'}" placeholder="${data.label || 'Input field'}" style="width: 100%; padding: 4px; margin-top: 8px;" />
</div>
<script>
let values = ${valuesObject};
console.log('Input values:', values);
</script>`
        };
        // Default template for any component
        const defaultSnippet = `<div style="border: 2px solid #6c757d; border-radius: 8px; padding: 16px; margin: 10px 0; background: #f8f9fa;">
    <h2 style="color: #6c757d; margin-top: 0;">🧩 ${componentName} Component</h2>
    <div style="font-size: 12px;">
        ${Object.entries(data).map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`).join('')}
    </div>
</div>
<script>
let values = ${valuesObject};
console.log('${componentName} values:', values);
</script>`;
        return componentSnippets[componentName] || defaultSnippet;
    }
    getHtmlForWebview(webview) {
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
                <div class="section-title">Astro Project</div>
                <button class="button" onclick="findAstroFiles()">
                    🔍 Check Current Workspace
                </button>
                <div id="astroStatus" style="margin-top: 10px; font-size: 12px; color: #666;"></div>
            </div>

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
                <div class="section-title">Astro Components</div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 10px;">
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

                function insertSnippet(tool) {
                    vscode.postMessage({
                        command: 'insertSnippet',
                        tool: tool
                    });
                }

                function findAstroFiles() {
                    vscode.postMessage({
                        command: 'findAstroFiles'
                    });
                }


                // Listen for messages from extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    if (message.command === 'astroProjectDetected') {
                        const statusDiv = document.getElementById('astroStatus');
                        statusDiv.innerHTML = '✅ Astro project ready!<br><small>Workspace: ' + message.workspacePath + '</small>';
                        statusDiv.style.color = '#28a745';
                    } else if (message.command === 'showGeneratedButtons') {
                        const section = document.getElementById('generatedComponentsSection');
                        const buttonsDiv = document.getElementById('generatedComponentButtons');
                        
                        // Show the section
                        section.style.display = 'block';
                        
                        // Clear existing buttons
                        buttonsDiv.innerHTML = '';
                        
                        // Create button for each component
                        message.components.forEach((component, index) => {
                            const button = document.createElement('button');
                            button.className = 'button';
                            button.style.fontSize = '11px';
                            button.style.marginBottom = '4px';
                            button.innerHTML = \`\${index + 1}. \${getComponentIcon(component)} \${component}\`;
                            button.onclick = () => insertSnippet(component);
                            buttonsDiv.appendChild(button);
                        });
                    }
                });

                function getComponentIcon(componentName) {
                    const icons = {
                        'Layout': '🚀',
                        'NavTabs': '📋',
                        'TabWrapper': '📦',
                        'TabPage': '📄',
                        'Input': '📝',
                        'Select': '🔽',
                        'Field': '🏷️',
                        'Gatekeeper': '🚪',
                        'Gate': '🔓',
                        'GateGroup': '🗂️',
                        'SQL_Select': '🗄️',
                        'Suggestion': '💡',
                        'ConBlock': '🧩',
                        'RecordBtn': '🎙️',
                        'FinishBtn': '✅',
                        'NextPageBtn': '➡️'
                    };
                    return icons[componentName] || '🔧';
                }
            </script>
        </body>
        </html>`;
    }
}
function deactivate() { }
