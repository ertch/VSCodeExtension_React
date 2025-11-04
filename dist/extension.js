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
var path2 = __toESM(require("path"));
var fs2 = __toESM(require("fs"));

// src/webview.ts
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));

// src/shared/constants.ts
var WEBVIEW_INIT_DELAY_MS = 100;
var ASTRO_DIR = ".astro";
var CONFIG_FILENAME = ".ttEditor.json";
var CONFIG_VERSION = "1.0";
var UI_TEXT = {
  NO_WORKSPACE: "Kein Workspace",
  VALID_PROJECT: "[OK] ttEditor Projekt",
  STANDARD_WORKSPACE: "[ ] Standard Workspace",
  CANVAS_LOADING: "Lade Canvas...",
  CANVAS_EMPTY: "Canvas ist leer",
  CANVAS_EMPTY_HINT: "Ziehe Komponenten aus der Toolbar hierher",
  NO_COMPONENTS: "Keine Komponenten gefunden",
  COMPONENT_PALETTE_TITLE: "Komponenten",
  DELETE_CONFIRM: "wirklich loeschen?",
  CLEAR_CANVAS_CONFIRM: "Canvas wirklich leeren? Alle Aenderungen gehen verloren.",
  SAVE_SUCCESS: "Konfiguration gespeichert",
  SAVE_ERROR: "Fehler beim Speichern",
  LOAD_ERROR: "Fehler beim Laden",
  NO_CONFIG_FOUND: "Keine gespeicherte Konfiguration gefunden",
  INVALID_CONFIG: "Korrupte Konfigurationsdatei",
  MAX_DEPTH_REACHED: "Maximale Verschachtelungstiefe erreicht",
  CIRCULAR_DEPENDENCY: "Parent-Komponente kann nicht in eigenes Child verschoben werden",
  CODE_GEN_NOT_AVAILABLE: "Code-Generator nur in ttEditor-Projekten verfuegbar",
  OPEN_FOLDER_FIRST: "Bitte oeffne zuerst einen Ordner/Workspace"
};
var BUTTON_LABELS = {
  OPEN_FOLDER: "Ordner oeffnen",
  OPEN_CANVAS: "Canvas oeffnen",
  GENERATE_CODE: "Code generieren",
  SAVE: "Speichern",
  LOAD: "Laden",
  CLEAR: "Canvas leeren"
};

// src/shared/projectConfig.ts
function validateComponentNode(node) {
  if (!node || typeof node !== "object") {
    console.warn("validateComponentNode: Node is not an object", node);
    return false;
  }
  if (!node.id || typeof node.id !== "string") {
    console.warn("validateComponentNode: Missing or invalid id", node);
    return false;
  }
  if (!node.type || typeof node.type !== "string") {
    console.warn("validateComponentNode: Missing or invalid type", node);
    return false;
  }
  if (!node.props || typeof node.props !== "object") {
    console.warn("validateComponentNode: Missing or invalid props", node);
    return false;
  }
  if (!node.compName || typeof node.compName !== "string") {
    console.warn("validateComponentNode: Missing or invalid compName", node);
    return false;
  }
  if (node.children !== void 0) {
    if (!Array.isArray(node.children)) {
      console.warn("validateComponentNode: Children is not an array", node);
      return false;
    }
    return node.children.every((child) => validateComponentNode(child));
  }
  return true;
}
function validateProjectConfig(config) {
  if (!config || typeof config !== "object") {
    console.warn("validateProjectConfig: Config is not an object", config);
    return false;
  }
  if (config.version !== CONFIG_VERSION) {
    console.warn(
      `validateProjectConfig: Unsupported version ${config.version}, expected ${CONFIG_VERSION}`
    );
    return false;
  }
  if (!config.projectName || typeof config.projectName !== "string") {
    console.warn("validateProjectConfig: Missing or invalid projectName", config);
    return false;
  }
  if (!config.lastModified || typeof config.lastModified !== "string") {
    console.warn("validateProjectConfig: Missing or invalid lastModified", config);
    return false;
  }
  if (!Array.isArray(config.tree)) {
    console.warn("validateProjectConfig: Tree is not an array", config);
    return false;
  }
  if (!config.metadata || typeof config.metadata !== "object") {
    console.warn("validateProjectConfig: Missing or invalid metadata", config);
    return false;
  }
  const allValid = config.tree.every((node) => validateComponentNode(node));
  if (!allValid) {
    console.warn("validateProjectConfig: Invalid nodes found in tree");
  }
  return allValid;
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
  canvasPanel = vscode.window.createWebviewPanel(
    "ttEditorCanvas",
    // viewType (unique ID)
    `${path.basename(workspaceRoot)} - Canvas`,
    // Title (dynamic)
    vscode.ViewColumn.One,
    // Position
    {
      enableScripts: true,
      // REQUIRED for React
      retainContextWhenHidden: true,
      // Keep state when hidden
      localResourceRoots: [
        // Security: allowed resource paths
        vscode.Uri.file(path.join(context.extensionPath, "src", "ui", "dist"))
      ]
    }
  );
  canvasPanel.webview.html = getCanvasHTML(canvasPanel.webview, context);
  canvasPanel.onDidDispose(
    () => {
      canvasPanel = void 0;
      console.log("TT-Editor: Canvas panel disposed");
    },
    null,
    context.subscriptions
  );
  canvasPanel.webview.onDidReceiveMessage(
    async (message) => handleWebviewMessage(message, canvasPanel, workspaceRoot),
    null,
    context.subscriptions
  );
  const projectName = path.basename(workspaceRoot);
  sendInitMessage(canvasPanel, workspaceRoot, projectName, isValidProject);
  console.log("TT-Editor: Canvas panel created");
  return canvasPanel;
}
function getCanvasHTML(webview, context) {
  const distPath = path.join(context.extensionPath, "src", "ui", "dist");
  const htmlPath = path.join(distPath, "index.html");
  if (!fs.existsSync(htmlPath)) {
    console.error("TT-Editor: UI build not found at", htmlPath);
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <h1>Fehler: UI Build nicht gefunden</h1>
          <p>Bitte f\xFChre <code>cd src/ui && npm run build</code> aus.</p>
        </body>
      </html>
    `;
  }
  let html = fs.readFileSync(htmlPath, "utf-8");
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(distPath, "assets", "index.js"))
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(distPath, "assets", "index.css"))
  );
  html = html.replace("./assets/index.js", scriptUri.toString()).replace("./assets/index.css", styleUri.toString()).replace(
    "<head>",
    `<head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource}; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
        <script>window.vscodeApi = acquireVsCodeApi();</script>`
  );
  return html;
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
    case "GENERATE_CODE":
      await handleGenerateCode(message.payload, workspaceRoot);
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
    const configPath = path.join(workspaceRoot, CONFIG_FILENAME);
    fs.writeFileSync(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8"
    );
    console.log("TT-Editor: Configuration saved to", configPath);
    panel.webview.postMessage({
      type: "SAVE_SUCCESS",
      filePath: configPath
    });
    vscode.window.showInformationMessage("TT-Editor: Konfiguration gespeichert");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("TT-Editor: Save failed", err);
    panel.webview.postMessage({
      type: "ERROR",
      message: `Fehler beim Speichern: ${errorMessage}`
    });
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Speichern - ${errorMessage}`);
  }
}
async function handleLoadRequest(panel, workspaceRoot) {
  try {
    const config = loadConfig(workspaceRoot);
    if (!config) {
      vscode.window.showWarningMessage("TT-Editor: Keine gespeicherte Konfiguration gefunden");
      return;
    }
    panel.webview.postMessage({
      type: "LOAD_RESPONSE",
      payload: config
    });
    console.log("TT-Editor: Configuration loaded");
    vscode.window.showInformationMessage("TT-Editor: Konfiguration geladen");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("TT-Editor: Load failed", err);
    panel.webview.postMessage({
      type: "ERROR",
      message: `Fehler beim Laden: ${errorMessage}`
    });
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Laden - ${errorMessage}`);
  }
}
async function handleGenerateCode(astroCode, workspaceRoot) {
  try {
    const astroFilePath = path.join(workspaceRoot, "index.astro");
    fs.writeFileSync(astroFilePath, astroCode, "utf-8");
    console.log("TT-Editor: Astro code generated at", astroFilePath);
    const doc = await vscode.workspace.openTextDocument(astroFilePath);
    await vscode.window.showTextDocument(doc);
    vscode.window.showInformationMessage("TT-Editor: Astro Code generiert!");
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("TT-Editor: Code generation failed", err);
    vscode.window.showErrorMessage(`TT-Editor: Code-Generierung fehlgeschlagen - ${errorMessage}`);
  }
}
function loadConfig(workspaceRoot) {
  const configPath = path.join(workspaceRoot, CONFIG_FILENAME);
  if (!fs.existsSync(configPath)) {
    console.log("TT-Editor: No config file found at", configPath);
    return null;
  }
  try {
    const configContent = fs.readFileSync(configPath, "utf-8");
    const config = JSON.parse(configContent);
    if (!validateProjectConfig(config)) {
      throw new Error("Invalid configuration format");
    }
    return config;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Korrupte Konfigurationsdatei: ${errorMessage}`);
  }
}
function sendInitMessage(panel, workspaceRoot, projectName, isValidProject) {
  setTimeout(() => {
    const config = loadConfig(workspaceRoot);
    panel.webview.postMessage({
      type: "INIT",
      payload: {
        projectName,
        config,
        isValidProject
      }
    });
    console.log("TT-Editor: INIT message sent", { projectName, hasConfig: !!config, isValidProject });
  }, WEBVIEW_INIT_DELAY_MS);
}

// src/extension.ts
function activate(context) {
  var _a, _b;
  console.log("TT-Editor: Extension activating...");
  const workspaceRoot = ((_b = (_a = vscode2.workspace.workspaceFolders) == null ? void 0 : _a[0]) == null ? void 0 : _b.uri.fsPath) || null;
  const astroDir = workspaceRoot ? path2.join(workspaceRoot, ASTRO_DIR) : null;
  const isValidProject = astroDir ? fs2.existsSync(astroDir) && fs2.statSync(astroDir).isDirectory() : false;
  vscode2.commands.executeCommand("setContext", "ttEditor.projectValid", isValidProject);
  if (!workspaceRoot) {
    console.log("TT-Editor: No workspace open - waiting for user to open folder");
  } else {
    const status = isValidProject ? UI_TEXT.VALID_PROJECT + " - Code Generator enabled" : UI_TEXT.STANDARD_WORKSPACE + " - Code Generator disabled";
    console.log(`TT-Editor: ${status}`);
  }
  registerCommands(context, workspaceRoot, isValidProject);
  const provider = new TTEditorSidebarProvider(context, workspaceRoot, isValidProject);
  context.subscriptions.push(
    vscode2.window.registerWebviewViewProvider(
      "ttEditor.view",
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );
  console.log('TT-Editor: Sidebar provider registered for view ID "ttEditor.view"');
}
function deactivate() {
  console.log("TT-Editor: Extension deactivated");
}
function registerCommands(context, workspaceRoot, isValidProject) {
  context.subscriptions.push(
    vscode2.commands.registerCommand("ttEditor.openCanvas", () => {
      if (!workspaceRoot) {
        return vscode2.window.showWarningMessage(UI_TEXT.OPEN_FOLDER_FIRST);
      }
      createCanvasWebview(context, workspaceRoot, isValidProject);
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("ttEditor.generateCode", () => {
      if (!workspaceRoot) {
        return vscode2.window.showWarningMessage(UI_TEXT.OPEN_FOLDER_FIRST);
      }
      if (!isValidProject) {
        return vscode2.window.showWarningMessage(UI_TEXT.CODE_GEN_NOT_AVAILABLE);
      }
      vscode2.window.showInformationMessage("TT-Editor: Code-Generator wird gestartet...");
    })
  );
  context.subscriptions.push(
    vscode2.commands.registerCommand("ttEditor.openFolder", () => {
      vscode2.commands.executeCommand("vscode.openFolder");
    })
  );
}
var TTEditorSidebarProvider = class {
  constructor(context, workspaceRoot, isValidProject) {
    this.context = context;
    this.workspaceRoot = workspaceRoot;
    this.isValidProject = isValidProject;
  }
  resolveWebviewView(webviewView) {
    console.log("TT-Editor: Sidebar resolveWebviewView called");
    webviewView.webview.options = {
      enableScripts: true
    };
    webviewView.webview.html = this.getSidebarHTML();
    console.log("TT-Editor: Sidebar HTML set");
    webviewView.webview.onDidReceiveMessage(({ type }) => {
      if (type === "open-canvas") {
        vscode2.commands.executeCommand("ttEditor.openCanvas");
      } else if (type === "open-folder") {
        vscode2.commands.executeCommand("ttEditor.openFolder");
      } else if (type === "generate-code") {
        vscode2.commands.executeCommand("ttEditor.generateCode");
      }
    });
  }
  getSidebarHTML() {
    const projectName = this.workspaceRoot ? path2.basename(this.workspaceRoot) : UI_TEXT.NO_WORKSPACE;
    const projectStatus = this.isValidProject ? UI_TEXT.VALID_PROJECT : UI_TEXT.STANDARD_WORKSPACE;
    return `
      <!DOCTYPE html>
      <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              padding: 16px;
              font-family: var(--vscode-font-family);
              color: var(--vscode-foreground);
              background: var(--vscode-editor-background);
            }
            h3 { margin-top: 0; font-size: 14px; }
            p { font-size: 12px; margin: 8px 0; color: var(--vscode-descriptionForeground); }
            button {
              width: 100%;
              padding: 8px 12px;
              margin: 6px 0;
              border: none;
              border-radius: 2px;
              cursor: pointer;
              font-size: 13px;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
            }
            button:hover {
              background: var(--vscode-button-hoverBackground);
            }
            button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .btn-secondary {
              background: var(--vscode-button-secondaryBackground);
              color: var(--vscode-button-secondaryForeground);
            }
            .btn-secondary:hover {
              background: var(--vscode-button-secondaryHoverBackground);
            }
          </style>
        </head>
        <body>
          <h3>TT-Editor</h3>
          <p><strong>Projekt:</strong> ${projectName}</p>
          <p><strong>Status:</strong> ${projectStatus}</p>

          ${!this.workspaceRoot ? `
            <button onclick="openFolder()">${BUTTON_LABELS.OPEN_FOLDER}</button>
          ` : `
            <button onclick="openCanvas()">${BUTTON_LABELS.OPEN_CANVAS}</button>
            <button class="btn-secondary" onclick="generateCode()" ${!this.isValidProject ? "disabled" : ""}>
              ${BUTTON_LABELS.GENERATE_CODE}
            </button>
          `}

          <script>
            const vscode = acquireVsCodeApi();
            function openCanvas() { vscode.postMessage({ type: 'open-canvas' }); }
            function openFolder() { vscode.postMessage({ type: 'open-folder' }); }
            function generateCode() { vscode.postMessage({ type: 'generate-code' }); }
          </script>
        </body>
      </html>
    `;
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
