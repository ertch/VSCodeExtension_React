"use strict";
/**
 * SidebarProvider - Provides content for VSCode Sidebar View
 */
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
exports.SidebarProvider = void 0;
const vscode = require("vscode");
class SidebarProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: false };
        webviewView.webview.html = this.getSidebarHTML();
        // Automatically open main panel and close sidebar
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            try {
                yield vscode.commands.executeCommand('vscExtension.showWebview');
            }
            finally {
                yield vscode.commands.executeCommand('workbench.action.closeSidebar');
            }
        }), 0);
    }
    /**
     * Generate professional sidebar HTML
     */
    getSidebarHTML() {
        return `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ttEditor-LC</title>
    <style>
      body {
        font-family: var(--vscode-font-family);
        padding: 20px;
        text-align: center;
        color: var(--vscode-foreground);
        background-color: var(--vscode-editor-background);
      }
      h3 {
        margin: 0 0 10px 0;
        color: var(--vscode-textLink-foreground);
        font-weight: 600;
      }
      p {
        margin: 0;
        opacity: 0.8;
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <h3>ttEditor-LC</h3>
    <p>Klicken Sie auf das Icon, um den Editor zu starten.</p>
  </body>
</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
