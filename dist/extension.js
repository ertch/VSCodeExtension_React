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
  context.subscriptions.push(disposable);
  const viewProvider = new vscExtensionViewProvider(context);
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("vscExtension.view", viewProvider));
}
var vscExtensionViewProvider = class {
  constructor(context) {
    this.context = context;
  }
  resolveWebviewView(webviewView, context, token) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(this.context.extensionPath, "src", "ui", "dist"))]
    };
    const indexPath = vscode.Uri.file(path.join(this.context.extensionPath, "src/ui/dist", "index.html"));
    let html = fs.readFileSync(indexPath.fsPath, "utf-8");
    const scriptUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "src/ui/dist/assets/index.js")));
    const styleUri = webviewView.webview.asWebviewUri(vscode.Uri.file(path.join(this.context.extensionPath, "src/ui/dist/assets/index.css")));
    const cspSource = webviewView.webview.cspSource;
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
    webviewView.webview.html = html;
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
