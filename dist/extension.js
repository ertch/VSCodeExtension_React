"use strict";
/**
 * TT-Editor Extension Entry Point
 * Refactored with Clean Architecture
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const WebviewManager_1 = require("./services/WebviewManager");
const SidebarProvider_1 = require("./providers/SidebarProvider");
let webviewManager;
let outputChannel;
/**
 * Extension Activation
 */
function activate(context) {
    // Create output channel for logging
    outputChannel = vscode.window.createOutputChannel('TT-Editor');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('[Extension] Activating TT-Editor...');
    // Initialize Webview Manager
    webviewManager = new WebviewManager_1.WebviewManager(context, outputChannel);
    // Register Show Webview Command
    const showCommand = vscode.commands.registerCommand('vscExtension.showWebview', async () => {
        try {
            await webviewManager.createOrShow();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            outputChannel.appendLine(`[Extension] Command failed: ${message}`);
        }
    });
    context.subscriptions.push(showCommand);
    // Register Sidebar View Provider
    const sidebarProvider = new SidebarProvider_1.SidebarProvider(context);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscExtension.view', sidebarProvider));
    // Register disposal
    context.subscriptions.push({
        dispose: () => {
            webviewManager.dispose();
            outputChannel.appendLine('[Extension] Extension deactivated');
        }
    });
    outputChannel.appendLine('[Extension] TT-Editor activated successfully');
}
/**
 * Extension Deactivation
 */
function deactivate() {
    webviewManager?.dispose();
    outputChannel?.dispose();
}
//# sourceMappingURL=extension.js.map