"use strict";
/**
 * SidebarProvider - Provides content for VSCode Sidebar View
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class SidebarProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: false };
        webviewView.webview.html = this.getSidebarHTML();
        // Automatically open main panel and close sidebar
        setTimeout(async () => {
            try {
                await vscode.commands.executeCommand('vscExtension.showWebview');
            }
            finally {
                await vscode.commands.executeCommand('workbench.action.closeSidebar');
            }
        }, 0);
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
    <title>TT-Editor</title>
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
    <h3>TT-Editor</h3>
    <p>Klicken Sie auf das Icon, um den Editor zu starten.</p>
  </body>
</html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map