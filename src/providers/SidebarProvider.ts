/**
 * SidebarProvider - Provides content for VSCode Sidebar View
 */

import * as vscode from 'vscode';

export class SidebarProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = { enableScripts: false };
    webviewView.webview.html = this.getSidebarHTML();

    // Automatically open main panel and close sidebar
    setTimeout(async () => {
      try {
        await vscode.commands.executeCommand('vscExtension.showWebview');
      } finally {
        await vscode.commands.executeCommand('workbench.action.closeSidebar');
      }
    }, 0);
  }

  /**
   * Generate professional sidebar HTML
   */
  private getSidebarHTML(): string {
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
