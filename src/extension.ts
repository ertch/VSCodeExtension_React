// src/extension.ts

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { createCanvasWebview } from './webview';
import { ASTRO_DIR, UI_TEXT, BUTTON_LABELS } from './shared/constants';

// ============================================================================
// EXTENSION ACTIVATION
// ============================================================================

/**
 * Extension activation entry point
 *
 * FLOW (DEUTSCH):
 * 1. Prüfe ob Workspace geöffnet ist
 * 2. Validiere ob .astro Verzeichnis existiert
 * 3. Setze Context-Variable 'ttEditor.projectValid'
 * 4. Registriere Commands
 * 5. Registriere Sidebar Provider
 */
export function activate(context: vscode.ExtensionContext) {
  console.log('TT-Editor: Extension activating...');

  // Step 1: Check workspace
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || null;

  // Step 2: Validate project (check for .astro directory)
  const astroDir = workspaceRoot ? path.join(workspaceRoot, ASTRO_DIR) : null;
  const isValidProject = astroDir
    ? fs.existsSync(astroDir) && fs.statSync(astroDir).isDirectory()
    : false;

  // Step 3: Set context variable (enables/disables commands)
  vscode.commands.executeCommand('setContext', 'ttEditor.projectValid', isValidProject);

  // Logging
  if (!workspaceRoot) {
    console.log('TT-Editor: No workspace open - waiting for user to open folder');
  } else {
    const status = isValidProject
      ? UI_TEXT.VALID_PROJECT + ' - Code Generator enabled'
      : UI_TEXT.STANDARD_WORKSPACE + ' - Code Generator disabled';
    console.log(`TT-Editor: ${status}`);
  }

  // Step 4: Register commands
  registerCommands(context, workspaceRoot, isValidProject);

  // Step 5: Register sidebar provider
  const provider = new TTEditorSidebarProvider(context, workspaceRoot, isValidProject);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'ttEditor.view',
      provider,
      {
        webviewOptions: {
          retainContextWhenHidden: true
        }
      }
    )
  );

  console.log('TT-Editor: Sidebar provider registered for view ID "ttEditor.view"');
}

// ============================================================================
// EXTENSION DEACTIVATION
// ============================================================================

export function deactivate() {
  console.log('TT-Editor: Extension deactivated');
  // No cleanup needed - context.subscriptions handles disposal automatically
}

// ============================================================================
// COMMAND REGISTRATION
// ============================================================================

/**
 * Registers all extension commands
 *
 * COMMANDS:
 * - ttEditor.openCanvas: Opens the main canvas panel
 * - ttEditor.generateCode: Triggers code generation (only in valid projects)
 * - ttEditor.openFolder: Opens folder picker dialog
 */
function registerCommands(
  context: vscode.ExtensionContext,
  workspaceRoot: string | null,
  isValidProject: boolean
) {
  // Command: Open Canvas
  context.subscriptions.push(
    vscode.commands.registerCommand('ttEditor.openCanvas', () => {
      if (!workspaceRoot) {
        return vscode.window.showWarningMessage(UI_TEXT.OPEN_FOLDER_FIRST);
      }
      createCanvasWebview(context, workspaceRoot, isValidProject);
    })
  );

  // Command: Generate Code
  context.subscriptions.push(
    vscode.commands.registerCommand('ttEditor.generateCode', () => {
      if (!workspaceRoot) {
        return vscode.window.showWarningMessage(UI_TEXT.OPEN_FOLDER_FIRST);
      }
      if (!isValidProject) {
        return vscode.window.showWarningMessage(UI_TEXT.CODE_GEN_NOT_AVAILABLE);
      }
      vscode.window.showInformationMessage('TT-Editor: Code-Generator wird gestartet...');
      // Actual implementation will be triggered by webview
    })
  );

  // Command: Open Folder
  context.subscriptions.push(
    vscode.commands.registerCommand('ttEditor.openFolder', () => {
      vscode.commands.executeCommand('vscode.openFolder');
    })
  );
}

// ============================================================================
// SIDEBAR PROVIDER
// ============================================================================

/**
 * Sidebar WebviewView Provider
 *
 * FEATURES (DEUTSCH):
 * - Zeigt Projekt-Status
 * - Buttons für Canvas öffnen, Code generieren, Ordner öffnen
 * - Code-Generator-Button ist disabled wenn kein gültiges Projekt
 */
class TTEditorSidebarProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly workspaceRoot: string | null,
    private readonly isValidProject: boolean
  ) {}

  resolveWebviewView(webviewView: vscode.WebviewView) {
    console.log('TT-Editor: Sidebar resolveWebviewView called');

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getSidebarHTML();
    console.log('TT-Editor: Sidebar HTML set');

    // Handle messages from sidebar
    webviewView.webview.onDidReceiveMessage(({ type }) => {
      if (type === 'open-canvas') {
        vscode.commands.executeCommand('ttEditor.openCanvas');
      } else if (type === 'open-folder') {
        vscode.commands.executeCommand('ttEditor.openFolder');
      } else if (type === 'generate-code') {
        vscode.commands.executeCommand('ttEditor.generateCode');
      }
    });
  }

  private getSidebarHTML(): string {
    const projectName = this.workspaceRoot
      ? path.basename(this.workspaceRoot)
      : UI_TEXT.NO_WORKSPACE;

    const projectStatus = this.isValidProject
      ? UI_TEXT.VALID_PROJECT
      : UI_TEXT.STANDARD_WORKSPACE;

    return `
      <!DOCTYPE html>
      <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              padding: 16px;
              font-family: var(--vscode-font-family);
              color: var(--vscode-foreground);
              background: var(--vscode-editor-background);
            }
            h3 { margin-top: 0; font-size: 14px; }
            p { font-size: 12px; margin: 8px 0; color: var(--vscode-descriptionForeground); }
            button {
              width: 100%;
              padding: 8px 12px;
              margin: 6px 0;
              border: none;
              border-radius: 2px;
              cursor: pointer;
              font-size: 13px;
              background: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
            }
            button:hover {
              background: var(--vscode-button-hoverBackground);
            }
            button:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            .btn-secondary {
              background: var(--vscode-button-secondaryBackground);
              color: var(--vscode-button-secondaryForeground);
            }
            .btn-secondary:hover {
              background: var(--vscode-button-secondaryHoverBackground);
            }
          </style>
        </head>
        <body>
          <h3>TT-Editor</h3>
          <p><strong>Projekt:</strong> ${projectName}</p>
          <p><strong>Status:</strong> ${projectStatus}</p>

          ${!this.workspaceRoot ? `
            <button onclick="openFolder()">${BUTTON_LABELS.OPEN_FOLDER}</button>
          ` : `
            <button onclick="openCanvas()">${BUTTON_LABELS.OPEN_CANVAS}</button>
            <button class="btn-secondary" onclick="generateCode()" ${!this.isValidProject ? 'disabled' : ''}>
              ${BUTTON_LABELS.GENERATE_CODE}
            </button>
          `}

          <script>
            const vscode = acquireVsCodeApi();
            function openCanvas() { vscode.postMessage({ type: 'open-canvas' }); }
            function openFolder() { vscode.postMessage({ type: 'open-folder' }); }
            function generateCode() { vscode.postMessage({ type: 'generate-code' }); }
          </script>
        </body>
      </html>
    `;
  }
}
