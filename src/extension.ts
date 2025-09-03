import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import sidebar from './sidebar';

let mainPanel: vscode.WebviewPanel | undefined;

function createOrShowMainPanel(context: vscode.ExtensionContext) {
  if (mainPanel) {
    mainPanel.reveal(vscode.ViewColumn.Active, false);
    return;
  }

  mainPanel = vscode.window.createWebviewPanel(
    'extensionWebview',
    'TT-Editor',
    { viewColumn: vscode.ViewColumn.Active, preserveFocus: false },
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist'))],
      retainContextWhenHidden: true,
    }
  );

  mainPanel.onDidDispose(() => { mainPanel = undefined; });

  const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist', 'index.html'));
  let html = fs.readFileSync(indexPath.fsPath, 'utf-8');

  const scriptUri = mainPanel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.js'))
  );
  const styleUri = mainPanel.webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.css'))
  );

  const cspSource = mainPanel.webview.cspSource;
  const cspMetaTag = `
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self' ${cspSource};
      script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri};
      style-src 'unsafe-inline' ${cspSource} ${styleUri};
    ">
  `;

  html = html.replace('<head>', `<head>${cspMetaTag}
    <link rel="stylesheet" href="${styleUri}">
    <script type="module" src="${scriptUri}" defer></script>
  `);

  mainPanel.webview.html = html;
}

export function activate(context: vscode.ExtensionContext) {
  const showCmd = vscode.commands.registerCommand('vscExtension.showWebview', () => {
    createOrShowMainPanel(context);
  });
  context.subscriptions.push(showCmd);

  // View-Provider bleibt als "Trigger" für deinen Activity-Bar-Icon-Klick
  const viewProvider = new VscExtensionViewProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscExtension.view', viewProvider)
  );
}

class VscExtensionViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    // Sehr leichte/leere View, damit das Öffnen der Sidebar nicht schwergewichtig ist
    webviewView.webview.options = { enableScripts: false };
    webviewView.webview.html = sidebar;

    // Direkt Panel öffnen und Sidebar schließen
    // setTimeout sorgt dafür, dass VS Code erst den Sidebar-UI-Zustand setzt.
    setTimeout(async () => {
      try {
        await vscode.commands.executeCommand('vscExtension.showWebview');
      } finally {
        await vscode.commands.executeCommand('workbench.action.closeSidebar');
      }
    }, 0);
  }
}

export function deactivate() {}