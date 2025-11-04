# TT-Editor Low-Code VSCode Extension - Complete Implementation Guide

**WICHTIG: Alle NOTIZEN sind auf DEUTSCH und müssen EXTREM GENAU sein - keine Lücken!**

---

## PROJECT OVERVIEW

### Goal
Build a **lightweight, low-code VSCode extension** that provides a visual drag-and-drop canvas for composing Astro components. The extension allows users to visually build forms and UI without writing code, then generates production-ready Astro files.

### Core Principles (MANDATORY)
1. **ULTRA GRANULAR**: Every function, component, and module must be highly focused and single-purpose
2. **ULTRA GENERIC**: No hardcoded values - everything configurable via constants
3. **LIGHTWEIGHT**: Minimal code, maximum efficiency
4. **MODULAR**: Small, focused functions/components (max 50 lines per function)
5. **CLEAN CODE**: Professional patterns, proper TypeScript types
6. **NO EMOJIS**: Absolutely forbidden in code, UI, or documentation

### Architecture Layers
```
┌─────────────────────────────────────────────────────────────┐
│                    VSCode Extension                          │
│  (TypeScript - Node.js Environment)                         │
│  - extension.ts: Activation, commands, project validation   │
│  - webview.ts: Webview panel management, message handling   │
│  - shared/: Message protocol, config validation, constants  │
└─────────────────────┬───────────────────────────────────────┘
                      │ Message Protocol
                      │ (postMessage)
┌─────────────────────┴───────────────────────────────────────┐
│                    Webview (React)                           │
│  (Browser Environment - Isolated)                           │
│  - Canvas.jsx: Main orchestrator                            │
│  - CanvasArea.jsx: Tree renderer                            │
│  - CardBase.jsx: Generic card component                     │
│  - Toolbar.jsx: Component palette                           │
│  - Hooks: useExtensionBridge, useTreeOperations, useDnD     │
│  - Utils: componentPalette, astroCodeGen, domSerializer     │
└─────────────────────────────────────────────────────────────┘
```

---

## DEUTSCHE NOTIZEN: KRITISCHE ERKENNTNISSE AUS DEM ALTEN PROJEKT

### Problem 1: Canvas lädt nicht nach Refactoring
**Symptom:** Canvas zeigt nur "Lade Canvas..." und React-App startet nicht.

**Root Cause:** Alte `.ttEditor.json` Datei hatte falsches codeGen-Format:
```json
// ALT (Object-Format):
{ "codeGen": { "component": "SimpleInput" } }

// NEU (String-Format):
{ "codeGen": "<SimpleInput id='' label='' />" }
```

**Lösung:** Bei Format-Änderungen IMMER Migration-Script oder alte Configs löschen!

### Problem 2: Emojis schleichen sich ein
**Verboten:** Emojis 

### Problem 3: Hardcoded Values überall
**Falsch:**
```javascript
if (depth >= 5) { ... }
setTimeout(() => { ... }, 2000);
const configPath = '.ttEditor.json';
```

**Richtig:**
```javascript
import { MAX_TREE_DEPTH, AUTOSAVE_DELAY_MS, CONFIG_FILENAME } from '@/shared/constants';
if (depth >= MAX_TREE_DEPTH) { ... }
setTimeout(() => { ... }, AUTOSAVE_DELAY_MS);
const configPath = CONFIG_FILENAME;
```

### Problem 4: Extension lädt nicht nach Compile
**Checklist:**
1. `npm run compile` erfolgreich?
2. `cd src/ui && npm run build` erfolgreich?
3. Extension Development Host neu geladen (F5)?
4. Alte `.ttEditor.json` gelöscht/migriert?
5. Alte Cache-Dateien gelöscht?

### Problem 5: Zu viel Refactoring auf einmal
**Lesson Learned:** Chirurgische Präzision > Perfekte Architektur
- Fix first, refactor later
- Test after EVERY step
- Don't touch what works
- Have a rollback plan

---

## PHASE 1: PROJECT SETUP & STRUCTURE

### 1.1 Initialize Extension Project

**Create directory structure:**
```bash
mkdir ttEditor-extension
cd ttEditor-extension
npm init -y
```

**Install dependencies:**
```json
{
  "name": "tteditor-extension",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.80.0"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/vscode": "^1.80.0",
    "esbuild": "^0.19.0",
    "typescript": "^5.7.0"
  }
}
```

**Create tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "types": ["node", "vscode"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "src/ui"]
}
```

**Create package.json manifest:**
```json
{
  "name": "tteditor-extension",
  "displayName": "TT-Editor Low-Code",
  "description": "Visual canvas for building Astro components",
  "version": "1.0.0",
  "publisher": "your-publisher",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": ["onStartupFinished"],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "ttEditor.openCanvas",
        "title": "Open Canvas",
        "category": "TT-Editor"
      },
      {
        "command": "ttEditor.generateCode",
        "title": "Generate Code",
        "category": "TT-Editor",
        "enablement": "ttEditor.projectValid"
      },
      {
        "command": "ttEditor.openFolder",
        "title": "Open Folder",
        "category": "TT-Editor"
      }
    ],
    "viewsContainers": {
      "activitybar": [
        {
          "id": "ttEditor",
          "title": "TT-Editor",
          "icon": "resources/icon.svg"
        }
      ]
    },
    "views": {
      "ttEditor": [
        {
          "id": "ttEditor.view",
          "name": "TT-Editor"
        }
      ]
    }
  },
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "build:ui": "cd src/ui && npm run build",
    "build:all": "npm run build:ui && npm run compile"
  }
}
```

**NOTIZ (DEUTSCH):** Die `activationEvents: ["onStartupFinished"]` sorgt dafür, dass die Extension automatisch geladen wird. Die Commands sind in `contributes.commands` registriert, und `enablement: "ttEditor.projectValid"` deaktiviert Code-Generierung in nicht-ttEditor-Projekten.

### 1.2 Create Directory Structure

```
ttEditor-extension/
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── webview.ts                # Webview panel management
│   ├── shared/
│   │   ├── constants.ts          # ALL constants (no magic numbers!)
│   │   ├── messageProtocol.ts    # Message type definitions
│   │   └── projectConfig.ts      # Config validation & helpers
│   ├── templates/
│   │   └── defaultAstro.ts       # Default Astro template
│   └── ui/                        # React webview app
│       ├── src/
│       │   ├── main.jsx          # React entry point
│       │   ├── index.css         # Global styles
│       │   ├── components/
│       │   │   ├── Canvas.jsx
│       │   │   ├── CanvasArea.jsx
│       │   │   ├── Toolbar.jsx
│       │   │   └── card/
│       │   │       ├── CardBase.jsx
│       │   │       ├── CardPreview.jsx
│       │   │       ├── CardAttributes.jsx
│       │   │       └── CardDropZone.jsx
│       │   ├── hooks/
│       │   │   ├── useExtensionBridge.js
│       │   │   ├── useTreeOperations.js
│       │   │   └── useDragAndDrop.js
│       │   └── utils/
│       │       ├── componentPalette.jsx
│       │       ├── treeHelpers.js
│       │       ├── domSerializer.js
│       │       └── astroCodeGen.js
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
├── dist/                          # Compiled output
├── package.json
└── tsconfig.json
```

---

## PHASE 2: SHARED MODULE - CONSTANTS

**KRITISCH: Alle Werte müssen hier zentralisiert sein!**

**Create `src/shared/constants.ts`:**

```typescript
// src/shared/constants.ts

// ============================================================================
// TREE CONFIGURATION
// ============================================================================
export const MAX_TREE_DEPTH = 5;         // Maximum nesting depth (0-4 = 5 levels)
export const MAX_NESTING_LEVEL = 4;      // Used in UI validation

// ============================================================================
// DRAG & DROP CONFIGURATION
// ============================================================================
export const DND_ZONE_TOP_PERCENT = 0.25;     // Top 25% = drop BEFORE
export const DND_ZONE_BOTTOM_PERCENT = 0.25;  // Bottom 25% = drop AFTER
                                               // Middle 50% = drop INSIDE (if canBeParent)

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================
export const AUTOSAVE_DELAY_MS = 2000;        // Auto-save after 2 seconds of inactivity
export const WEBVIEW_INIT_DELAY_MS = 100;     // Wait 100ms before sending INIT message

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================
export const ASTRO_DIR = '.astro';                    // Directory that identifies ttEditor projects
export const ASTRO_COMPONENTS_DIR = 'Componenten';    // Subdirectory for Astro components
export const CONFIG_FILENAME = '.ttEditor.json';      // Config file name
export const CONFIG_VERSION = '1.0';                  // Schema version

// ============================================================================
// UI TEXT CONSTANTS (German)
// ============================================================================
export const UI_TEXT = {
  NO_WORKSPACE: 'Kein Workspace',
  VALID_PROJECT: '[OK] ttEditor Projekt',
  STANDARD_WORKSPACE: '[ ] Standard Workspace',
  CANVAS_LOADING: 'Lade Canvas...',
  CANVAS_EMPTY: 'Canvas ist leer',
  CANVAS_EMPTY_HINT: 'Ziehe Komponenten aus der Toolbar hierher',
  NO_COMPONENTS: 'Keine Komponenten gefunden',
  COMPONENT_PALETTE_TITLE: 'Komponenten',
  DELETE_CONFIRM: 'wirklich loeschen?',
  CLEAR_CANVAS_CONFIRM: 'Canvas wirklich leeren? Alle Aenderungen gehen verloren.',
  SAVE_SUCCESS: 'Konfiguration gespeichert',
  SAVE_ERROR: 'Fehler beim Speichern',
  LOAD_ERROR: 'Fehler beim Laden',
  NO_CONFIG_FOUND: 'Keine gespeicherte Konfiguration gefunden',
  INVALID_CONFIG: 'Korrupte Konfigurationsdatei',
  MAX_DEPTH_REACHED: 'Maximale Verschachtelungstiefe erreicht',
  CIRCULAR_DEPENDENCY: 'Parent-Komponente kann nicht in eigenes Child verschoben werden',
  CODE_GEN_NOT_AVAILABLE: 'Code-Generator nur in ttEditor-Projekten verfuegbar',
  OPEN_FOLDER_FIRST: 'Bitte oeffne zuerst einen Ordner/Workspace',
} as const;

// ============================================================================
// COMPONENT ICONS (Text-based, NO EMOJIS!)
// ============================================================================
export const COMPONENT_ICONS = {
  PARENT: '[P]',      // Indicates component can have children
  CHILD: '[C]',       // Indicates leaf component
  DRAG_HANDLE: '::',  // Drag handle icon
  DELETE: 'X',        // Delete button
} as const;

// ============================================================================
// BUTTON LABELS
// ============================================================================
export const BUTTON_LABELS = {
  OPEN_FOLDER: 'Ordner oeffnen',
  OPEN_CANVAS: 'Canvas oeffnen',
  GENERATE_CODE: 'Code generieren',
  SAVE: 'Speichern',
  LOAD: 'Laden',
  CLEAR: 'Canvas leeren',
} as const;
```

**NOTIZ (DEUTSCH):** Diese Datei ist das Herzstück der Konfiguration. ALLE Magic Numbers und Strings müssen hier definiert sein. Die `as const` Assertions sorgen für Type-Safety in TypeScript. Bei jedem neuen Wert: ERST hier definieren, DANN importieren und verwenden!

---

## PHASE 3: SHARED MODULE - MESSAGE PROTOCOL

**Create `src/shared/messageProtocol.ts`:**

```typescript
// src/shared/messageProtocol.ts

import type { CONFIG_VERSION } from './constants';

// ============================================================================
// COMPONENT NODE STRUCTURE
// ============================================================================
export interface ComponentNode {
  id: string;                      // Unique ID (generated via crypto.randomUUID() or genId())
  type: string;                    // Component type (e.g., 'SimpleInput', 'SimpleFieldset')
  props: Record<string, any>;      // Component-specific properties
  children?: ComponentNode[];      // Optional children (only if canBeParent: true)
  codeGen: string;                 // Template string for Astro code generation
}

// ============================================================================
// PROJECT CONFIGURATION
// ============================================================================
export interface ProjectConfig {
  version: typeof CONFIG_VERSION;  // Schema version ('1.0')
  projectName: string;             // Project name (from workspace folder basename)
  lastModified: string;            // ISO 8601 timestamp (new Date().toISOString())
  tree: ComponentNode[];           // Array of root-level components
  metadata: {                      // Extensible metadata
    author?: string;
    description?: string;
    [key: string]: any;
  };
}

// ============================================================================
// MESSAGE TYPES: WEBVIEW → EXTENSION
// ============================================================================
export type CanvasToExtensionMessage =
  | { type: 'READY' }                                    // Webview is initialized
  | { type: 'SAVE'; payload: ProjectConfig }             // Save config to .ttEditor.json
  | { type: 'LOAD_REQUEST' }                             // Request saved config
  | { type: 'GENERATE_CODE'; payload: string };          // Generate index.astro file

// ============================================================================
// MESSAGE TYPES: EXTENSION → WEBVIEW
// ============================================================================
export type ExtensionToCanvasMessage =
  | {
      type: 'INIT';
      payload: {
        projectName: string;
        config: ProjectConfig | null;  // null if no saved config exists
        isValidProject: boolean;       // true if .astro directory exists
      };
    }
  | { type: 'LOAD_RESPONSE'; payload: ProjectConfig }
  | { type: 'SAVE_SUCCESS'; filePath: string }
  | { type: 'ERROR'; message: string };
```

**NOTIZ (DEUTSCH):** Das Message Protocol definiert den Contract zwischen Extension und Webview. WICHTIG: `codeGen` muss ein STRING sein, NICHT ein Object! Das war der Haupt-Bug im alten Projekt. Die `ComponentNode.children` Property ist optional - nur Parent-Komponenten (canBeParent: true) haben diese. Der Tree ist ein ARRAY von Root-Nodes, kein einzelner Root!

---

## PHASE 4: SHARED MODULE - PROJECT CONFIG

**Create `src/shared/projectConfig.ts`:**

```typescript
// src/shared/projectConfig.ts

import { CONFIG_VERSION } from './constants';
import type { ProjectConfig, ComponentNode } from './messageProtocol';

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a ComponentNode structure recursively
 *
 * WICHTIG (DEUTSCH):
 * - Prüft NICHT die Tiefe (das muss separat gemacht werden)
 * - Prüft NICHT auf zirkuläre Referenzen
 * - Props-Inhalte werden NICHT validiert (flexibel für beliebige Komponenten)
 */
export function validateComponentNode(node: any): node is ComponentNode {
  // Basic structure check
  if (!node || typeof node !== 'object') return false;

  // Required fields
  if (!node.id || typeof node.id !== 'string') return false;
  if (!node.type || typeof node.type !== 'string') return false;
  if (!node.props || typeof node.props !== 'object') return false;
  if (!node.codeGen || typeof node.codeGen !== 'string') return false;

  // Children must be array if present
  if (node.children !== undefined && !Array.isArray(node.children)) return false;

  // Recursive validation of children
  if (node.children) {
    return node.children.every(validateComponentNode);
  }

  return true;
}

/**
 * Validates a complete ProjectConfig structure
 *
 * WICHTIG (DEUTSCH):
 * - Wirft bei ungültiger Version eine Warning (für Migration-Logik)
 * - Tree muss ein Array sein (kann leer sein)
 * - Jedes Tree-Element muss ein valides ComponentNode sein
 */
export function validateProjectConfig(config: any): config is ProjectConfig {
  // Null/undefined check
  if (!config || typeof config !== 'object') return false;

  // Version check (log warning for future migration)
  if (config.version !== CONFIG_VERSION) {
    console.warn('ProjectConfig: Unsupported version', config.version);
    return false;
  }

  // Required fields
  if (!config.projectName || typeof config.projectName !== 'string') return false;
  if (!config.lastModified || typeof config.lastModified !== 'string') return false;
  if (!Array.isArray(config.tree)) return false;

  // Validate all tree nodes
  return config.tree.every(validateComponentNode);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates an empty ProjectConfig
 *
 * USAGE: For initializing new projects
 */
export function createEmptyConfig(projectName: string): ProjectConfig {
  return {
    version: CONFIG_VERSION,
    projectName,
    lastModified: new Date().toISOString(),
    tree: [],
    metadata: {},
  };
}

/**
 * Updates the lastModified timestamp
 *
 * WICHTIG (DEUTSCH):
 * - Verwendet Spread-Operator für Immutability
 * - Gibt NEUES Objekt zurück (modifiziert Original nicht)
 * - Achtung: Shallow Copy, nicht Deep Copy!
 */
export function updateTimestamp(config: ProjectConfig): ProjectConfig {
  return {
    ...config,
    lastModified: new Date().toISOString(),
  };
}
```

**NOTIZ (DEUTSCH):** Die Validierungsfunktionen sind KRITISCH für Stabilität. Sie verhindern, dass korrupte Configs die Extension crashen. TypeScript Type Guards (`node is ComponentNode`) ermöglichen Type-Narrowing nach Validierung. WICHTIG: Die Validierung prüft NICHT auf Max-Depth oder zirkuläre Referenzen - das muss in der UI-Logik passieren!

---

## PHASE 5: EXTENSION - ENTRY POINT

**Create `src/extension.ts`:**

```typescript
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
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'ttEditor.view',
      new TTEditorSidebarProvider(context, workspaceRoot, isValidProject)
    )
  );
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
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getSidebarHTML();

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
```

**NOTIZ (DEUTSCH):** Der Extension Entry Point ist der erste Code, der ausgeführt wird. WICHTIG: Die Context-Variable `ttEditor.projectValid` ermöglicht/deaktiviert Commands basierend auf Projekttyp. Die Sidebar zeigt den Projekt-Status und bietet Quick-Actions. ALLE UI-Texte kommen aus `constants.ts` - keine Hardcoded Strings!

---

## PHASE 6: EXTENSION - WEBVIEW MANAGEMENT

**Create `src/webview.ts`:**

```typescript
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
    () => (canvasPanel = undefined),
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
  let html = fs.readFileSync(path.join(distPath, 'index.html'), 'utf-8');

  // Transform asset URIs
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(distPath, 'assets', 'index.js'))
  );
  const styleUri = webview.asWebviewUri(
    vscode.Uri.file(path.join(distPath, 'assets', 'index.css'))
  );

  // Replace paths and inject CSP + vscodeApi
  return html
    .replace('./assets/index.js', scriptUri.toString())
    .replace('./assets/index.css', styleUri.toString())
    .replace(
      '<head>',
      `<head>
        <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' ${webview.cspSource}; style-src 'unsafe-inline' ${webview.cspSource}; img-src ${webview.cspSource} https:; font-src ${webview.cspSource};">
        <script>window.vscodeApi = acquireVsCodeApi();</script>`
    );
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

    // Write file
    const configPath = path.join(workspaceRoot, CONFIG_FILENAME);
    fs.writeFileSync(
      configPath,
      JSON.stringify(updateTimestamp(config), null, 2),
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
    console.error('TT-Editor: Save failed', err);
    panel.webview.postMessage({
      type: 'ERROR',
      message: `Fehler beim Speichern: ${err}`,
    } as ExtensionToCanvasMessage);
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Speichern - ${err}`);
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
  } catch (err) {
    console.error('TT-Editor: Load failed', err);
    panel.webview.postMessage({
      type: 'ERROR',
      message: `Fehler beim Laden: ${err}`,
    } as ExtensionToCanvasMessage);
    vscode.window.showErrorMessage(`TT-Editor: Fehler beim Laden - ${err}`);
  }
}

/**
 * Handles GENERATE_CODE message
 *
 * STEPS (DEUTSCH):
 * 1. Empfange generierten Astro-Code vom Webview
 * 2. Schreibe in index.astro Datei
 * 3. Zeige Success-Message
 */
async function handleGenerateCode(
  astroCode: string,
  workspaceRoot: string
): Promise<void> {
  try {
    fs.writeFileSync(path.join(workspaceRoot, 'index.astro'), astroCode, 'utf-8');
    vscode.window.showInformationMessage('Astro Code generiert!');
  } catch (err) {
    console.error('TT-Editor: Code generation failed', err);
    vscode.window.showErrorMessage(`Code-Generierung fehlgeschlagen: ${err}`);
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
    return null;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    if (!validateProjectConfig(config)) {
      throw new Error('Invalid configuration format');
    }
    return config;
  } catch (err) {
    throw new Error(`Korrupte Konfigurationsdatei: ${err}`);
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
    panel.webview.postMessage({
      type: 'INIT',
      payload: {
        projectName,
        config: loadConfig(workspaceRoot),
        isValidProject,
      },
    } as ExtensionToCanvasMessage);
  }, WEBVIEW_INIT_DELAY_MS);
}
```

**NOTIZ (DEUTSCH):** Das Webview-Management ist das Herzstück der Extension. KRITISCH: Die `asWebviewUri()` Transformation ist notwendig für Security - ohne diese können Assets nicht geladen werden. Die `retainContextWhenHidden: true` Option verhindert, dass State verloren geht beim Tab-Wechsel. WICHTIG: `window.vscodeApi = acquireVsCodeApi()` MUSS im <head> injiziert werden, BEVOR React lädt, da `acquireVsCodeApi()` nur einmal aufgerufen werden kann!

---

## PHASE 7: REACT UI - SETUP

### 7.1 Initialize React Project

**Create `src/ui/package.json`:**

```json
{
  "name": "tteditor-canvas",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.8",
    "@types/react-dom": "^19.0.3",
    "@vitejs/plugin-react": "^4.3.4",
    "terser": "^5.44.0",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

**Create `src/ui/vite.config.js`:**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // CRITICAL for VSCode webview!
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Fixed names (no hashes) for easier HTML injection
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        manualChunks: undefined,  // Single bundle
      },
    },
  },
  esbuild: {
    drop: ['debugger'],
  },
});
```

**NOTIZ (DEUTSCH):** KRITISCH: `base: './'` ist ZWINGEND erforderlich für VSCode Webviews! Ohne diese Einstellung werden Assets mit absoluten Pfaden geladen (`/assets/...`), die VSCode nicht auflösen kann. Die festen Asset-Namen (ohne Hashes) vereinfachen die HTML-Injection in `webview.ts`. `manualChunks: undefined` deaktiviert Code-Splitting → eine einzige `index.js` Datei.

### 7.2 Create Entry Point

**Create `src/ui/index.html`:**

```html
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ttEditor-LC Canvas</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Create `src/ui/src/main.jsx`:**

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import './index.css';

// VS Code API is already injected by the host HTML
// Don't call acquireVsCodeApi() again - it can only be called once
console.log('React app starting, vscodeApi available:', !!window.vscodeApi);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Canvas />
  </React.StrictMode>
);
```

**NOTIZ (DEUTSCH):** WICHTIG: `acquireVsCodeApi()` wird NICHT hier aufgerufen! Das passiert bereits in `webview.ts` beim HTML-Injection. Hier greifen wir nur auf `window.vscodeApi` zu. Die Extension ist eine Single-Page-App ohne Router - die Canvas-Komponente ist direkt das Root-Element.

### 7.3 Global Styles

**Create `src/ui/src/index.css`:**

```css
/* src/ui/src/index.css */

/* ============================================================================
   CSS CUSTOM PROPERTIES (Design Tokens)
   ============================================================================ */
:root {
  /* Colors */
  --color-primary: #4a90e2;
  --color-primary-dark: #357abd;
  --color-danger: #e74c3c;
  --color-danger-dark: #c0392b;
  --color-success: #27ae60;
  --color-text: #333;
  --color-text-light: #666;
  --color-text-muted: #999;
  --color-border: #ddd;
  --color-border-light: #eee;
  --color-bg: #fff;
  --color-bg-light: #f5f5f5;
  --color-bg-dark: #f9f9f9;

  /* Spacing */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 24px;

  /* Border Radius */
  --radius-sm: 3px;
  --radius-md: 6px;
  --radius-lg: 8px;

  /* Typography */
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.2);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
  --transition-slow: 0.3s ease;
}

/* ============================================================================
   RESET & BASE STYLES
   ============================================================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  overflow: hidden; /* Wichtig für Canvas-Layout */
}

/* ============================================================================
   CUSTOM SCROLLBAR
   ============================================================================ */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-light);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}

/* ============================================================================
   UTILITY CLASSES
   ============================================================================ */
.d-none {
  display: none !important;
}

.text-center {
  text-align: center;
}
```

**NOTIZ (DEUTSCH):** Design Tokens in CSS Custom Properties ermöglichen einfaches Theming. Alle Komponenten verwenden diese Variablen statt hardcodierter Werte. Der `overflow: hidden` auf body verhindert Scrolling - nur der Canvas-Bereich scrollt intern. Custom Scrollbar-Styles für bessere UX.

---

## PHASE 8: REACT UI - COMPONENT PALETTE

**This is THE MOST CRITICAL file - defines all available components!**

**Create `src/ui/src/utils/componentPalette.jsx`:**

```jsx
// src/ui/src/utils/componentPalette.jsx

/**
 * COMPONENT PALETTE
 *
 * KRITISCH (DEUTSCH):
 * - Definiert ALLE verfügbaren Canvas-Komponenten
 * - Jede Component hat: type, label, canBeParent, defaultProps, codeGen, Component
 * - codeGen MUSS String sein (nicht Object!)
 * - Component ist React-Komponente für Canvas-Preview
 * - canBeParent bestimmt ob Children erlaubt sind
 *
 * STRUKTUR:
 * {
 *   type: string,              // Muss mit Astro-Komponente übereinstimmen
 *   label: string,             // Display-Name in Toolbar
 *   canBeParent: boolean,      // Kann Children haben?
 *   defaultProps: object,      // Initiale Prop-Werte
 *   codeGen: string,           // Template für Astro-Code
 *   Component: Function        // React-Komponente für Preview
 * }
 */

export const COMPONENT_PALETTE = [
  // ==========================================================================
  // INPUT COMPONENTS (LEAFS - NO CHILDREN)
  // ==========================================================================

  {
    type: 'SimpleInput',
    label: 'SimpleInput',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      type: 'text',
      klasse: '',
      value: '',
      required: false,
      hidden: false,
      maxlength: '',
      disabled: false,
      submitTo: '',
      validate: '',
    },
    codeGen: '<SimpleInput id="" label="" type="text" />',
    Component: ({ id, label, type, value, required, hidden, maxlength, disabled, klasse }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SimpleInput'}</label>
        <input
          id={id}
          type={type}
          className={klasse}
          defaultValue={value}
          required={required}
          maxLength={maxlength}
          disabled={disabled}
        />
      </div>
    ),
  },

  {
    type: 'SimpleTextfield',
    label: 'SimpleTextfield',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      row: '3',
      col: '50',
      value: '',
      required: false,
      maxlength: '',
      submitTo: '',
      klasse: '',
      hidden: false,
    },
    codeGen: '<SimpleTextfield id="" label="" row="3" col="50" />',
    Component: ({ id, label, row, col, value, required, maxlength, klasse, hidden }) => (
      <>
        <div className={hidden ? 'd-none' : ''}>
          <label htmlFor={id}>{label || 'SimpleTextfield'}</label>
        </div>
        <textarea
          className={klasse}
          id={id}
          rows={row}
          cols={col}
          defaultValue={value}
          required={required}
          maxLength={maxlength}
        />
      </>
    ),
  },

  {
    type: 'SimpleSelect',
    label: 'SimpleSelect',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      name: '',
      klasse: '',
      hidden: false,
      required: false,
      submitTo: '',
    },
    codeGen: '<SimpleSelect id="" label="" />',
    Component: ({ id, label, klasse, hidden, required }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SimpleSelect'}</label>
        <select id={id} className={klasse} required={required}>
          <option value="">-- Bitte waehlen --</option>
        </select>
      </div>
    ),
  },

  {
    type: 'RadioButton',
    label: 'RadioButton',
    canBeParent: false,
    defaultProps: {
      id: '',
      name: '',
      value: '',
      label: '',
      required: false,
      submitTo: '',
      hidden: false,
    },
    codeGen: '<RadioButton id="" name="" value="" label="" />',
    Component: ({ id, name, value, label, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label>
          <input type="radio" id={id} name={name} value={value} />
          {label || 'RadioButton'}
        </label>
      </div>
    ),
  },

  {
    type: 'SuggestionInput',
    label: 'SuggestionInput',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      hidden: false,
      klasse: '',
    },
    codeGen: '<SuggestionInput id="" label="" />',
    Component: ({ id, label, hidden, klasse }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SuggestionInput'}</label>
        <input type="text" id={id} list={`${id}List`} className={klasse} />
        <datalist id={`${id}List`}>
          <option value="Option 1" />
          <option value="Option 2" />
        </datalist>
      </div>
    ),
  },

  {
    type: 'GatekeeperSelect',
    label: 'GatekeeperSelect',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      hidden: false,
    },
    codeGen: '<GatekeeperSelect id="" label="" />',
    Component: ({ id, label, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'GatekeeperSelect'}</label>
        <select id={id}>
          <option value="">-- Bitte waehlen --</option>
        </select>
      </div>
    ),
  },

  {
    type: 'SQLinjectionSelect',
    label: 'SQLinjectionSelect',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      hidden: false,
    },
    codeGen: '<SQLinjectionSelect id="" label="" />',
    Component: ({ id, label, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SQLinjectionSelect'}</label>
        <select id={id}>
          <option value="">-- Bitte waehlen --</option>
        </select>
      </div>
    ),
  },

  // ==========================================================================
  // CONTAINER COMPONENTS (PARENTS - CAN HAVE CHILDREN)
  // ==========================================================================

  {
    type: 'SimpleFieldset',
    label: 'SimpleFieldset',
    canBeParent: true,  // KANN CHILDREN HABEN!
    defaultProps: {
      legend: '',
      id: '',
      klasse: '',
      hidden: false,
    },
    codeGen: '<SimpleFieldset legend="" id="" />',
    Component: ({ legend, id, klasse, hidden }) => (
      <fieldset id={id} className={klasse} style={{ display: hidden ? 'none' : 'block' }}>
        <legend>{legend || 'SimpleFieldset'}</legend>
        <div>[Children werden hier angezeigt]</div>
      </fieldset>
    ),
  },

  {
    type: 'ConBlock',
    label: 'ConBlock',
    canBeParent: true,
    defaultProps: {
      id: '',
      If: '',
      klasse: '',
      hidden: false,
    },
    codeGen: '<ConBlock id="" If="" />',
    Component: ({ id, klasse, hidden }) => (
      <div id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', border: '2px dashed #ccc', padding: '8px' }}>
        ConBlock [Conditional Container]
        <div>[Children werden hier angezeigt]</div>
      </div>
    ),
  },

  {
    type: 'Gate',
    label: 'Gate',
    canBeParent: true,
    defaultProps: {
      id: '',
      klasse: '',
      hidden: false,
    },
    codeGen: '<Gate id="" />',
    Component: ({ id, klasse, hidden }) => (
      <div id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', border: '2px solid #4a90e2', padding: '8px' }}>
        Gate [Container]
        <div>[Children werden hier angezeigt]</div>
      </div>
    ),
  },

  {
    type: 'GateGroup',
    label: 'GateGroup',
    canBeParent: true,
    defaultProps: {
      id: '',
      klasse: '',
      hidden: false,
    },
    codeGen: '<GateGroup id="" />',
    Component: ({ id, klasse, hidden }) => (
      <div id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', border: '2px solid #27ae60', padding: '8px' }}>
        GateGroup [Container]
        <div>[Children werden hier angezeigt]</div>
      </div>
    ),
  },

  {
    type: 'TabWrapper',
    label: 'TabWrapper',
    canBeParent: true,
    defaultProps: {
      id: '',
      hidden: false,
    },
    codeGen: '<TabWrapper id="" />',
    Component: ({ id, hidden }) => (
      <form id={id} style={{ display: hidden ? 'none' : 'block', border: '2px solid #e74c3c', padding: '8px' }}>
        TabWrapper [Form Container]
        <div>[Children werden hier angezeigt]</div>
      </form>
    ),
  },

  {
    type: 'TabPage',
    label: 'TabPage',
    canBeParent: true,
    defaultProps: {
      id: '',
      title: '',
      hidden: false,
    },
    codeGen: '<TabPage id="" title="" />',
    Component: ({ id, title, hidden }) => (
      <section id={id} style={{ display: hidden ? 'none' : 'block', border: '2px dashed #9b59b6', padding: '8px' }}>
        TabPage: {title || 'Untitled'}
        <div>[Children werden hier angezeigt]</div>
      </section>
    ),
  },

  // ==========================================================================
  // BUTTON COMPONENTS
  // ==========================================================================

  {
    type: 'WeiterButton',
    label: 'WeiterButton',
    canBeParent: false,
    defaultProps: {
      id: 'weiterBtn',
      label: 'Weiter',
      hidden: false,
    },
    codeGen: '<WeiterButton />',
    Component: ({ label, hidden }) => (
      <button type="button" style={{ display: hidden ? 'none' : 'inline-block' }}>
        {label || 'Weiter'}
      </button>
    ),
  },

  {
    type: 'FinishButton',
    label: 'FinishButton',
    canBeParent: false,
    defaultProps: {
      id: 'finishBtn',
      label: 'Abschliessen',
      hidden: false,
    },
    codeGen: '<FinishButton />',
    Component: ({ label, hidden }) => (
      <button type="button" style={{ display: hidden ? 'none' : 'inline-block' }}>
        {label || 'Abschliessen'}
      </button>
    ),
  },

  {
    type: 'RecordButton',
    label: 'RecordButton',
    canBeParent: false,
    defaultProps: {
      id: 'recordBtn',
      label: 'Aufzeichnen',
      hidden: false,
    },
    codeGen: '<RecordButton />',
    Component: ({ label, hidden }) => (
      <button type="button" style={{ display: hidden ? 'none' : 'inline-block', background: '#e74c3c', color: '#fff' }}>
        {label || 'Aufzeichnen'}
      </button>
    ),
  },

  // ==========================================================================
  // DISPLAY COMPONENTS
  // ==========================================================================

  {
    type: 'Bild',
    label: 'Bild',
    canBeParent: false,
    defaultProps: {
      dateiname: '',
    },
    codeGen: '<Bild dateiname="" />',
    Component: ({ dateiname }) => (
      <div style={{ border: '1px dashed #ccc', padding: '8px', textAlign: 'center' }}>
        [Bild: {dateiname || 'kein-bild.png'}]
      </div>
    ),
  },

  {
    type: 'NavTabs',
    label: 'NavTabs',
    canBeParent: false,
    defaultProps: {
      id: 'navigation',
      tabs: '',
    },
    codeGen: '<NavTabs />',
    Component: () => (
      <div style={{ border: '1px solid #4a90e2', padding: '8px' }}>
        [NavTabs: Tab-Navigation]
      </div>
    ),
  },

  {
    type: 'CustomerCells',
    label: 'CustomerCells',
    canBeParent: false,
    defaultProps: {
      id: 'customerCells',
      data: '',
    },
    codeGen: '<CustomerCells />',
    Component: () => (
      <div style={{ border: '1px solid #27ae60', padding: '8px' }}>
        [CustomerCells: Kunden-Informationen]
      </div>
    ),
  },

  {
    type: 'DebugLog',
    label: 'DebugLog',
    canBeParent: false,
    defaultProps: {
      id: 'debugLog',
      hidden: false,
    },
    codeGen: '<DebugLog />',
    Component: ({ hidden }) => (
      <div style={{ display: hidden ? 'none' : 'block', border: '1px solid #999', padding: '8px', fontFamily: 'monospace' }}>
        [DebugLog: Debug-Ausgabe]
      </div>
    ),
  },

  {
    type: 'FootButtons',
    label: 'FootButtons',
    canBeParent: false,
    defaultProps: {
      id: 'footer',
    },
    codeGen: '<FootButtons />',
    Component: () => (
      <div style={{ border: '1px solid #333', padding: '8px', background: '#f5f5f5' }}>
        [FootButtons: Footer-Buttons]
      </div>
    ),
  },

  {
    type: 'Popups',
    label: 'Popups',
    canBeParent: false,
    defaultProps: {
      id: 'popups',
    },
    codeGen: '<Popups />',
    Component: () => (
      <div style={{ border: '1px dashed #e74c3c', padding: '8px' }}>
        [Popups: Modal-Dialoge]
      </div>
    ),
  },
];
```

**NOTIZ (DEUTSCH):** Diese Datei ist KRITISCH! JEDE verfügbare Komponente muss hier definiert sein. Das `codeGen` Property ist ein STRING-Template (nicht Object!). Die React-`Component` ist nur für die Canvas-Preview - sie muss NICHT 100% identisch mit der echten Astro-Komponente sein. `canBeParent: true` erlaubt Children - diese Komponenten erhalten einen Drop-Zone-Bereich im Canvas.

---

**(This is page 1 of the comprehensive guide. Continue to next section for React components implementation...)**

---

## PHASE 9: REACT UI - UTILITY FUNCTIONS

### 9.1 Tree Helpers

**Create `src/ui/src/utils/treeHelpers.js`:**

```javascript
// src/ui/src/utils/treeHelpers.js

/**
 * Generates unique node IDs
 *
 * FORMAT (DEUTSCH):
 * - Prefix: 'node_'
 * - Random string (base36) + Timestamp (base36)
 * - Beispiel: 'node_k7j2x3z1abc'
 */
export function genId() {
  return 'node_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/**
 * Finds a node and its parent in the tree
 *
 * RETURN (DEUTSCH):
 * - { node, parent, index } wenn gefunden
 * - null wenn nicht gefunden
 * - parent ist null für Root-Level-Nodes
 * - index ist die Position im Parent's children Array
 */
export function findNodeAndParent(tree, id, parent = null) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      return { node, parent, index: i };
    }
    if (node.children) {
      const found = findNodeAndParent(node.children, id, node);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Finds a single node (without parent info)
 *
 * USAGE (DEUTSCH): Schnellere Alternative wenn Parent nicht benötigt
 */
export function findNode(tree, id) {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Checks if childId is a descendant of ancestorId
 *
 * PURPOSE (DEUTSCH):
 * - Verhindert zirkuläre Abhängigkeiten beim Drag & Drop
 * - Beispiel: Parent kann nicht in eigenes Child verschoben werden
 */
export function isDescendant(tree, childId, ancestorId) {
  const found = findNodeAndParent(tree, ancestorId);
  if (!found) return false;

  const stack = [...(found.node.children || [])];
  while (stack.length) {
    const n = stack.pop();
    if (n.id === childId) return true;
    if (n.children?.length) stack.push(...n.children);
  }
  return false;
}

/**
 * Calculates the depth of a node in the tree
 *
 * RETURN (DEUTSCH):
 * - 0 für Root-Level
 * - 1 für erste Ebene Children
 * - -1 wenn Node nicht gefunden
 */
export function getDepth(tree, nodeId, currentDepth = 0) {
  for (const node of tree) {
    if (node.id === nodeId) return currentDepth;
    if (node.children?.length) {
      const depth = getDepth(node.children, nodeId, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
}

/**
 * Checks if adding a child would exceed max depth
 *
 * USAGE (DEUTSCH):
 * - Wird vor Drop-Operation aufgerufen
 * - maxDepth = 5 bedeutet: 0, 1, 2, 3, 4 (5 Ebenen)
 */
export function exceedsMaxDepth(tree, nodeId, maxDepth = 5) {
  return getDepth(tree, nodeId) >= maxDepth;
}

/**
 * Deep clones an object via JSON
 *
 * LIMITATION (DEUTSCH):
 * - Verliert Functions, Dates, undefined, Symbols
 * - Ausreichend für reine Daten-Strukturen (ComponentNode)
 */
export function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates a new node from palette entry
 *
 * WICHTIG (DEUTSCH):
 * - Generiert neue ID
 * - Kopiert defaultProps (nicht direkt referenzieren!)
 * - Initialisiert children nur wenn canBeParent
 */
export function createNode(type, paletteMap) {
  const entry = paletteMap.get(type);
  if (!entry) {
    console.error('createNode: Unknown type', type);
    return null;
  }

  return {
    id: genId(),
    type: entry.type,
    props: { ...entry.defaultProps }, // Shallow copy is sufficient
    children: entry.canBeParent ? [] : undefined,
    codeGen: entry.codeGen,
  };
}

/**
 * Removes a node from the tree
 *
 * RETURN (DEUTSCH):
 * - Die entfernte Node (oder null)
 * - Tree wird IN-PLACE modifiziert (mutiert!)
 */
export function removeNode(tree, id) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      const [removed] = tree.splice(i, 1);
      return removed;
    }
    if (node.children) {
      const removedChild = removeNode(node.children, id);
      if (removedChild) return removedChild;
    }
  }
  return null;
}

/**
 * Inserts a node as sibling (before/after target)
 *
 * ZONES (DEUTSCH):
 * - 'above': Insert BEFORE target
 * - 'below': Insert AFTER target
 */
export function insertSibling(tree, found, newNode, zone) {
  const { parent, index } = found;
  const siblings = parent ? parent.children : tree;
  const insertIndex = zone === 'above' ? index : index + 1;
  siblings.splice(insertIndex, 0, newNode);
}

/**
 * Inserts a node as child (inside target)
 *
 * WICHTIG (DEUTSCH):
 * - Nur aufrufen wenn target.children !== undefined!
 * - Fügt am Ende der Children-Liste ein
 */
export function insertChild(target, newNode) {
  if (!target.children) {
    console.error('insertChild: Target has no children array');
    return;
  }
  target.children.push(newNode);
}
```

**NOTIZ (DEUTSCH):** Diese Utility-Funktionen sind das Rückgrat der Tree-Manipulation. WICHTIG: `removeNode`, `insertSibling`, `insertChild` mutieren den Tree IN-PLACE - deshalb müssen wir vorher mit `cloneDeep` einen Clone erstellen! Die `isDescendant` Funktion verhindert zirkuläre Referenzen beim Drag & Drop.

### 9.2 DOM Serializer

**Create `src/ui/src/utils/domSerializer.js`:**

```javascript
// src/ui/src/utils/domSerializer.js

/**
 * Extracts all input values from a DOM element
 *
 * PURPOSE (DEUTSCH):
 * - React State enthält nur defaultProps
 * - User kann Werte in Inputs ändern
 * - Diese Funktion extrahiert aktuelle DOM-Werte
 *
 * SUPPORTED INPUT TYPES:
 * - <input type="text|number|email|..."> → string
 * - <input type="checkbox"> → boolean
 * - <input type="radio"> → string (only if checked)
 * - <select> → string or string[] (if multiple)
 * - <textarea> → string
 */
export function extractInputsFromElement(el) {
  const inputs = el.querySelectorAll('input, select, textarea');
  const data = {};

  inputs.forEach((inp) => {
    // Explicitly ignore certain inputs
    if (inp.id === 'preview') return;
    if (inp.disabled) return;

    let key = inp.name || inp.id;
    if (!key) return;

    if (inp instanceof HTMLInputElement) {
      if (inp.type === 'checkbox') {
        data[key] = inp.checked;
      } else if (inp.type === 'radio') {
        if (inp.checked) data[key] = inp.value;
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLSelectElement) {
      if (inp.multiple) {
        data[key] = Array.from(inp.selectedOptions).map((o) => o.value);
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLTextAreaElement) {
      data[key] = inp.value;
    }
  });

  return data;
}

/**
 * Serializes the tree with DOM input values
 *
 * FLOW (DEUTSCH):
 * 1. Traversiere Tree rekursiv
 * 2. Für jede Node: Finde DOM-Element via data-node-id
 * 3. Extrahiere Input-Werte aus DOM-Element
 * 4. Merge Props mit Input-Werten (Inputs überschreiben!)
 * 5. Rekursiv für alle Children
 *
 * RETURN: Neuer Tree mit aktualisierten Props
 */
export function serializeTree(tree, rootElement) {
  if (!rootElement) return tree;

  function visitNode(node) {
    // Find corresponding DOM element
    const wrapperEl = rootElement.querySelector(`[data-node-id="${node.id}"]`);

    // Extract codeGen (always string now)
    const codeGen = wrapperEl?.getAttribute('data-codegen') || node.codeGen;

    // Extract input values
    const inputs = wrapperEl ? extractInputsFromElement(wrapperEl) : {};

    // Merge props with inputs (inputs override!)
    const props = { ...node.props, ...inputs };

    return {
      id: node.id,
      type: node.type,
      props,
      children: (node.children || []).map(visitNode),
      codeGen,
    };
  }

  return tree.map(visitNode);
}

/**
 * Deserializes JSON back to tree state
 *
 * PURPOSE (DEUTSCH):
 * - Wird beim Laden von .ttEditor.json verwendet
 * - Rekonstruiert Tree aus gespeichertem JSON
 * - Fügt fehlende codeGen aus Palette hinzu (Fallback)
 */
export function deserializeTree(jsonTree, paletteMap) {
  function visitNode(jsonNode) {
    const meta = paletteMap.get(jsonNode.type);

    return {
      id: jsonNode.id,
      type: jsonNode.type,
      props: jsonNode.props || {},
      children: (jsonNode.children || []).map(visitNode),
      codeGen: jsonNode.codeGen || meta?.codeGen || `<${jsonNode.type} />`,
    };
  }

  return jsonTree.map(visitNode);
}
```

**NOTIZ (DEUTSCH):** Der DOM Serializer ist KRITISCH für das Speichern. Ohne ihn würden User-Eingaben in Inputs verloren gehen, da React State nur die initialen Props hat. Die Funktion merged die Props mit den aktuellen DOM-Werten vor dem Speichern. WICHTIG: Inputs überschreiben Props (Spread-Operator-Reihenfolge: `{ ...node.props, ...inputs }`).

### 9.3 Astro Code Generator

**Create `src/ui/src/utils/astroCodeGen.js`:**

```javascript
// src/ui/src/utils/astroCodeGen.js

/**
 * Renders a single node to Astro code
 *
 * FEATURES (DEUTSCH):
 * - Formatiert Props (filtert empty/false/null/undefined)
 * - Boolean Props ohne Wert (required statt required="true")
 * - Rekursive Children mit Einrückung
 * - Self-closing wenn keine Children
 *
 * EXAMPLE:
 * Input:  { type: 'SimpleInput', props: { id: 'email', required: true, hidden: false } }
 * Output: <SimpleInput id="email" required />
 */
export function renderAstro(node, depth = 0) {
  const indent = '  '.repeat(depth);

  // Format props (filter falsy values)
  const props = Object.entries(node.props || {})
    .filter(([k, v]) => v !== '' && v !== false && v !== null && v !== undefined)
    .map(([k, v]) => {
      if (typeof v === 'boolean') return k; // Boolean without value
      return `${k}="${v}"`;
    })
    .join(' ');

  // Recursive children
  const children = (node.children || []).map((c) => renderAstro(c, depth + 1)).join('\n');

  // Self-closing or with children
  if (children) {
    return `${indent}<${node.type}${props ? ' ' + props : ''}>\n${children}\n${indent}</${node.type}>`;
  }

  return `${indent}<${node.type}${props ? ' ' + props : ''} />`;
}

/**
 * Generates complete Astro file from tree
 *
 * STRUCTURE (DEUTSCH):
 * - Frontmatter (---)
 * - HTML Boilerplate
 * - Body mit generierten Komponenten (depth = 1)
 *
 * LIMITATION (DEUTSCH):
 * - Keine Import-Statements (müssen manuell hinzugefügt werden)
 * - Kein Layout-System (muss manuell integriert werden)
 * - Minimales Template für Prototyping
 */
export function generateAstroFile(tree, projectName) {
  const components = tree.map((node) => renderAstro(node, 1)).join('\n');

  return `---
// ${projectName} - Generated by ttEditor
---

<html>
  <head>
    <title>${projectName}</title>
  </head>
  <body>
${components}
  </body>
</html>
`;
}
```

**NOTIZ (DEUTSCH):** Der Astro Code Generator ist simpel gehalten. LIMITATION: Es werden KEINE Import-Statements generiert - die müssen manuell hinzugefügt werden oder durch ein erweitertes Template-System. Die Props-Filterung entfernt `false`, `''`, `null`, `undefined` - das ist gewollt, damit der generierte Code sauber ist.

---

## PHASE 10: REACT UI - CUSTOM HOOKS

### 10.1 Extension Bridge Hook

**Create `src/ui/src/hooks/useExtensionBridge.js`:**

```javascript
// src/ui/src/hooks/useExtensionBridge.js

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for communication with VSCode Extension
 *
 * RESPONSIBILITIES (DEUTSCH):
 * - Empfängt Messages vom Extension Host
 * - Sendet Messages an Extension Host
 * - State-Management für Config und Projekt-Info
 *
 * MESSAGE FLOW:
 * UI → Extension: postMessage via window.vscodeApi
 * Extension → UI: window.addEventListener('message')
 */
export function useExtensionBridge() {
  const [config, setConfig] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isValidProject, setIsValidProject] = useState(false);

  // Message handler
  useEffect(() => {
    const handler = (event) => {
      const msg = event.data;

      switch (msg.type) {
        case 'INIT':
          setProjectName(msg.payload.projectName);
          setIsValidProject(msg.payload.isValidProject || false);
          if (msg.payload.config) setConfig(msg.payload.config);
          setIsReady(true);
          console.log('Extension bridge: INIT received', msg.payload);
          break;

        case 'LOAD_RESPONSE':
          setConfig(msg.payload);
          console.log('Extension bridge: Config loaded');
          break;

        case 'SAVE_SUCCESS':
          console.log('Extension bridge: Save successful', msg.filePath);
          break;

        case 'ERROR':
          console.error('Extension bridge: Error', msg.message);
          alert(`Fehler: ${msg.message}`);
          break;

        default:
          console.warn('Extension bridge: Unknown message type', msg.type);
      }
    };

    window.addEventListener('message', handler);

    // Send initial READY signal
    if (window.vscodeApi) {
      window.vscodeApi.postMessage({ type: 'READY' });
      console.log('Extension bridge: READY signal sent');
    } else {
      console.error('Extension bridge: vscodeApi not available!');
    }

    return () => window.removeEventListener('message', handler);
  }, []);

  // Save to extension
  const saveToExtension = useCallback(
    (tree) => {
      if (!window.vscodeApi) {
        console.error('Extension bridge: vscodeApi not available!');
        return;
      }

      window.vscodeApi.postMessage({
        type: 'SAVE',
        payload: {
          version: '1.0',
          projectName,
          lastModified: new Date().toISOString(),
          tree,
          metadata: {},
        },
      });
      console.log('Extension bridge: SAVE message sent');
    },
    [projectName]
  );

  // Load from extension
  const loadFromExtension = useCallback(() => {
    if (!window.vscodeApi) {
      console.error('Extension bridge: vscodeApi not available!');
      return;
    }

    window.vscodeApi.postMessage({ type: 'LOAD_REQUEST' });
    console.log('Extension bridge: LOAD_REQUEST sent');
  }, []);

  return {
    config,
    projectName,
    isReady,
    isValidProject,
    saveToExtension,
    loadFromExtension,
  };
}
```

**NOTIZ (DEUTSCH):** Dieser Hook ist die Brücke zwischen React und VSCode Extension. WICHTIG: `window.vscodeApi` wird vom Extension Host injiziert - es muss existieren! Der `READY` Signal wird sofort nach Mount gesendet, damit die Extension weiß, dass das Webview bereit ist. Das `isReady` Flag verhindert, dass Auto-Save vor Initialisierung triggert.

### 10.2 Tree Operations Hook

**Create `src/ui/src/hooks/useTreeOperations.js`:**

```javascript
// src/ui/src/hooks/useTreeOperations.js

import { useCallback } from 'react';
import { removeNode, cloneDeep } from '../utils/treeHelpers';
import { serializeTree } from '../utils/domSerializer';

/**
 * Hook for CRUD operations on the tree
 *
 * RESPONSIBILITIES (DEUTSCH):
 * - Delete: Entfernt Node aus Tree
 * - Clear: Leert kompletten Canvas
 * - Serialize: Serialisiert Tree mit DOM-Werten
 * - UpdateProps: Aktualisiert Props einer Node
 *
 * IMMUTABILITY PATTERN:
 * - Immer cloneDeep() vor Mutation
 * - Gibt neuen Tree zurück (modifiziert Original nicht)
 */
export function useTreeOperations(tree, setTree, formRef, paletteMap) {
  // Delete node
  const handleDelete = useCallback(
    (nodeId) => {
      const nextTree = cloneDeep(tree);
      removeNode(nextTree, nodeId);
      setTree(nextTree);
      console.log('Tree operations: Node deleted', nodeId);
    },
    [tree, setTree]
  );

  // Add node at root level
  const addNodeAtRoot = useCallback(
    (type) => {
      const entry = paletteMap.get(type);
      if (!entry) {
        console.error('Tree operations: Unknown type', type);
        return;
      }

      const node = {
        id: 'node_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
        type: entry.type,
        props: { ...entry.defaultProps },
        children: entry.canBeParent ? [] : undefined,
        codeGen: entry.codeGen,
      };

      setTree((prev) => [...prev, node]);
      console.log('Tree operations: Node added at root', node);
    },
    [setTree, paletteMap]
  );

  // Clear entire canvas
  const clearCanvas = useCallback(() => {
    setTree([]);
    console.log('Tree operations: Canvas cleared');
  }, [setTree]);

  // Serialize canvas (with DOM input values)
  const serializeCanvas = useCallback(() => {
    const root = formRef.current;
    if (!root) {
      console.warn('Tree operations: formRef not available, returning tree as-is');
      return tree;
    }
    const serialized = serializeTree(tree, root);
    console.log('Tree operations: Canvas serialized');
    return serialized;
  }, [tree, formRef]);

  // Update node props
  const updateNodeProps = useCallback(
    (nodeId, newProps) => {
      setTree((prevTree) => {
        const nextTree = cloneDeep(prevTree);

        function updateNode(nodes) {
          for (const node of nodes) {
            if (node.id === nodeId) {
              node.props = { ...node.props, ...newProps }; // Merge
              return true;
            }
            if (node.children?.length && updateNode(node.children)) {
              return true;
            }
          }
          return false;
        }

        updateNode(nextTree);
        console.log('Tree operations: Props updated for node', nodeId, newProps);
        return nextTree;
      });
    },
    [setTree]
  );

  return {
    handleDelete,
    addNodeAtRoot,
    clearCanvas,
    serializeCanvas,
    updateNodeProps,
  };
}
```

**NOTIZ (DEUTSCH):** Dieser Hook kapselt alle Tree-Operationen. WICHTIG: Der Immutability-Pattern ist kritisch für React's Rendering-Optimierung. Wir clonen IMMER vor Mutation und geben einen neuen Tree zurück. Der `serializeCanvas` holt sich aktuelle Input-Werte aus dem DOM - das ist wichtig für User-Eingaben!

### 10.3 Drag and Drop Hook

**Create `src/ui/src/hooks/useDragAndDrop.js`:**

```javascript
// src/ui/src/hooks/useDragAndDrop.js

import { useState, useCallback, useEffect } from 'react';
import {
  findNodeAndParent,
  isDescendant,
  getDepth,
  exceedsMaxDepth,
  removeNode,
  insertSibling,
  insertChild,
  cloneDeep,
} from '../utils/treeHelpers';

// Constants (should be imported from shared/constants in production)
const MAX_NESTING_LEVEL = 4;
const DND_ZONE_PERCENT = 0.25;

/**
 * Hook for drag-and-drop functionality
 *
 * RESPONSIBILITIES (DEUTSCH):
 * - State-Management für Drag-Operation (dragging, hover)
 * - Zone-Berechnung (above/below/inside)
 * - Drop-Logik mit Validierung
 * - Event-Handler für Palette und Canvas
 *
 * DRAG TYPES:
 * - NEW: Drag from Palette (create new node)
 * - MOVE: Drag existing node (reorder/restructure)
 */
export function useDragAndDrop(tree, setTree, paletteMap) {
  const [dragging, setDragging] = useState(null); // { kind: 'NEW'|'MOVE', type|nodeId }
  const [hover, setHover] = useState({ targetId: null, zone: null });

  // Cleanup on dragend/drop
  useEffect(() => {
    const clearHover = () => {
      setHover({ targetId: null, zone: null });
      setDragging(null);
    };
    window.addEventListener('dragend', clearHover);
    window.addEventListener('drop', clearHover);
    return () => {
      window.removeEventListener('dragend', clearHover);
      window.removeEventListener('drop', clearHover);
    };
  }, []);

  // Handle drag start from palette (NEW)
  const handlePaletteDragStart = useCallback((e, type) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/x-canvas', JSON.stringify({ kind: 'NEW', type }));
    setDragging({ kind: 'NEW', type });
    console.log('DnD: Palette drag started', type);
  }, []);

  // Handle drag start from canvas node (MOVE)
  const handleNodeDragStart = useCallback((e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/x-canvas', JSON.stringify({ kind: 'MOVE', nodeId }));
    setDragging({ kind: 'MOVE', nodeId });
    console.log('DnD: Node drag started', nodeId);
  }, []);

  /**
   * Compute drop zone based on mouse position
   *
   * ZONES (DEUTSCH):
   * - Top 25%: 'above' (drop BEFORE target)
   * - Bottom 25%: 'below' (drop AFTER target)
   * - Middle 50%: 'inside' (drop AS CHILD - only if canBeParent)
   */
  const computeZone = useCallback((e, targetNode) => {
    const cardElement = e.target?.closest('[data-node-id]') || e.currentTarget;
    const rect = cardElement.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height || 1;
    const band = h * DND_ZONE_PERCENT;

    if (y <= band) return 'above';
    if (y >= h - band) return 'below';
    return targetNode?.children !== undefined ? 'inside' : y < h / 2 ? 'above' : 'below';
  }, []);

  /**
   * Performs the drop operation
   *
   * VALIDATION (DEUTSCH):
   * - Max Depth Check
   * - Circular Dependency Check (Parent nicht in eigenes Child)
   * - Component Type Check (existiert in Palette?)
   */
  const performDrop = useCallback(
    ({ dropTargetId, zone, payload }) => {
      if (!payload) {
        console.error('DnD: No payload for drop');
        return;
      }

      const nextTree = cloneDeep(tree);

      // Helper: Drop at root level
      const dropAtRoot = (node) => {
        nextTree.push(node);
        setTree(nextTree);
        console.log('DnD: Dropped at root', node);
      };

      // Helper: Insert node at calculated position
      const insertNode = (node) => {
        if (!dropTargetId) return dropAtRoot(node);

        const found = findNodeAndParent(nextTree, dropTargetId);
        if (!found) {
          console.error('DnD: Target not found', dropTargetId);
          return;
        }

        // Validation: Max depth
        if (exceedsMaxDepth(nextTree, dropTargetId, MAX_NESTING_LEVEL)) {
          alert('Maximale Verschachtelungstiefe erreicht (5 Ebenen)!');
          return;
        }

        if (zone === 'inside' && found.node.children !== undefined) {
          insertChild(found.node, node);
        } else {
          insertSibling(nextTree, found, node, zone);
        }
        setTree(nextTree);
        console.log('DnD: Node inserted', { zone, targetId: dropTargetId });
      };

      // Handle NEW drop (from palette)
      if (payload.kind === 'NEW') {
        const entry = paletteMap.get(payload.type);
        if (!entry) {
          alert(`Fehler: Komponente "${payload.type}" konnte nicht erstellt werden.`);
          return;
        }

        const newNode = {
          id: 'node_' + Math.random().toString(36).slice(2) + Date.now().toString(36),
          type: entry.type,
          props: { ...entry.defaultProps },
          children: entry.canBeParent ? [] : undefined,
          codeGen: entry.codeGen,
        };

        insertNode(newNode);
      }
      // Handle MOVE drop (existing node)
      else if (payload.kind === 'MOVE') {
        const { nodeId: movingId } = payload;

        // Validation: Cannot drop on itself
        if (movingId === dropTargetId) {
          console.warn('DnD: Cannot drop node on itself');
          return;
        }

        // Validation: Circular dependency
        if (dropTargetId && isDescendant(nextTree, dropTargetId, movingId)) {
          alert('Parent-Komponente kann nicht in eigenes Child verschoben werden!');
          return;
        }

        const movingNode = removeNode(nextTree, movingId);
        if (!movingNode) {
          console.error('DnD: Moving node not found', movingId);
          return;
        }

        insertNode(movingNode);
      }
    },
    [tree, setTree, paletteMap]
  );

  return {
    dragging,
    hover,
    setHover,
    handlePaletteDragStart,
    handleNodeDragStart,
    computeZone,
    performDrop,
  };
}
```

**NOTIZ (DEUTSCH):** Der Drag-and-Drop-Hook ist der komplexeste Teil. Die Zone-Berechnung teilt die Card in 25% oben / 50% mitte / 25% unten. WICHTIG: Die Validierungen (Max Depth, Circular Dependency) sind KRITISCH - ohne sie kann der User zirkuläre Strukturen oder zu tiefe Nesting erstellen, was die Extension crashen kann!

---

## COMMON PITFALLS & HOW TO AVOID THEM

### Pitfall 1: Old .ttEditor.json with wrong codeGen format
**Problem:** Extension loads old config with Object-format codeGen → validation fails → canvas doesn't load

**Solution:**
```typescript
// Option 1: Migration on load
function loadConfig(workspaceRoot: string): ProjectConfig | null {
  // ... load config ...

  // Migrate old format
  function migrateNode(node: any) {
    if (node.codeGen && typeof node.codeGen === 'object') {
      node.codeGen = `<${node.codeGen.component} />`;
    }
    if (node.children) node.children.forEach(migrateNode);
  }

  config.tree.forEach(migrateNode);
  return config;
}
```

### Pitfall 2: Extension doesn't reload after compile
**Checklist:**
1. Run `npm run build:ui` in src/ui
2. Run `npm run compile` in root
3. Press F5 or "Reload Window" in Extension Development Host
4. Check console for errors

### Pitfall 3: Emojis accidentally added
**Prevention:**
```bash
# Add pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
if git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx)$' | xargs grep -E '📁|🎨|⚡|✓|○'; then
  echo "Error: Emojis found in code! Remove them before committing."
  exit 1
fi
EOF
chmod +x .git/hooks/pre-commit
```

### Pitfall 4: Hardcoded values instead of constants
**Bad:**
```javascript
if (depth >= 5) { ... }
setTimeout(() => { ... }, 2000);
```

**Good:**
```javascript
import { MAX_TREE_DEPTH, AUTOSAVE_DELAY_MS } from '@/shared/constants';
if (depth >= MAX_TREE_DEPTH) { ... }
setTimeout(() => { ... }, AUTOSAVE_DELAY_MS);
```

### Pitfall 5: Not testing after each phase
**Rule:** After EVERY phase:
1. Compile extension
2. Build UI
3. Reload Extension Development Host
4. Test manually
5. If broken: rollback immediately

### Pitfall 6: Too much refactoring at once
**Rule:** Make ONE change, test, commit. Don't combine:
- ❌ "Refactor cards + fix drag-and-drop + add new feature"
- ✅ "Refactor cards" → test → commit
- ✅ "Fix drag-and-drop" → test → commit
- ✅ "Add new feature" → test → commit

---

## TESTING CHECKLIST

### Phase-by-Phase Testing

**After Phase 1-3 (Setup + Constants):**
- [ ] `npm run compile` succeeds without errors
- [ ] No TypeScript errors
- [ ] All constants accessible via import

**After Phase 4-6 (Extension):**
- [ ] Extension activates in VSCode
- [ ] Sidebar shows up in Activity Bar
- [ ] Project status is shown correctly
- [ ] "Open Canvas" button works
- [ ] Webview panel opens

**After Phase 7-8 (React Setup + Palette):**
- [ ] `cd src/ui && npm run build` succeeds
- [ ] dist/assets/index.js and index.css exist
- [ ] Canvas shows "Lade Canvas..." briefly
- [ ] Toolbar shows all components
- [ ] Component list is scrollable

**After Phase 9-10 (Utils + Hooks):**
- [ ] Can drag component from toolbar to canvas
- [ ] Card appears on canvas with correct preview
- [ ] Can delete card with X button
- [ ] Can expand/collapse attributes
- [ ] Can edit text attributes
- [ ] Can toggle boolean attributes (checkboxes)

**Final Integration Test:**
- [ ] Create SimpleFieldset on canvas
- [ ] Drag SimpleInput into Fieldset (as child)
- [ ] Edit attributes of both components
- [ ] Save (Cmd+S or button)
- [ ] Check that .ttEditor.json exists
- [ ] Close and reopen canvas
- [ ] Load saved config
- [ ] Verify all components and values are restored
- [ ] Generate code
- [ ] Check that index.astro exists with correct content

---

## PROJECT COMPLETION CHECKLIST

### Files That Must Exist

**Extension (TypeScript):**
- [ ] `src/extension.ts`
- [ ] `src/webview.ts`
- [ ] `src/shared/constants.ts`
- [ ] `src/shared/messageProtocol.ts`
- [ ] `src/shared/projectConfig.ts`
- [ ] `package.json` (extension manifest)
- [ ] `tsconfig.json`

**UI (React):**
- [ ] `src/ui/package.json`
- [ ] `src/ui/vite.config.js`
- [ ] `src/ui/index.html`
- [ ] `src/ui/src/main.jsx`
- [ ] `src/ui/src/index.css`
- [ ] `src/ui/src/components/Canvas.jsx`
- [ ] `src/ui/src/components/CanvasArea.jsx`
- [ ] `src/ui/src/components/Toolbar.jsx`
- [ ] `src/ui/src/components/card/CardBase.jsx`
- [ ] `src/ui/src/components/card/CardPreview.jsx`
- [ ] `src/ui/src/components/card/CardAttributes.jsx`
- [ ] `src/ui/src/components/card/CardDropZone.jsx`
- [ ] `src/ui/src/hooks/useExtensionBridge.js`
- [ ] `src/ui/src/hooks/useTreeOperations.js`
- [ ] `src/ui/src/hooks/useDragAndDrop.js`
- [ ] `src/ui/src/utils/componentPalette.jsx`
- [ ] `src/ui/src/utils/treeHelpers.js`
- [ ] `src/ui/src/utils/domSerializer.js`
- [ ] `src/ui/src/utils/astroCodeGen.js`

**CSS Modules:**
- [ ] `src/ui/src/components/canvas.module.css`
- [ ] `src/ui/src/components/toolbar.module.css`
- [ ] `src/ui/src/components/card/card.module.css`

### Build Output

- [ ] `dist/extension.js` (compiled extension)
- [ ] `dist/shared/*.js` (compiled shared modules)
- [ ] `src/ui/dist/index.html`
- [ ] `src/ui/dist/assets/index.js`
- [ ] `src/ui/dist/assets/index.css`

---

## DEUTSCHE NOTIZEN: FINALE ZUSAMMENFASSUNG

### Was dieses Projekt tut:
Eine VSCode Extension, die einen visuellen Canvas mit Drag-and-Drop bietet, um Astro-Komponenten zusammenzustellen. Ohne Code zu schreiben können User Formulare und UI bauen, dann wird Astro-Code generiert.

### Kritische Punkte:
1. **codeGen MUSS String sein** - nicht Object!
2. **Alle Konstanten in constants.ts** - keine Magic Numbers!
3. **Keine Emojis** - nur Text-basierte Icons
4. **Immutability Pattern** - cloneDeep vor Mutation
5. **Validierung immer** - vor Save, vor Drop, vor alles
6. **vscodeApi nur einmal** - im Extension Host injizieren
7. **base: './' in Vite** - ZWINGEND für Webviews
8. **Auto-Save mit Debounce** - 2 Sekunden nach Änderung
9. **DOM-Serialisierung** - Input-Werte vor Save extrahieren
10. **Max Depth Check** - 5 Ebenen Limit

### Häufigste Fehler:
1. Alte .ttEditor.json nicht gelöscht → Migration fehlt
2. Extension nach Compile nicht neu geladen
3. Emojis eingeschlichen
4. Hardcoded Values statt Constants
5. Zu viel auf einmal refactored → nicht testbar
6. Nach Phase nicht getestet → Fehler häufen sich

### Workflow beim Entwickeln:
1. Phase implementieren (z.B. "Phase 5: Extension Entry Point")
2. Code schreiben genau wie im Guide
3. Kompilieren: `npm run compile`
4. UI bauen: `cd src/ui && npm run build`
5. Extension neu laden: F5
6. Manuell testen: Checklist abarbeiten
7. Bei Fehler: SOFORT stoppen, debuggen, fixen
8. Wenn alles läuft: Git commit
9. Nächste Phase

### Success Criteria:
- Alle Dateien aus Checklist existieren
- Alle Builds erfolgreich
- Alle Tests aus Testing Checklist bestanden
- Canvas lädt ohne Fehler
- Drag-and-Drop funktioniert
- Save/Load funktioniert
- Code-Generierung funktioniert
- Keine Console-Errors

---

## FINAL NOTES

This guide provides a **complete, step-by-step blueprint** for recreating the ttEditor Extension from scratch. Follow the phases **in exact order**, test after **every phase**, and refer to the **Deutsche Notizen** for critical insights learned from the old project.

The architecture is **ultra-granular** and **ultra-generic** by design. Every component is focused, every value is configurable, and every function is reusable. This ensures **maintainability**, **extensibility**, and **stability**.

**Key Success Factors:**
1. **Follow the phases strictly** - Don't skip or rearrange
2. **Test continuously** - After every phase, not at the end
3. **Use constants everywhere** - No hardcoded values
4. **Clone before mutate** - Immutability pattern
5. **Validate everything** - Before save, before drop, before everything

**If something doesn't work:**
1. Check console for errors
2. Verify file exists at correct path
3. Verify imports are correct
4. Verify constants are used (not hardcoded)
5. Rollback to last working state
6. Re-read the relevant phase
7. Ask specific questions

**Remember:** The old project failed because:
- Too much refactoring at once
- No testing between phases
- Old configs not migrated
- Emojis and hardcoded values everywhere
- No clear implementation plan

This guide solves ALL these issues. Follow it precisely, and you **WILL** succeed.

Good luck! 🚀 (okay, one emoji allowed at the very end 😉)
