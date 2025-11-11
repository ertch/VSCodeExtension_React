import * as vscode from 'vscode';
import { WebviewManager } from './services/WebviewManager';
import { SidebarProvider } from './providers/SidebarProvider';

let webviewManager: WebviewManager;
let outputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  // Create output channel
  outputChannel = vscode.window.createOutputChannel('ttEditor-LC');
  context.subscriptions.push(outputChannel);

  outputChannel.appendLine('[Extension] starte ttEditor-LC');

  // Register Sidebar FIRST (so WebviewManager can reference it)
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscExtension.view', sidebarProvider)
  );

  // Initialize Webview with SidebarProvider reference
  webviewManager = new WebviewManager(context, outputChannel, sidebarProvider);
  const showCommand = vscode.commands.registerCommand('vscExtension.showWebview', async () => {
    try {
      await webviewManager.createOrShow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      outputChannel.appendLine(`[Extension] Command failed: ${message}`);
    }
  });
  context.subscriptions.push(showCommand);

  context.subscriptions.push({
    dispose: () => {
      webviewManager.dispose();
      outputChannel.appendLine('[Extension] Extension abgeschaltet');
    }
  });

  outputChannel.appendLine('[Extension] ttEditor-LC ist hochgefahren');
}
 
export function deactivate() {
  webviewManager?.dispose();
  outputChannel?.dispose();
}
