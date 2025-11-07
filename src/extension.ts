/**
 * TT-Editor Extension Entry Point
 * Refactored with Clean Architecture
 */

import * as vscode from 'vscode';
import { WebviewManager } from './services/WebviewManager';
import { SidebarProvider } from './providers/SidebarProvider';

let webviewManager: WebviewManager;
let outputChannel: vscode.OutputChannel;

/**
 * Extension Activation
 */
export function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  outputChannel = vscode.window.createOutputChannel('TT-Editor');
  context.subscriptions.push(outputChannel);

  outputChannel.appendLine('[Extension] Activating TT-Editor...');

  // Initialize Webview Manager
  webviewManager = new WebviewManager(context, outputChannel);

  // Register Show Webview Command
  const showCommand = vscode.commands.registerCommand('vscExtension.showWebview', async () => {
    try {
      await webviewManager.createOrShow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      outputChannel.appendLine(`[Extension] Command failed: ${message}`);
    }
  });
  context.subscriptions.push(showCommand);

  // Register Sidebar View Provider
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscExtension.view', sidebarProvider)
  );

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
export function deactivate() {
  webviewManager?.dispose();
  outputChannel?.dispose();
}
