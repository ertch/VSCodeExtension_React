// src/webview.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import type {
  CanvasToExtensionMessage,
  ExtensionToCanvasMessage,
  ProjectConfig
} from './shared/messageProtocol';
import {
  validateProjectConfig,
  updateTimestamp
} from './shared/projectConfig';
import {
  CONFIG_FILENAME,
  WEBVIEW_INIT_DELAY_MS
} from './shared/constants';

// ============================================================================
// SINGLETON PATTERN FOR CANVAS PANEL
// ============================================================================

let canvasPanel: vscode.WebviewPanel | undefined;

/**
 * Creates or reveals the canvas webview panel
 *
 * SINGLETON (DEUTSCH):
 * - Nur EIN Canvas-Panel kann existieren
 * - Wiederholtes Aufrufen revealed existierendes Panel
 * - Panel wird automatisch disposed bei Schließen
 */
export function createCanvasWebview(
  context: vscode.ExtensionContext,
  workspaceRoot: string,
  isValidProject: boolean
): vscode.WebviewPanel {
  // Reveal existing panel if it exists
  if (canvasPanel) {
    canvasPanel.reveal(vscode.ViewColumn.One);
    return canvasPanel;
  }

  // Create new panel
  canvasPanel = vscode.window.createWebviewPanel(
    'ttEditorCanvas',                               // viewType (unique ID)
    `${path.basename(workspaceRoot)} - Canvas`,     // Title (dynamic)
    vscode.ViewColumn.One,                          // Position
    {
      enableScripts: true,                          // REQUIRED for React
      retainContextWhenHidden: true,                // Keep state when hidden
      localResourceRoots: [                         // Security: allowed resource paths
        vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist'))
      ],
    }
  );

  // Set HTML content
  canvasPanel.webview.html = getCanvasHTML(canvasPanel.webview, context);

  // Handle disposal
  canvasPanel.onDidDispose(
    () => {
      canvasPanel = undefined;
      console.log('TT-Editor: Canvas panel disposed');
    },
    null,
    context.subscriptions
  );

  // Handle messages from webview
  canvasPanel.webview.onDidReceiveMessage(
    async (message: CanvasToExtensionMessage) =>
      handleWebviewMessage(message, canvasPanel!, workspaceRoot),
    null,
    context.subscriptions
  );

  // Send initial message
  const projectName = path.basename(workspaceRoot);
  sendInitMessage(canvasPanel, workspaceRoot, projectName, isValidProject);

  console.log('TT-Editor: Canvas panel created');
  return canvasPanel;
}

// ============================================================================
// HTML GENERATION
// ============================================================================

/**
 * Generates HTML for canvas webview
 *
 * WICHTIG (DEUTSCH):
 * - Lädt kompilierten Vite-Build aus src/ui/dist
 * - Transformiert Pfade mit asWebviewUri() für Security
 * - Injiziert Content Security Policy
 * - Injiziert vscodeApi global BEFORE React loads
 */
function getCanvasHTML(
  webview: vscode.Webview,
  context: vscode.ExtensionContext
): string {
  const distPath = path.join(context.extensionPath, 'src', 'ui', 'dist');
  const htmlPath = path.join(distPath, 'index.html');

  // Check if build exists
  if (!fs.existsSync(htmlPath)) {
    console.error('TT-Editor: UI build not found at', htmlPath);
    return `
      <!DOCTYPE html>
      <html>
        <head><meta charset="UTF-8"></head>
        <body>
          <h1>Fehler: UI Build nicht gefunden</h1>
          <p>Bitte führe <code>cd src/ui && npm run build</code> aus.</p>
        </body>
      </html>
    `;
  }

  let html = fs.readFileSync(htmlPath, 'utf-8');

  // Transform asset URIs
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(distPath, 'assets', 'index.js'))
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(distPath, 'assets', 'index.css'))
  );

  // Replace paths and inject CSP + vscodeApi
  html = html
    .replace('./assets/index.js', scriptUri.toString())
    .replace('./assets/index.css', styleUri.toString())
    .replace(
      '<head>',
      `<head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource}; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
        <script>window.vscodeApi = acquireVsCodeApi();</script>`
    );

  return html;
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Central message dispatcher
 *
 * FLOW (DEUTSCH):
 * - Empfängt Messages vom Webview
 * - Routet basierend auf Type
 * - Delegiert an spezialisierte Handler
 */
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

    case 'GENERATE_CODE':
      await handleGenerateCode(message.payload, workspaceRoot);
      break;

    default:
      console.warn('TT-Editor: Unknown message type', message);
  }
}

/**
 * Handles SAVE message
 *
 * STEPS (DEUTSCH):
 * 1. Validiere Config mit validateProjectConfig()
 * 2. Update Timestamp
 * 3. Schreibe JSON-Datei
 * 4. Sende SAVE_SUCCESS oder ERROR zurück
 */
async function handleSave(
  config: ProjectConfig,
  panel: vscode.WebviewPanel,
  workspaceRoot: string
): Promise<void> {
  try {
    // Validate
    if (!validateProjectConfig(config)) {
      throw new Error('Invalid project configuration');
    }

    // Update timestamp
    const updatedConfig = updateTimestamp(config);

    // Write file
    const configPath = path.join(workspaceRoot, CONFIG_FILENAME);
    fs.writeFileSync(
      configPath,
      JSON.stringify(updatedConfig, null, 2),
      'utf-8'
    );

    // Success feedback
    console.log('TT-Editor: Configuration saved to', configPath);
    panel.webview.postMessage({
      type: 'SAVE_SUCCESS',
      filePath: configPath,
    } as ExtensionToCanvasMessage);
    vscode.window.showInformationMessage('TT-Editor: Konfiguration gespeichert');
  } catch (err) {
    // Error feedback
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('TT-Editor: Save failed', err);
    panel.webview.postMessage({
      type: 'ERROR',
      message: `Fehler beim Speichern: ${errorMessage}`,
    } as ExtensionToCanvasMessage);
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Speichern - ${errorMessage}`);
  }
}

/**
 * Handles LOAD_REQUEST message
 *
 * STEPS (DEUTSCH):
 * 1. Lade Config aus .ttEditor.json
 * 2. Validiere
 * 3. Sende LOAD_RESPONSE oder ERROR zurück
 */
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

    panel.webview.postMessage({
      type: 'LOAD_RESPONSE',
      payload: config,
    } as ExtensionToCanvasMessage);
    console.log('TT-Editor: Configuration loaded');
    vscode.window.showInformationMessage('TT-Editor: Konfiguration geladen');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('TT-Editor: Load failed', err);
    panel.webview.postMessage({
      type: 'ERROR',
      message: `Fehler beim Laden: ${errorMessage}`,
    } as ExtensionToCanvasMessage);
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Laden - ${errorMessage}`);
  }
}

/**
 * Handles GENERATE_CODE message
 *
 * STEPS (DEUTSCH):
 * 1. Empfange generierten Astro-Code vom Webview
 * 2. Schreibe in index.astro Datei
 * 3. Öffne generierte Datei
 * 4. Zeige Success-Message
 */
async function handleGenerateCode(
  astroCode: string,
  workspaceRoot: string
): Promise<void> {
  try {
    const astroFilePath = path.join(workspaceRoot, 'index.astro');
    fs.writeFileSync(astroFilePath, astroCode, 'utf-8');
    console.log('TT-Editor: Astro code generated at', astroFilePath);

    // Open generated file
    const doc = await vscode.workspace.openTextDocument(astroFilePath);
    await vscode.window.showTextDocument(doc);

    vscode.window.showInformationMessage('TT-Editor: Astro Code generiert!');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('TT-Editor: Code generation failed', err);
    vscode.window.showErrorMessage(`TT-Editor: Code-Generierung fehlgeschlagen - ${errorMessage}`);
  }
}

/**
 * Loads config from .ttEditor.json
 *
 * RETURN (DEUTSCH):
 * - ProjectConfig wenn Datei existiert und valid
 * - null wenn Datei nicht existiert
 * - wirft Error bei korrupter Datei
 */
function loadConfig(workspaceRoot: string): ProjectConfig | null {
  const configPath = path.join(workspaceRoot, CONFIG_FILENAME);

  if (!fs.existsSync(configPath)) {
    console.log('TT-Editor: No config file found at', configPath);
    return null;
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(configContent);

    if (!validateProjectConfig(config)) {
      throw new Error('Invalid configuration format');
    }

    return config;
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Korrupte Konfigurationsdatei: ${errorMessage}`);
  }
}

/**
 * Sends initial INIT message to webview
 *
 * TIMING (DEUTSCH):
 * - Wartet 100ms (WEBVIEW_INIT_DELAY_MS) bevor Message gesendet wird
 * - Grund: Webview braucht Zeit zum Laden
 * - PROBLEM: Race Condition möglich - besser wäre auf READY-Message zu warten
 */
function sendInitMessage(
  panel: vscode.WebviewPanel,
  workspaceRoot: string,
  projectName: string,
  isValidProject: boolean
): void {
  setTimeout(() => {
    const config = loadConfig(workspaceRoot);

    panel.webview.postMessage({
      type: 'INIT',
      payload: {
        projectName,
        config,
        isValidProject,
      },
    } as ExtensionToCanvasMessage);

    console.log('TT-Editor: INIT message sent', { projectName, hasConfig: !!config, isValidProject });
  }, WEBVIEW_INIT_DELAY_MS);
}
