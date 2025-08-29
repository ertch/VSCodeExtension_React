export const sidebarHtml = `<!DOCTYPE html>
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
        <button class="button" onclick="readAstroFile()">Read Astro File</button>
        <button class="button" onclick="openMainPanel()">Open Panel</button>
    </div>
    
    <div class="section">
        <div class="section-title">Components</div>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Layout</summary>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <button class="button" onclick="insertSnippet('Layout')" style="padding: 4px; font-size: 9px;">Layout</button>
                <button class="button" onclick="insertSnippet('NavTabs')" style="padding: 4px; font-size: 9px;">NavTabs</button>
                <button class="button" onclick="insertSnippet('TabWrapper')" style="padding: 4px; font-size: 9px;">TabWrapper</button>
                <button class="button" onclick="insertSnippet('TabPage')" style="padding: 4px; font-size: 9px;">TabPage</button>
                <button class="button" onclick="insertSnippet('Field')" style="padding: 4px; font-size: 9px;">Field</button>
            </div>
        </details>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Inputs</summary>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <button class="button" onclick="insertSnippet('Input')" style="padding: 4px; font-size: 9px;">Input</button>
                <button class="button" onclick="insertSnippet('Select')" style="padding: 4px; font-size: 9px;">Select</button>
                <button class="button" onclick="insertSnippet('Gatekeeper')" style="padding: 4px; font-size: 9px;">Gatekeeper</button>
                <button class="button" onclick="insertSnippet('Gate')" style="padding: 4px; font-size: 9px;">Gate</button>
                <button class="button" onclick="insertSnippet('GateGroup')" style="padding: 4px; font-size: 9px;">GateGroup</button>
                <button class="button" onclick="insertSnippet('SQL_Select')" style="padding: 4px; font-size: 9px;">SQL_Select</button>
                <button class="button" onclick="insertSnippet('Suggestion')" style="padding: 4px; font-size: 9px;">Suggestion</button>
                <button class="button" onclick="insertSnippet('ConBlock')" style="padding: 4px; font-size: 9px;">ConBlock</button>
            </div>
        </details>
        <details>
            <summary style="cursor: pointer; font-weight: bold; margin-bottom: 8px;">Buttons</summary>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px;">
                <button class="button" onclick="insertSnippet('RecordBtn')" style="padding: 4px; font-size: 9px;">RecordBtn</button>
                <button class="button" onclick="insertSnippet('FinishBtn')" style="padding: 4px; font-size: 9px;">FinishBtn</button>
                <button class="button" onclick="insertSnippet('NextPageBtn')" style="padding: 4px; font-size: 9px;">NextPageBtn</button>
            </div>
        </details>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        function openMainPanel() { vscode.postMessage({command: 'openMainPanel'}); }
        function insertSnippet(tool) { vscode.postMessage({command: 'insertSnippet', tool: tool}); }
        function readAstroFile() { vscode.postMessage({command: 'readAstroFile'}); }
    </script>
</body>
</html>`;