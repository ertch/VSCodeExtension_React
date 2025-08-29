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
var vscode = __toESM(require("vscode"));
var path = __toESM(require("path"));
var fs = __toESM(require("fs"));
function activate(context) {
  let disposable = vscode.commands.registerCommand("vscExtension.showWebview", () => {
    const panel = vscode.window.createWebviewPanel(
      "extensionWebview",
      "VSC-ExtensionName",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "src", "ui", "dist"))],
        retainContextWhenHidden: true
        // Behalte die Webview aktiv, wenn sie versteckt wird
      }
    );
    const indexPath = vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist", "index.html"));
    let html = fs.readFileSync(indexPath.fsPath, "utf-8");
    const scriptUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist/assets/index.js")));
    const styleUri = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist/assets/index.css")));
    const cspSource = panel.webview.cspSource;
    const cspMetaTag = `
            <meta http-equiv="Content-Security-Policy" content="
                default-src 'self' ${cspSource}; 
                script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri}; 
                style-src 'unsafe-inline' ${cspSource} ${styleUri};
            ">
        `;
    html = html.replace("<head>", `<head>${cspMetaTag}
            <link rel="stylesheet" href="${styleUri}">
            <script type="module" src="${scriptUri}" defer></script>
        `);
    panel.webview.html = html;
  });
  const sidebarProvider = new SidebarWebviewProvider(context);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("vscExtension.quickAccess", sidebarProvider));
  context.subscriptions.push(disposable);
}
var SidebarWebviewProvider = class {
  constructor(context) {
    this.context = context;
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
    webviewView.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "openMainPanel":
            vscode.commands.executeCommand("vscExtension.showWebview");
            break;
          case "alert":
            vscode.window.showInformationMessage(message.text);
            break;
        }
      },
      void 0,
      this.context.subscriptions
    );
  }
  getHtmlForWebview(webview) {
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
                    \u{1F4CB} Open Extension Panel
                </button>
                <button class="button" onclick="showAlert('Hello from sidebar!')">
                    \u{1F4AC} Show Alert
                </button>
                <button class="button" onclick="showAlert('Feature coming soon!')">
                    \u2699\uFE0F Settings
                </button>
            </div>
            
            <div class="section">
                <div class="section-title">Tools</div>
                <button class="button" onclick="showAlert('Tool 1 activated!')">
                    \u{1F527} Tool 1
                </button>
                <button class="button" onclick="showAlert('Tool 2 activated!')">
                    \u{1F528} Tool 2
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
};
function deactivate() {
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
