# Implementierungs-Leitfaden: ttEditor-LC VSCode Extension

## Inhaltsverzeichnis
1. [Projekt-Architektur](#projekt-architektur)
2. [Tech-Stack & Begründungen](#tech-stack--begründungen)
3. [Projektstruktur](#projektstruktur)
4. [Implementierungsschritte](#implementierungsschritte)
5. [Komponenten-Architektur](#komponenten-architektur)
6. [State Management](#state-management)
7. [Kommunikation Extension ↔ Webview](#kommunikation-extension--webview)
8. [Best Practices & Patterns](#best-practices--patterns)

---

## Projekt-Architektur

### Übersicht

Das ttEditor-LC Projekt ist eine **VSCode Extension** mit einer **React-basierten Webview-UI**, die einen visuellen Low-Code-Editor bereitstellt. Die Architektur folgt dem **Dual-Target-Pattern** mit klarer Trennung zwischen:

- **Extension Backend** (Node.js/VSCode API) → `src/` (TypeScript)
- **Webview Frontend** (React/Browser) → `src/ui/` (React + TypeScript)

```
┌─────────────────────────────────────────────────────────┐
│                    VSCode Extension                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Extension Host (Node.js)                          │ │
│  │  - WebviewManager                                  │ │
│  │  - SidebarProvider                                 │ │
│  │  - Code Generator                                  │ │
│  └────────────────────────────────────────────────────┘ │
│                        ↕ (postMessage)                   │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Webview Panel (Browser/React)                     │ │
│  │  - Canvas (Drag & Drop Editor)                     │ │
│  │  - Component Palette                               │ │
│  │  - Tab System                                      │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Tech-Stack & Begründungen

### 5.2 Implementierung der Anwendungsbasis

Für die Anwendung, die auf dem Webview-Panel angezeigt werden soll, wurde im Source-Ordner der Extension der `/ui`-Ordner erstellt. Anschließend wurde dort mit dem Vite-Build-Tool ein neues React-Projekt initialisiert:

```bash
npm create vite@latest . -- --template react
npm install
```

### Tech-Stack-Entscheidungen

#### React 18.3.1
Aus Kompatibilitätsgründen wurde React Version 18.3.1 gewählt. Die für das Projekt essenzielle Dependency `@atlaskit/pragmatic-drag-and-drop` (v1.7.7) unterstützt zum Zeitpunkt der Entwicklung React v19+ nicht. Mehrere React-spezifische Pakete dieser Library (`pragmatic-drag-and-drop-react-accessibility`, `pragmatic-drag-and-drop-flourish`, etc.) weisen eine offene GitHub Issue (#181) ohne Timeline für React 19 Support auf.

React 18.3.1 bietet zusätzlich den Vorteil, dass es identisch zu React 18.2.0 ist, jedoch Deprecation Warnings für zukünftige React 19 Migration enthält.

#### Vite 6.4.1
Als Build-Tool wurde Vite gewählt, da es:
- Deutlich schnellere Build-Zeiten als Webpack bietet (~10-100x)
- Native ESM-Unterstützung und Hot Module Replacement (HMR) bereitstellt
- Optimal für VSCode Extension Webviews geeignet ist (geringe Bundle-Size: ~205 KB JS, ~27 KB CSS)
- Vollständige React 18.3.1 Kompatibilität gewährleistet
- Minimal Setup benötigt (Convention over Configuration)

#### TypeScript 5.9.3
TypeScript wurde gewählt für:
- **Type Safety:** Fehler bereits beim Kompilieren erkennen
- **VSCode Integration:** Native IntelliSense-Unterstützung
- **Refactoring:** Sicheres Umbenennen und Umstrukturieren
- **Dokumentation:** Types dienen als lebende Dokumentation
- **React JSX Support:** Moderne `"jsx": "react-jsx"` Transform

Konfiguration (`tsconfig.json`):
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true
  }
}
```

#### SASS 1.94.0
Für erweiterte CSS-Features wurde SASS installiert:
- **Variables & Mixins:** Wiederverwendbare Style-Patterns
- **Nesting:** Bessere CSS-Struktur
- **Partials:** Modulare Stylesheet-Organisation
- **Vite-Integration:** Native SASS-Unterstützung ohne zusätzliche Konfiguration

Struktur in `src/ui/src/css/`:
```
css/
├── main.scss                    # Entry-Point
├── patternlib-components/       # Design System
│   ├── base/                    # Reset, Variables
│   ├── buttons/                 # Button-Styles
│   ├── inputs/                  # Form-Styles
│   └── tabs/                    # Tab-Navigation
```

#### ESLint 9.39.1 + Plugins
Der Vite-Setup-Wizard installiert automatisch ESLint mit React-spezifischen Plugins:

| Paket | Version | Zweck |
|-------|---------|-------|
| `eslint` | 9.39.1 | Core Linter |
| `eslint-plugin-react` | 7.37.5 | React-Best-Practices (Keys, Props-Validierung) |
| `eslint-plugin-react-hooks` | 5.2.0 | Hook-Regeln (Dependencies, Conditional Hooks) |
| `eslint-plugin-react-refresh` | 0.4.24 | Vite HMR-Kompatibilität |
| `globals` | 15.15.0 | Browser-API-Definitionen (window, document) |

**Warum ESLint?**
- **React Hook Rules:** Verhindert häufige Hook-Fehler (fehlende Dependencies, conditional Hooks)
- **Code-Qualität:** Erzwingt Best Practices (Keys in Listen, keine ungenutzte Props)
- **Team-Konsistenz:** Einheitlicher Code-Stil
- **VSCode-Integration:** Live-Fehleranzeige während Entwicklung

Beispiel für verhinderte Fehler:
```typescript
// ❌ ESLint Error: React Hook useEffect has missing dependency: 'userId'
useEffect(() => {
  fetchData(userId);
}, []); // userId fehlt!

// ✅ Korrekt
useEffect(() => {
  fetchData(userId);
}, [userId]);
```

#### Pragmatic Drag & Drop 1.7.7
`@atlaskit/pragmatic-drag-and-drop` wurde als Drag & Drop-Library gewählt:

**Vorteile:**
- **Performance:** Nutzt native Browser-APIs (Drag Events)
- **Accessibility:** WCAG-konform, Keyboard-Support
- **Bundle-Size:** Leichtgewichtig (~15 KB) vs. react-dnd (~60 KB)
- **Flexibilität:** Framework-agnostisch (Vanilla JS Core)
- **Enterprise-Ready:** Von Atlassian entwickelt und gewartet

**Architektur:**
```typescript
// Monitor-Pattern: Globaler Listener für alle Drop-Events
monitorForElements({
  canMonitor: ({ source }) => source.data.contextId === uniqueContextId,
  onDrop: ({ location, source }) => {
    // Zentrale Drop-Logik
    performDrop({ dropTargetId, zone, payload: source.data });
  }
});
```

#### Zod 3.25.76
Zod wurde für Runtime-Validierung gewählt:
- **Type-Safe Validation:** Schema definiert TypeScript-Types
- **Runtime-Safety:** Validierung von User-Input und API-Daten
- **Fehlerbehandlung:** Präzise Error-Messages
- **Schema-Definition:** Selbstdokumentierend

Beispiel:
```typescript
import { z } from 'zod';

const TreeNodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  props: z.record(z.any()),
  children: z.array(z.lazy(() => TreeNodeSchema))
});

// Type wird automatisch inferiert
type TreeNode = z.infer<typeof TreeNodeSchema>;
```

---

## Projektstruktur

### Root-Level (Extension Backend)

```
ttEditor-LC/
├── src/
│   ├── extension.ts              # Extension Entry-Point (activate/deactivate)
│   ├── services/
│   │   └── WebviewManager.ts     # Verwaltet Webview Panel & Messaging
│   ├── providers/
│   │   └── SidebarProvider.ts    # Sidebar Webview (Preview)
│   ├── generator/
│   │   ├── CodeGenerator.ts      # JSON → Astro Code
│   │   ├── AstroMerger.ts        # Template Merging
│   │   ├── Formatters.ts         # Code-Formatierung
│   │   └── validation.ts         # Zod Schemas
│   ├── state/
│   │   └── tabState.ts           # Tab State Management
│   ├── errors/
│   │   └── ExtensionErrors.ts    # Custom Error Classes
│   └── types/                    # Shared TypeScript Types
├── dist/                         # Compiled Extension Code
├── package.json                  # Extension Dependencies
└── tsconfig.json                 # TypeScript Config (Node.js/CommonJS)
```

### UI-Level (React Frontend)

```
src/ui/
├── src/
│   ├── main.jsx                  # React Entry-Point
│   ├── components/
│   │   ├── Canvas.tsx            # Haupt-Editor-Komponente
│   │   ├── canvas/
│   │   │   ├── NodeWrapper.tsx   # Drag & Drop Node
│   │   │   ├── Slot.tsx          # Drop-Zone
│   │   │   ├── components.tsx    # Sidebar Palette
│   │   │   ├── canvas-form/
│   │   │   │   └── CanvasForm.tsx
│   │   │   └── tab-system/
│   │   │       ├── TabNavigation.tsx
│   │   │       └── TabButton.tsx
│   │   ├── cards/                # Draggable Components
│   │   │   ├── SimpleInput.tsx
│   │   │   ├── SimpleSelect.tsx
│   │   │   ├── TabPage.tsx
│   │   │   └── CardLayout/
│   │   │       └── BaseCard.tsx
│   │   ├── inputs/               # Form Input Components
│   │   ├── commons/              # Shared Components
│   │   └── shared/
│   │       └── ConfirmDialog.tsx
│   ├── contexts/
│   │   └── NamedElementsContext.tsx  # Context für Named Elements
│   ├── utils/
│   │   ├── componentPalette/     # Component Metadata
│   │   ├── types/                # TypeScript Types
│   │   ├── tabState.ts           # Tab State Helpers
│   │   ├── tree-utils.ts         # Tree Manipulation
│   │   ├── extractInputs.ts      # DOM → JSON Serialization
│   │   └── download.ts           # File Download Helpers
│   └── css/
│       ├── main.scss             # Entry
│       └── patternlib-components/ # Design System
├── dist/                         # Vite Build Output
├── package.json                  # UI Dependencies
├── vite.config.js                # Vite Configuration
├── eslint.config.js              # ESLint Configuration
└── tsconfig.json                 # TypeScript Config (DOM/ESM)
```

---

## Implementierungsschritte

### Phase 1: Extension Setup

#### 1.1 Extension Entry-Point (`src/extension.ts`)

```typescript
import * as vscode from 'vscode';
import { WebviewManager } from './services/WebviewManager';
import { SidebarProvider } from './providers/SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
  // Output-Channel für Logging
  const outputChannel = vscode.window.createOutputChannel('ttEditor-LC');

  // Sidebar registrieren
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('vscExtension.view', sidebarProvider)
  );

  // Webview Manager initialisieren
  const webviewManager = new WebviewManager(context, outputChannel, sidebarProvider);

  // Command registrieren
  const showCommand = vscode.commands.registerCommand(
    'vscExtension.showWebview',
    () => webviewManager.createOrShow()
  );
  context.subscriptions.push(showCommand);
}

export function deactivate() {
  // Cleanup
}
```

**Wichtige Konzepte:**
- **`activate()`:** Wird beim Extension-Start aufgerufen
- **`context.subscriptions`:** Automatisches Cleanup beim Deactivate
- **`vscode.commands.registerCommand()`:** Command für Activity Bar Button

#### 1.2 WebviewManager (`src/services/WebviewManager.ts`)

```typescript
export class WebviewManager {
  private panel: vscode.WebviewPanel | undefined;
  private readonly distPath: string;

  constructor(
    private context: vscode.ExtensionContext,
    private outputChannel: vscode.OutputChannel,
    private sidebarProvider?: SidebarProvider
  ) {
    this.distPath = path.join(context.extensionPath, 'src', 'ui', 'dist');
  }

  async createOrShow(): Promise<void> {
    // Panel existiert bereits? → Zeigen
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Active);
      return;
    }

    // Neues Panel erstellen
    this.panel = vscode.window.createWebviewPanel(
      'extensionWebview',
      'ttEditor-LC',
      vscode.ViewColumn.Active,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(this.distPath)],
        retainContextWhenHidden: true  // State beim Tab-Wechsel behalten
      }
    );

    // HTML laden und CSP setzen
    this.panel.webview.html = await this.loadIndexHTML(this.panel.webview);

    // Message Handler
    this.panel.webview.onDidReceiveMessage(
      message => this.handleMessage(message),
      null,
      this.context.subscriptions
    );
  }

  private async loadIndexHTML(webview: vscode.Webview): Promise<string> {
    const indexPath = vscode.Uri.file(path.join(this.distPath, 'index.html'));
    let html = await vscode.workspace.fs.readFile(indexPath).toString();

    // URIs für Webview konvertieren
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this.distPath, 'assets/index.js'))
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.file(path.join(this.distPath, 'assets/index.css'))
    );

    // CSP (Content Security Policy) hinzufügen
    const csp = `
      <meta http-equiv="Content-Security-Policy" content="
        default-src 'self' ${webview.cspSource};
        script-src 'unsafe-inline' ${webview.cspSource};
        style-src 'unsafe-inline' ${webview.cspSource};
      ">
    `;

    // HTML modifizieren
    html = html.replace('<head>', `<head>${csp}
      <link rel="stylesheet" href="${styleUri}">
      <script type="module" src="${scriptUri}"></script>
    `);

    return html;
  }

  private async handleMessage(message: any): Promise<void> {
    switch (message.type) {
      case 'generateAstro':
        await this.handleAstroGeneration(message.data);
        break;
      case 'previewUpdate':
        this.sidebarProvider?.updatePreview(message.data);
        break;
    }
  }
}
```

**Wichtige Konzepte:**
- **`webview.asWebviewUri()`:** Konvertiert lokale Pfade in Webview-URIs
- **CSP:** Sicherheitsrichtlinien für Webview
- **`retainContextWhenHidden`:** State bleibt erhalten bei Tab-Wechsel
- **Message Handling:** Bidirektionale Kommunikation mit React-App

---

### Phase 2: React UI Setup

#### 2.1 React Entry-Point (`src/ui/src/main.jsx`)

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import { previewComponents } from './utils/componentPalette';
import './css/main.scss';

// VSCode API initialisieren
if (typeof window.acquireVsCodeApi !== 'undefined') {
  window.vscodeApi = window.acquireVsCodeApi();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Canvas palette={previewComponents} />
  </React.StrictMode>
);
```

**Wichtige Konzepte:**
- **`acquireVsCodeApi()`:** Kann nur EINMAL aufgerufen werden → in Variable speichern
- **`window.vscodeApi`:** Global verfügbar für alle Komponenten
- **`previewComponents`:** Component Palette Definition

#### 2.2 Canvas Komponente (`src/ui/src/components/Canvas.tsx`)

```typescript
export default function Canvas({ palette, initialNodes = [] }: CanvasProps) {
  // State Management
  const [tabState, setTabState] = useState<TabState>(() =>
    initTabState(initialNodes.length ? initialNodes : [])
  );
  const activeTab = tabState.tabs.find(t => t.id === tabState.activeTabId)!;
  const tree = activeTab.tree;

  // Unique Context ID (verhindert Cross-Canvas Drops)
  const uniqueContextId = useMemo(() => Symbol('canvas-context'), []);

  // Palette Map für schnellen Zugriff
  const paletteMap = useMemo(() => {
    const map: Record<string, PaletteEntry> = {};
    palette.forEach(p => (map[p.type] = p));
    return map;
  }, [palette]);

  // Globaler Drop Monitor
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.contextId === uniqueContextId,
      onDrop: ({ location, source }) => {
        const [innermostTarget] = location.current.dropTargets;
        performDrop({
          dropTargetId: innermostTarget.data.nodeId ?? null,
          zone: innermostTarget.data.zone,
          payload: source.data,
        });
      },
    });
  }, [uniqueContextId, performDrop]);

  // Kommunikation mit Extension (Preview Update)
  useEffect(() => {
    if (window.vscodeApi) {
      window.vscodeApi.postMessage({
        type: 'previewUpdate',
        data: {
          components: extractTypes(tree),
          tabName: activeTab.name,
          tabId: activeTab.id
        }
      });
    }
  }, [tree, activeTab]);

  const performDrop = useCallback(({ dropTargetId, zone, payload }) => {
    if (!payload) return;
    let next = cloneDeep(tree);

    if (payload.kind === 'NEW') {
      // Neue Komponente aus Palette
      const newNode = createNodeFromType(payload.type);
      insertNode(next, dropTargetId, zone, newNode);
    } else if (payload.kind === 'MOVE') {
      // Bestehende Node verschieben
      const movingNode = removeNode(next, payload.nodeId);
      if (movingNode) {
        insertNode(next, dropTargetId, zone, movingNode);
      }
    }

    setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
  }, [tree, tabState.activeTabId]);

  return (
    <NamedElementsProvider>
      <div className="canvas-layout">
        <div className="canvas-area">
          <TabNavigation
            tabState={tabState}
            onTabSwitch={(id) => setTabState(prev => switchTab(prev, id))}
            onTabDelete={(id) => setTabState(prev => deleteTab(prev, id))}
            onTabAdd={() => setTabState(prev => addTab(prev, `Tab ${tabState.tabs.length}`))}
          />

          <CanvasForm
            formRef={formRef}
            tabState={tabState}
            renderNode={renderNode}
            uniqueContextId={uniqueContextId}
            onRead={handleReadCanvas}
            onClear={() => setTabState(prev => updateTabTree(prev, prev.activeTabId, []))}
          />
        </div>

        <Sidebar
          palette={palette}
          onAddClick={addViaClick}
          uniqueContextId={uniqueContextId}
        />
      </div>
    </NamedElementsProvider>
  );
}
```

**Wichtige Konzepte:**
- **`uniqueContextId`:** Verhindert Drops zwischen mehreren Canvas-Instanzen
- **`monitorForElements()`:** Globaler Listener für alle Drop-Events
- **`performDrop()`:** Zentrale Drop-Logik (NEW vs. MOVE)
- **Tree Manipulation:** Immutable Updates mit `cloneDeep()`

---

### Phase 3: State Management

#### 3.1 Tab State Pattern (`src/ui/src/utils/tabState.ts`)

```typescript
export interface Tab {
  id: string;
  name: string;
  tabIndex: number;
  tree: TreeNode[];
}

export interface TabState {
  tabs: Tab[];
  activeTabId: string;
}

// Initialisierung
export function initTabState(initialTree: TreeNode[] = []): TabState {
  const defaultTab: Tab = {
    id: genId(),
    name: 'Start',
    tabIndex: 0,
    tree: initialTree
  };
  return {
    tabs: [defaultTab],
    activeTabId: defaultTab.id
  };
}

// Reducer-ähnliche Update-Funktionen
export function addTab(state: TabState, name: string): TabState {
  const newTab: Tab = {
    id: genId(),
    name,
    tabIndex: state.tabs.length,
    tree: []
  };
  return {
    tabs: [...state.tabs, newTab],
    activeTabId: newTab.id
  };
}

export function deleteTab(state: TabState, tabId: string): TabState {
  if (state.tabs.length === 1) return state; // Letzter Tab bleibt

  const filtered = state.tabs.filter(t => t.id !== tabId);
  const newActiveId = state.activeTabId === tabId
    ? filtered[0].id
    : state.activeTabId;

  return {
    tabs: filtered,
    activeTabId: newActiveId
  };
}

export function updateTabTree(state: TabState, tabId: string, newTree: TreeNode[]): TabState {
  return {
    ...state,
    tabs: state.tabs.map(tab =>
      tab.id === tabId ? { ...tab, tree: newTree } : tab
    )
  };
}

export function switchTab(state: TabState, tabId: string): TabState {
  return { ...state, activeTabId: tabId };
}
```

**Warum dieser Ansatz?**
- **Immutable Updates:** Verhindert Bugs durch Mutation
- **Testbar:** Reine Funktionen ohne Side-Effects
- **Type-Safe:** TypeScript garantiert korrekte State-Struktur
- **Redux-ähnlich:** Vertrautes Pattern für Entwickler

#### 3.2 Tree Utils (`src/ui/src/components/canvas/tree-utils.ts`)

```typescript
export interface TreeNode {
  id: string;
  type: string;
  canHaveChildren: boolean;
  props: Record<string, any>;
  children: TreeNode[];
}

// Tree Traversal
export function findNodeAndParent(
  tree: TreeNode[],
  id: string,
  parent: TreeNode | null = null
): { node: TreeNode | null; parent: TreeNode | null } {
  for (const node of tree) {
    if (node.id === id) return { node, parent };
    if (node.children) {
      const result = findNodeAndParent(node.children, id, node);
      if (result.node) return result;
    }
  }
  return { node: null, parent: null };
}

// Node entfernen
export function removeNode(tree: TreeNode[], id: string): TreeNode | null {
  for (let i = 0; i < tree.length; i++) {
    if (tree[i].id === id) {
      return tree.splice(i, 1)[0];
    }
    if (tree[i].children) {
      const removed = removeNode(tree[i].children, id);
      if (removed) return removed;
    }
  }
  return null;
}

// Node einfügen
export function insertNode(
  tree: TreeNode[],
  targetId: string | null,
  zone: 'before' | 'after' | 'inside',
  newNode: TreeNode
): void {
  if (!targetId) {
    // Root-Level Drop
    tree.push(newNode);
    return;
  }

  const { node: target, parent } = findNodeAndParent(tree, targetId);
  if (!target) return;

  if (zone === 'inside') {
    if (target.canHaveChildren) {
      target.children.push(newNode);
    }
  } else {
    const siblings = parent ? parent.children : tree;
    const index = siblings.indexOf(target);
    const insertIndex = zone === 'before' ? index : index + 1;
    siblings.splice(insertIndex, 0, newNode);
  }
}

// Zyklus-Check
export function isDescendant(tree: TreeNode[], ancestorId: string, descendantId: string): boolean {
  const { node } = findNodeAndParent(tree, ancestorId);
  if (!node) return false;

  function check(nodes: TreeNode[]): boolean {
    return nodes.some(n => n.id === descendantId || check(n.children));
  }

  return check(node.children);
}
```

**Wichtige Konzepte:**
- **Immutabilität:** Tree wird gecloned vor Mutation (`cloneDeep()`)
- **Rekursion:** Tree-Struktur erfordert rekursive Algorithmen
- **Zyklus-Prävention:** `isDescendant()` verhindert ungültige Drops

---

### Phase 4: Drag & Drop System

#### 4.1 Draggable Node (`src/ui/src/components/canvas/NodeWrapper.tsx`)

```typescript
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export function NodeWrapper({ node, meta, onDelete, uniqueContextId, children }) {
  const ref = useRef<HTMLDivElement>(null);

  // Draggable Setup
  useEffect(() => {
    if (!ref.current) return;

    return draggable({
      element: ref.current,
      getInitialData: () => ({
        kind: 'MOVE',
        nodeId: node.id,
        contextId: uniqueContextId
      })
    });
  }, [node.id, uniqueContextId]);

  return (
    <div ref={ref} className="canvas-node-wrapper" data-node-id={node.id}>
      <div className="node-header">
        <span>{meta.label}</span>
        <button onClick={() => onDelete(node.id)}>×</button>
      </div>

      {/* Drop-Zones */}
      <Slot zone="before" nodeId={node.id} uniqueContextId={uniqueContextId} />

      <div className="node-content">
        {meta.component && <meta.component {...node.props} />}
        {children}
      </div>

      <Slot zone="after" nodeId={node.id} uniqueContextId={uniqueContextId} />
    </div>
  );
}
```

#### 4.2 Drop Zone (`src/ui/src/components/canvas/Slot.tsx`)

```typescript
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';

export function Slot({ zone, nodeId, uniqueContextId }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    return dropTargetForElements({
      element: ref.current,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: () => ({ zone, nodeId }),
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false)
    });
  }, [zone, nodeId, uniqueContextId]);

  return (
    <div
      ref={ref}
      className={`drop-slot drop-slot--${zone} ${isDraggedOver ? 'is-dragged-over' : ''}`}
    />
  );
}
```

**Wichtige Konzepte:**
- **`draggable()`:** Macht Element draggable
- **`dropTargetForElements()`:** Macht Element zu Drop-Zone
- **`getData()`:** Payload für Drop-Event
- **`canDrop()`:** Validierung basierend auf `contextId`
- **Visual Feedback:** `isDraggedOver` für CSS-Klassen

---

### Phase 5: Serialisierung & Code-Generation

#### 5.1 DOM → JSON (`src/ui/src/utils/extractInputs.ts`)

```typescript
export function extractInputsFromElement(element: HTMLElement): Record<string, any> {
  const inputs: Record<string, any> = {};

  // Text Inputs
  element.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
    const name = input.getAttribute('name');
    if (name) inputs[name] = (input as HTMLInputElement).value;
  });

  // Textareas
  element.querySelectorAll('textarea').forEach(textarea => {
    const name = textarea.getAttribute('name');
    if (name) inputs[name] = textarea.value;
  });

  // Selects
  element.querySelectorAll('select').forEach(select => {
    const name = select.getAttribute('name');
    if (name) inputs[name] = (select as HTMLSelectElement).value;
  });

  // Checkboxes
  element.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    const name = checkbox.getAttribute('name');
    if (name) inputs[name] = (checkbox as HTMLInputElement).checked;
  });

  // Radio Buttons
  const radioGroups = new Set<string>();
  element.querySelectorAll('input[type="radio"]').forEach(radio => {
    const name = radio.getAttribute('name');
    if (name && !radioGroups.has(name)) {
      radioGroups.add(name);
      const checked = element.querySelector(`input[name="${name}"]:checked`);
      inputs[name] = checked ? (checked as HTMLInputElement).value : null;
    }
  });

  return inputs;
}
```

#### 5.2 JSON → Astro (`src/generator/AstroMerger.ts`)

```typescript
export function mergeAstro(jsonData: any[], metadata: Metadata): string {
  let astroCode = generateAstroHeader(metadata);

  jsonData.forEach(page => {
    astroCode += generatePageComponent(page);
  });

  astroCode += generateAstroFooter();
  return astroCode;
}

function generatePageComponent(page: any): string {
  let code = `<section id="${page.name}" class="tab-content">\n`;

  page.children.forEach((node: any) => {
    code += generateNodeCode(node, 1);
  });

  code += `</section>\n`;
  return code;
}

function generateNodeCode(node: any, indent: number): string {
  const indentStr = '  '.repeat(indent);
  const component = componentMap[node.type];

  if (!component) return '';

  let code = `${indentStr}<${component.tagName}`;

  // Props hinzufügen
  Object.entries(node.inputs).forEach(([key, value]) => {
    code += ` ${key}="${value}"`;
  });

  code += `>`;

  // Children rekursiv
  if (node.children?.length) {
    code += '\n';
    node.children.forEach((child: any) => {
      code += generateNodeCode(child, indent + 1);
    });
    code += indentStr;
  }

  code += `</${component.tagName}>\n`;
  return code;
}
```

---

## Komponenten-Architektur

### Component Pattern

Alle draggable Components folgen diesem Pattern:

```typescript
// 1. Component Definition (cards/SimpleInput.tsx)
export function SimpleInput({ label, name, value }: SimpleInputProps) {
  return (
    <div className="form-field">
      <label>{label}</label>
      <input type="text" name={name} defaultValue={value} />
    </div>
  );
}

// 2. Palette Entry (utils/componentPalette/index.ts)
export const previewComponents: PaletteEntry[] = [
  {
    type: 'SimpleInput',
    label: 'Text Input',
    component: SimpleInput,
    canHaveChildren: false,
    icon: '📝',
    category: 'inputs'
  },
  // ...
];

// 3. Generator Mapping (generator/componentMap.ts)
export const componentMap = {
  'SimpleInput': {
    tagName: 'input',
    defaultProps: { type: 'text' }
  },
  // ...
};
```

### Komponenten-Kategorien

| Kategorie | Beispiele | Zweck |
|-----------|-----------|-------|
| **cards/** | `SimpleInput`, `SimpleSelect`, `TabPage` | Draggable UI-Components |
| **canvas/** | `NodeWrapper`, `Slot`, `CanvasForm` | Drag & Drop System |
| **inputs/** | `Input_String`, `Input_Function` | Spezielle Form Inputs |
| **commons/** | `NamedElementsSelect` | Wiederverwendbare Components |
| **shared/** | `ConfirmDialog` | UI-Utilities |

---

## State Management

### State-Flow

```
User Interaction (Drag & Drop / Form Input)
         ↓
Canvas Component (useState)
         ↓
Tab State Update (updateTabTree)
         ↓
Tree Manipulation (insertNode/removeNode)
         ↓
Re-Render (React)
         ↓
DOM Serialization (extractInputs)
         ↓
Message to Extension (postMessage)
         ↓
Code Generation (mergeAstro)
         ↓
File Download
```

### State Lifting Pattern

```typescript
// Canvas.tsx (Top-Level State)
const [tabState, setTabState] = useState<TabState>(...);

// Props Down
<TabNavigation
  tabState={tabState}
  onTabSwitch={(id) => setTabState(prev => switchTab(prev, id))}
/>

// Callbacks Up
<NodeWrapper
  onDelete={(id) => {
    const next = cloneDeep(tree);
    removeNode(next, id);
    setTabState(prev => updateTabTree(prev, activeTabId, next));
  }}
/>
```

---

## Kommunikation Extension ↔ Webview

### Message Protocol

#### Frontend → Extension

```typescript
// React Component
window.vscodeApi.postMessage({
  type: 'generateAstro',
  data: {
    jsonData: [...],
    metadata: { campaignNr: '001', ... }
  }
});
```

#### Extension → Frontend

```typescript
// WebviewManager.ts
this.panel.webview.postMessage({
  type: 'astroGenerated',
  data: {
    astroCode: '...',
    filename: 'index.astro'
  }
});
```

#### Message Handler (Frontend)

```typescript
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    const message = event.data;
    switch (message.type) {
      case 'astroGenerated':
        downloadAstro(message.data.astroCode, message.data.filename);
        break;
      case 'astroError':
        alert(`Error: ${message.data.error}`);
        break;
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## Best Practices & Patterns

### 1. Type-Safety

```typescript
// ✅ Typisierte Messages
interface AstroGenerateMessage {
  type: 'generateAstro';
  data: {
    jsonData: TreeNode[];
    metadata: Metadata;
  };
}

// ❌ Untypisiert
window.vscodeApi.postMessage({ type: 'generateAstro', data: anything });
```

### 2. Error Handling

```typescript
// Extension
try {
  const astroCode = mergeAstro(data.jsonData, data.metadata);
  this.panel?.webview.postMessage({
    type: 'astroGenerated',
    data: { astroCode }
  });
} catch (error) {
  this.panel?.webview.postMessage({
    type: 'astroError',
    data: { error: error.message }
  });
}

// Frontend
case 'astroError':
  console.error('Generation failed:', message.data.error);
  vscode.window.showErrorMessage(`Failed: ${message.data.error}`);
  break;
```

### 3. Immutable Updates

```typescript
// ✅ Immutable
const next = cloneDeep(tree);
removeNode(next, id);
setTabState(prev => updateTabTree(prev, activeTabId, next));

// ❌ Mutation
tree.splice(index, 1);  // React erkennt Änderung nicht!
setTabState(tabState);   // Kein Re-Render
```

### 4. Performance

```typescript
// ✅ useMemo für teure Berechnungen
const paletteMap = useMemo(() => {
  const map: Record<string, PaletteEntry> = {};
  palette.forEach(p => (map[p.type] = p));
  return map;
}, [palette]);

// ✅ useCallback für Event Handler
const handleDelete = useCallback((id: string) => {
  // ...
}, [tree, activeTabId]);
```

### 5. Context Isolation

```typescript
// Verhindert Drops zwischen mehreren Canvas-Instanzen
const uniqueContextId = useMemo(() => Symbol('canvas-context'), []);

draggable({
  getData: () => ({ contextId: uniqueContextId })
});

dropTargetForElements({
  canDrop: ({ source }) => source.data.contextId === uniqueContextId
});
```

### 6. Cleanup

```typescript
// ✅ Cleanup in useEffect
useEffect(() => {
  const cleanup = monitorForElements({ ... });
  return cleanup;  // Wird beim Unmount aufgerufen
}, [deps]);

// ✅ Cleanup in Extension
context.subscriptions.push(webviewManager);  // Auto-Dispose
```

---

## Build & Deployment

### Development

```bash
# Extension Backend
npm run watch        # TypeScript Watch Mode

# React Frontend
cd src/ui
npm run dev         # Vite Dev Server (optional, für Testing)

# Extension starten
F5 (VSCode Debug)   # Startet Extension Host
```

### Production Build

```bash
# Komplett-Build
npm run build

# Einzeln
tsc                          # Extension Backend
cd src/ui && npm run build   # React Frontend
```

### Build-Output

```
dist/
├── extension.js             # Compiled Extension
├── services/
│   └── WebviewManager.js
└── ...

src/ui/dist/
├── index.html               # Entry HTML
├── assets/
│   ├── index.js            # React Bundle (~205 KB)
│   └── index.css           # Styles (~27 KB)
```

---

## Zusammenfassung

Diese Architektur bietet:

✅ **Klare Trennung:** Extension Backend (Node.js) ↔ UI Frontend (React)
✅ **Type-Safety:** TypeScript in beiden Teilen
✅ **Performance:** Vite Build (~1s), optimierte Bundles
✅ **Wartbarkeit:** Modulare Struktur, wiederverwendbare Components
✅ **Testbarkeit:** Reine Funktionen, isolierte State-Updates
✅ **Skalierbarkeit:** Component-Palette einfach erweiterbar
✅ **Best Practices:** ESLint, Immutability, Error Handling

**Nächste Schritte:**
1. Component Palette erweitern (`src/ui/src/utils/componentPalette/`)
2. Code-Generator für weitere Frameworks (`src/generator/`)
3. Testing Setup (`jest.config.js`, `__tests__/`)
4. Dokumentation erweitern (JSDoc, Storybook)
