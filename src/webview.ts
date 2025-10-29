/**
 * Webview Manager
 * Erstellt und verwaltet das Canvas Webview
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {
  ExtensionToCanvasMessage,
  CanvasToExtensionMessage,
  ProjectConfig,
} from './shared/messageProtocol';
import {
  validateProjectConfig,
  createEmptyConfig,
  updateTimestamp,
} from './shared/projectConfig';

let canvasPanel: vscode.WebviewPanel | undefined;

// ============================================================================
// CREATE WEBVIEW
// ============================================================================

export function createCanvasWebview(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  isValidProject: boolean
): vscode.WebviewPanel {
  // If panel exists, reveal it
  if (canvasPanel) {
    canvasPanel.reveal(vscode.ViewColumn.One);
    return canvasPanel;
  }

  const projectName = path.basename(workspaceRoot);

  // Create new panel
  canvasPanel = vscode.window.createWebviewPanel(
    'ttEditorCanvas',
    `${projectName} - Canvas`,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist')),
      ],
    }
  );

  // Set HTML content
  canvasPanel.webview.html = getCanvasHTML(canvasPanel.webview, context);

  // Handle disposal
  canvasPanel.onDidDispose(() => {
    canvasPanel = undefined;
  }, null, context.subscriptions);

  // Handle messages from Canvas
  canvasPanel.webview.onDidReceiveMessage(
    async (message: CanvasToExtensionMessage) => {
      await handleWebviewMessage(message, canvasPanel!, workspaceRoot);
    },
    null,
    context.subscriptions
  );

  // Send initial config
  sendInitMessage(canvasPanel, workspaceRoot, projectName, isValidProject);

  return canvasPanel;
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

export async function handleWebviewMessage(
  message: CanvasToExtensionMessage,
  panel: vscode.WebviewPanel,
  workspaceRoot: string
): Promise<void> {
  switch (message.type) {
    case 'READY':
      console.log('TT-Editor: Canvas ready');
      break;

    case 'SAVE':
      await handleSave(message.payload, panel, workspaceRoot);
      break;

    case 'LOAD_REQUEST':
      await handleLoadRequest(panel, workspaceRoot);
      break;

    default:
      console.warn('TT-Editor: Unknown message type', message);
  }
}

// ============================================================================
// SAVE HANDLER
// ============================================================================

async function handleSave(
  config: ProjectConfig,
  panel: vscode.WebviewPanel,
  workspaceRoot: string
): Promise<void> {
  try {
    // Validate config
    if (!validateProjectConfig(config)) {
      throw new Error('Invalid project configuration');
    }

    // Update timestamp
    const updatedConfig = updateTimestamp(config);

    // Write to file
    const configPath = path.join(workspaceRoot, '.ttEditor.json');
    fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');

    console.log('TT-Editor: Configuration saved', configPath);

    // Send success message
    const successMsg: ExtensionToCanvasMessage = {
      type: 'SAVE_SUCCESS',
      filePath: configPath,
    };
    panel.webview.postMessage(successMsg);

    vscode.window.showInformationMessage('TT-Editor: Konfiguration gespeichert');
  } catch (err) {
    console.error('TT-Editor: Save failed', err);

    const errorMsg: ExtensionToCanvasMessage = {
      type: 'ERROR',
      message: `Fehler beim Speichern: ${err}`,
    };
    panel.webview.postMessage(errorMsg);

    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Speichern - ${err}`);
  }
}

// ============================================================================
// LOAD HANDLER
// ============================================================================

async function handleLoadRequest(
  panel: vscode.WebviewPanel,
  workspaceRoot: string
): Promise<void> {
  try {
    const config = loadConfig(workspaceRoot);

    if (!config) {
      vscode.window.showWarningMessage('TT-Editor: Keine gespeicherte Konfiguration gefunden');
      return;
    }

    const loadMsg: ExtensionToCanvasMessage = {
      type: 'LOAD_RESPONSE',
      payload: config,
    };
    panel.webview.postMessage(loadMsg);

    console.log('TT-Editor: Configuration loaded');
  } catch (err) {
    console.error('TT-Editor: Load failed', err);

    const errorMsg: ExtensionToCanvasMessage = {
      type: 'ERROR',
      message: `Fehler beim Laden: ${err}`,
    };
    panel.webview.postMessage(errorMsg);

    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Laden - ${err}`);
  }
}

// ============================================================================
// CONFIG I/O
// ============================================================================

/**
 * Lädt .ttEditor.json aus Workspace Root
 */
function loadConfig(workspaceRoot: string): ProjectConfig | null {
  const configPath = path.join(workspaceRoot, '.ttEditor.json');

  if (!fs.existsSync(configPath)) {
    console.log('TT-Editor: No .ttEditor.json found');
    return null;
  }

  try {
    const content = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(content);

    if (!validateProjectConfig(config)) {
      throw new Error('Invalid configuration format');
    }

    return config;
  } catch (err) {
    console.error('TT-Editor: Failed to load config', err);
    throw new Error(`Korrupte Konfigurationsdatei: ${err}`);
  }
}

/**
 * Sendet INIT Message an Canvas mit optional geladener Config
 */
function sendInitMessage(
  panel: vscode.WebviewPanel,
  workspaceRoot: string,
  projectName: string,
  isValidProject: boolean
): void {
  const config = loadConfig(workspaceRoot);

  const initMsg: ExtensionToCanvasMessage = {
    type: 'INIT',
    payload: {
      projectName,
      config: config || null,
      isValidProject,
    },
  };

  // Send after short delay to ensure webview is ready
  setTimeout(() => {
    panel.webview.postMessage(initMsg);
    console.log('TT-Editor: INIT message sent', { isValidProject });
  }, 100);
}

// ============================================================================
// HTML GENERATION
// ============================================================================

function getCanvasHTML(
  webview: vscode.Webview,
  context: vscode.ExtensionContext
): string {
  // Read the built index.html from Vite
  const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist', 'index.html'));
  let html = fs.readFileSync(indexPath.fsPath, 'utf-8');

  const scriptUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.js'))
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.css'))
  );

  const cspSource = webview.cspSource;
  const cspMetaTag = `
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self' ${cspSource};
      script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri};
      style-src 'unsafe-inline' ${cspSource} ${styleUri};
    ">
  `;

  // Inject CSP, styles, and scripts into the head
  html = html.replace('<head>', `<head>${cspMetaTag}
    <link rel="stylesheet" href="${styleUri}">
    <script>
      window.vscodeApi = acquireVsCodeApi();
      console.log('VS Code API injected:', !!window.vscodeApi);
    </script>
    <script type="module" src="${scriptUri}" defer></script>
  `);

  return html;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
