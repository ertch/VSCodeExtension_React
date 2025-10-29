"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode2 = __toESM(require("vscode"));
var fs2 = __toESM(require("fs"));
var path2 = __toESM(require("path"));

// src/webview.ts
var vscode = __toESM(require("vscode"));
var fs = __toESM(require("fs"));
var path = __toESM(require("path"));

// src/shared/projectConfig.ts
function validateProjectConfig(config) {
  if (!config || typeof config !== "object") {
    return false;
  }
  if (config.version !== "1.0") {
    console.warn("ProjectConfig: Unsupported version", config.version);
    return false;
  }
  if (!config.projectName || typeof config.projectName !== "string") {
    return false;
  }
  if (!config.lastModified || typeof config.lastModified !== "string") {
    return false;
  }
  if (!Array.isArray(config.tree)) {
    return false;
  }
  return config.tree.every(validateComponentNode);
}
function validateComponentNode(node) {
  if (!node || typeof node !== "object") {
    return false;
  }
  if (!node.id || typeof node.id !== "string") {
    return false;
  }
  if (!node.type || typeof node.type !== "string") {
    return false;
  }
  if (!node.props || typeof node.props !== "object") {
    return false;
  }
  if (!Array.isArray(node.children)) {
    return false;
  }
  if (!node.codeGen || typeof node.codeGen !== "object") {
    return false;
  }
  return node.children.every(validateComponentNode);
}
function updateTimestamp(config) {
  return {
    ...config,
    lastModified: (/* @__PURE__ */ new Date()).toISOString()
  };
}

// src/webview.ts
var canvasPanel;
function createCanvasWebview(context, workspaceRoot, isValidProject) {
  if (canvasPanel) {
    canvasPanel.reveal(vscode.ViewColumn.One);
    return canvasPanel;
  }
  const projectName = path.basename(workspaceRoot);
  canvasPanel = vscode.window.createWebviewPanel(
    "ttEditorCanvas",
    `${projectName} - Canvas`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, "src", "ui", "dist"))
      ]
    }
  );
  canvasPanel.webview.html = getCanvasHTML(canvasPanel.webview, context);
  canvasPanel.onDidDispose(() => {
    canvasPanel = void 0;
  }, null, context.subscriptions);
  canvasPanel.webview.onDidReceiveMessage(
    async (message) => {
      await handleWebviewMessage(message, canvasPanel, workspaceRoot);
    },
    null,
    context.subscriptions
  );
  sendInitMessage(canvasPanel, workspaceRoot, projectName, isValidProject);
  return canvasPanel;
}
async function handleWebviewMessage(message, panel, workspaceRoot) {
  switch (message.type) {
    case "READY":
      console.log("TT-Editor: Canvas ready");
      break;
    case "SAVE":
      await handleSave(message.payload, panel, workspaceRoot);
      break;
    case "LOAD_REQUEST":
      await handleLoadRequest(panel, workspaceRoot);
      break;
    default:
      console.warn("TT-Editor: Unknown message type", message);
  }
}
async function handleSave(config, panel, workspaceRoot) {
  try {
    if (!validateProjectConfig(config)) {
      throw new Error("Invalid project configuration");
    }
    const updatedConfig = updateTimestamp(config);
    const configPath = path.join(workspaceRoot, ".ttEditor.json");
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), "utf-8");
    console.log("TT-Editor: Configuration saved", configPath);
    const successMsg = {
      type: "SAVE_SUCCESS",
      filePath: configPath
    };
    panel.webview.postMessage(successMsg);
    vscode.window.showInformationMessage("TT-Editor: Konfiguration gespeichert");
  } catch (err) {
    console.error("TT-Editor: Save failed", err);
    const errorMsg = {
      type: "ERROR",
      message: `Fehler beim Speichern: ${err}`
    };
    panel.webview.postMessage(errorMsg);
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Speichern - ${err}`);
  }
}
async function handleLoadRequest(panel, workspaceRoot) {
  try {
    const config = loadConfig(workspaceRoot);
    if (!config) {
      vscode.window.showWarningMessage("TT-Editor: Keine gespeicherte Konfiguration gefunden");
      return;
    }
    const loadMsg = {
      type: "LOAD_RESPONSE",
      payload: config
    };
    panel.webview.postMessage(loadMsg);
    console.log("TT-Editor: Configuration loaded");
  } catch (err) {
    console.error("TT-Editor: Load failed", err);
    const errorMsg = {
      type: "ERROR",
      message: `Fehler beim Laden: ${err}`
    };
    panel.webview.postMessage(errorMsg);
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Laden - ${err}`);
  }
}
function loadConfig(workspaceRoot) {
  const configPath = path.join(workspaceRoot, ".ttEditor.json");
  if (!fs.existsSync(configPath)) {
    console.log("TT-Editor: No .ttEditor.json found");
    return null;
  }
  try {
    const content = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(content);
    if (!validateProjectConfig(config)) {
      throw new Error("Invalid configuration format");
    }
    return config;
  } catch (err) {
    console.error("TT-Editor: Failed to load config", err);
    throw new Error(`Korrupte Konfigurationsdatei: ${err}`);
  }
}
function sendInitMessage(panel, workspaceRoot, projectName, isValidProject) {
  const config = loadConfig(workspaceRoot);
  const initMsg = {
    type: "INIT",
    payload: {
      projectName,
      config: config || null,
      isValidProject
    }
  };
  setTimeout(() => {
    panel.webview.postMessage(initMsg);
    console.log("TT-Editor: INIT message sent", { isValidProject });
  }, 100);
}
function getCanvasHTML(webview, context) {
  const indexPath = vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist", "index.html"));
  let html = fs.readFileSync(indexPath.fsPath, "utf-8");
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist/assets/index.js"))
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist/assets/index.css"))
  );
  const cspSource = webview.cspSource;
  const cspMetaTag = `
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self' ${cspSource};
      script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri};
      style-src 'unsafe-inline' ${cspSource} ${styleUri};
    ">
  `;
  html = html.replace("<head>", `<head>${cspMetaTag}
    <link rel="stylesheet" href="${styleUri}">
    <script>
      window.vscodeApi = acquireVsCodeApi();
      console.log('VS Code API injected:', !!window.vscodeApi);
    </script>
    <script type="module" src="${scriptUri}" defer></script>
  `);
  return html;
}

// src/extension.ts
function activate(context) {
  console.log("TT-Editor Extension: Activating...");
  const workspaceRoot = getWorkspaceRoot();
  const isValid = workspaceRoot ? validateProject(workspaceRoot) : false;
  if (!workspaceRoot) {
    console.log("TT-Editor: No workspace open - waiting for user to open folder");
  } else if (isValid) {
    console.log("TT-Editor: Valid project detected - Code Generator enabled");
    vscode2.commands.executeCommand("setContext", "ttEditor.projectValid", true);
  } else {
    console.log("TT-Editor: No ttEditor project - Code Generator disabled");
    vscode2.commands.executeCommand("setContext", "ttEditor.projectValid", false);
  }
  registerCommands(context, workspaceRoot, isValid);
  const sidebarProvider = new TTEditorSidebarProvider(context, workspaceRoot, isValid);
  context.subscriptions.push(
    vscode2.window.registerWebviewViewProvider("ttEditor.view", sidebarProvider)
  );
  console.log("TT-Editor Extension: Activated successfully");
}
function deactivate() {
  console.log("TT-Editor Extension: Deactivated");
}
function validateProject(workspaceRoot) {
  const envPath = path2.join(workspaceRoot, "src", ".env.ttEditor-LC");
  if (!fs2.existsSync(envPath)) {
    console.log("TT-Editor: .env.ttEditor-LC not found");
    return false;
  }
  try {
    const content = fs2.readFileSync(envPath, "utf-8");
    const match = content.match(/EDITOR_TYPE\s*=\s*["']?([^"'\n\r]+)["']?/);
    if (!match) {
      console.warn("TT-Editor: EDITOR_TYPE not defined in .env.ttEditor-LC");
      return false;
    }
    console.log(`TT-Editor: EDITOR_TYPE = ${match[1]}`);
    return true;
  } catch (err) {
    console.error("TT-Editor: Error reading .env.ttEditor-LC", err);
    return false;
  }
}
function getWorkspaceRoot() {
  const workspaceFolders = vscode2.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    return null;
  }
  return workspaceFolders[0].uri.fsPath;
}
function registerCommands(context, workspaceRoot, isValidProject) {
  const openCanvas = vscode2.commands.registerCommand("ttEditor.openCanvas", () => {
    if (!workspaceRoot) {
      vscode2.window.showWarningMessage("TT-Editor: Bitte \xF6ffne zuerst einen Ordner/Workspace.");
      return;
    }
    console.log("TT-Editor: Opening Canvas...");
    createCanvasWebview(context, workspaceRoot, isValidProject);
  });
  context.subscriptions.push(openCanvas);
}
var TTEditorSidebarProvider = class {
  constructor(context, workspaceRoot, isValidProject) {
    this.context = context;
    this.workspaceRoot = workspaceRoot;
    this.isValidProject = isValidProject;
  }
  resolveWebviewView(webviewView) {
    webviewView.webview.options = {
      enableScripts: true
    };
    webviewView.webview.html = this.getHtmlForWebview();
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.command) {
        case "open-canvas":
          vscode2.commands.executeCommand("ttEditor.openCanvas");
          break;
        case "load-project":
          vscode2.commands.executeCommand("ttEditor.openCanvas");
          break;
        case "open-folder":
          vscode2.commands.executeCommand("vscode.openFolder");
          break;
      }
    });
  }
  getHtmlForWebview() {
    const nonce = getNonce();
    const workspaceName = this.workspaceRoot ? path2.basename(this.workspaceRoot) : "Kein Workspace";
    return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TT-Editor</title>
  <style>
    body {
      padding: 10px;
      color: var(--vscode-foreground);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
    }
    h3 {
      margin: 0 0 16px 0;
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--vscode-descriptionForeground);
    }
    .btn {
      display: block;
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      text-align: left;
      font-size: 13px;
      font-weight: 500;
    }
    .btn:hover {
      background: var(--vscode-button-hoverBackground);
    }
    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }
    .btn-secondary:hover {
      background: var(--vscode-button-secondaryHoverBackground);
    }
    .project-info {
      margin-top: 20px;
      padding: 12px;
      background: var(--vscode-editor-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 4px;
      font-size: 12px;
    }
    .project-info-label {
      color: var(--vscode-descriptionForeground);
      font-weight: 600;
      margin-bottom: 4px;
    }
    .project-info-value {
      color: var(--vscode-foreground);
    }
  </style>
</head>
<body>
  <h3>TT-Editor Low-Code</h3>

  ${!this.workspaceRoot ? `
  <div style="padding: 12px; margin-bottom: 16px; background: var(--vscode-inputValidation-warningBackground); border: 1px solid var(--vscode-inputValidation-warningBorder); border-radius: 4px; font-size: 12px;">
    \u26A0\uFE0F Kein Ordner ge\xF6ffnet
  </div>
  <button class="btn" onclick="openFolder()">
    \u{1F4C1} Ordner \xF6ffnen
  </button>
  ` : `
  <button class="btn" onclick="openCanvas()">
    Canvas \xF6ffnen
  </button>

  <button class="btn btn-secondary" onclick="loadProject()">
    Projekt laden
  </button>

  <div class="project-info">
    <div class="project-info-label">Projekt:</div>
    <div class="project-info-value">${workspaceName}</div>
  </div>
  `}

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    function openCanvas() {
      vscode.postMessage({ command: 'open-canvas' });
    }

    function loadProject() {
      vscode.postMessage({ command: 'load-project' });
    }

    function openFolder() {
      vscode.postMessage({ command: 'open-folder' });
    }
  </script>
</body>
</html>`;
  }
};
function getNonce() {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
