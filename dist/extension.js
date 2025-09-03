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

// src/sidebar.ts
var sidebar_default = `<!DOCTYPE html>
<html lang="en">
    <body>
        <h3>TT-Editor</h3>
        yo was geht
    </body>
</html>
`;

// src/extension.ts
var mainPanel;
function createOrShowMainPanel(context) {
  if (mainPanel) {
    mainPanel.reveal(vscode.ViewColumn.Active, false);
    return;
  }
  mainPanel = vscode.window.createWebviewPanel(
    "extensionWebview",
    "TT-Editor",
    { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, "src", "ui", "dist"))],
      retainContextWhenHidden: true
    }
  );
  mainPanel.onDidDispose(() => {
    mainPanel = void 0;
  });
  const indexPath = vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist", "index.html"));
  let html = fs.readFileSync(indexPath.fsPath, "utf-8");
  const scriptUri = mainPanel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist/assets/index.js"))
  );
  const styleUri = mainPanel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, "src/ui/dist/assets/index.css"))
  );
  const cspSource = mainPanel.webview.cspSource;
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
  mainPanel.webview.html = html;
}
function activate(context) {
  const showCmd = vscode.commands.registerCommand("vscExtension.showWebview", () => {
    createOrShowMainPanel(context);
  });
  context.subscriptions.push(showCmd);
  const viewProvider = new VscExtensionViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vscExtension.view", viewProvider)
  );
}
var VscExtensionViewProvider = class {
  constructor(context) {
    this.context = context;
  }
  resolveWebviewView(webviewView) {
    webviewView.webview.options = { enableScripts: false };
    webviewView.webview.html = sidebar_default;
    setTimeout(async () => {
      try {
        await vscode.commands.executeCommand("vscExtension.showWebview");
      } finally {
        await vscode.commands.executeCommand("workbench.action.closeSidebar");
      }
    }, 0);
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
