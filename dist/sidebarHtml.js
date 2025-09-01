"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sidebarHtml = void 0;
exports.sidebarHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: var(--vscode-font-family); padding: 10px; }
        .button { display: block; width: 100%; padding: 8px; margin: 4px 0; background: var(--vscode-button-background); color: var(--vscode-button-foreground); border: none; border-radius: 4px; cursor: pointer; }
        .button:hover { opacity: 0.8; }
        .button-file { background: var(--vscode-button-secondaryBackground); }
        .button-generate { background: var(--vscode-button-background); font-weight: bold; }
        .button-clear { background: var(--vscode-errorForeground); color: white; }
        .section { margin: 16px 0; }
        .section-title { font-weight: bold; margin-bottom: 8px; font-size: 14px; }
        .small-button { padding: 4px; font-size: 10px; }
        hr { border: none; border-top: 1px solid var(--vscode-panel-border); margin: 16px 0; }
    </style>
</head>
<body>
    <div class="section">
        <div class="section-title">File Operations</div>
        <button class="button button-file" onclick="readAstroFile()">Load Astro File</button>
        <button class="button button-file" onclick="openMainPanel()">Open Canvas</button>
        <button class="button button-clear" onclick="clearAllComponents()">Clear All</button>
    </div>
    
    <hr>
    
    <div class="section">
        <div class="section-title">Add Components</div>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Layout</summary>
            
                <button class="button small-button" onclick="addComponent('Layout')">+ Layout</button>
                <button class="button small-button" onclick="addComponent('NavTabs')">+ NavTabs</button>
                <button class="button small-button" onclick="addComponent('TabWrapper')">+ TabWrapper</button>
                <button class="button small-button" onclick="addComponent('TabPage')">+ TabPage</button>
            
        </details>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">SchaltLogik</summary>
            <button class="button small-button" onclick="addComponent('Gatekeeper')">+ Gatekeeper</button>
            <button class="button small-button" onclick="addComponent('Suggestion')">+ Suggestion</button>
            <button class="button small-button" onclick="addComponent('Gate')">+ Gate</button>
            <button class="button small-button" onclick="addComponent('GateGroup')">+ GateGroup</button>
            <button class="button small-button" onclick="addComponent('ConBlock')">+ ConBlock</button>
            <button class="button small-button" onclick="addComponent('Field')">+ Field</button>
        </details>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Inputs</summary>
            
                <button class="button small-button" onclick="addComponent('Input')">+ Input</button>
                <button class="button small-button" onclick="addComponent('textField')">+ textField</button>
                <button class="button small-button" onclick="addComponent('Select')">+ Select</button>
                <button class="button small-button" onclick="addComponent('SQL_Select')">+ SQL_Select</button>
                
            
        </details>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Buttons</summary>
           
                <button class="button small-button" onclick="addComponent('RecordBtn')">+ RecordBtn</button>
                <button class="button small-button" onclick="addComponent('FinishBtn')">+ FinishBtn</button>
                <button class="button small-button" onclick="addComponent('NextPageBtn')">+ NextPageBtn</button>
            
        </details>
    </div>
    
    <hr>
    
    <div class="section">
        <button class="button button-generate" onclick="generateCode()">⚡ Generate Astro Code</button>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        function openMainPanel() { vscode.postMessage({command: 'openMainPanel'}); }
        function insertSnippet(tool) { vscode.postMessage({command: 'insertSnippet', tool: tool}); }
        function readAstroFile() { vscode.postMessage({command: 'readAstroFile'}); }
        function addComponent(tool) { vscode.postMessage({command: 'addComponent', tool: tool}); }
        function generateCode() { vscode.postMessage({command: 'generateCode'}); }
        function clearAllComponents() { 
            if (confirm('Are you sure you want to clear all components?')) {
                vscode.postMessage({command: 'clearAll'}); 
            }
        }
    </script>
</body>
</html>`;
