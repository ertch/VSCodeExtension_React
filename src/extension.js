"use strict";
/**
 * TT-Editor Extension Entry Point
 * Refactored with Clean Architecture
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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
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
    const showCommand = vscode.commands.registerCommand('vscExtension.showWebview', () => __awaiter(this, void 0, void 0, function* () {
        try {
            yield webviewManager.createOrShow();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            outputChannel.appendLine(`[Extension] Command failed: ${message}`);
        }
    }));
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
    webviewManager === null || webviewManager === void 0 ? void 0 : webviewManager.dispose();
    outputChannel === null || outputChannel === void 0 ? void 0 : outputChannel.dispose();
}
