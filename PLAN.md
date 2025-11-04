# TT-Editor-LC Extension - REFACTORED IMPLEMENTATION PLAN

**Version:** 2.0 (Refactored)
**Date:** 2025-11-03
**Principle:** BRUTAL EINFACH - 38% weniger Files, 50% weniger Abstraktionen

---

## EXECUTIVE SUMMARY

Nach kritischer Analyse wurde der ursprüngliche Plan drastisch vereinfacht:

- **21 Core Files → 13 Core Files** (-38%)
- **3 Hooks → 1 Mega-Hook** (-67%)
- **8 Card Sub-Components → 1 Card Component** (-88%)
- **Card Registry eliminiert** (YAGNI-Prinzip)
- **Utils consolidated** (4 → 3 Files)

**Ergebnis:** Gleiche Funktionalität, drastisch reduzierte Komplexität.

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [What Was Eliminated](#what-was-eliminated)
3. [Implementation Phases](#implementation-phases)
4. [Testing Strategy](#testing-strategy)
5. [Effort Estimation](#effort-estimation)
6. [Critical Success Factors](#critical-success-factors)
7. [Final Checklist](#final-checklist)

---

## ARCHITECTURE OVERVIEW

### Tech Stack

- **Extension:** TypeScript (Node.js)
- **UI:** React 18 + TypeScript
- **Drag & Drop:** pragmatic-drag-and-drop
- **Build:** esbuild (Extension) + Vite (UI)
- **Styling:** Pure CSS (CSS Custom Properties)

### File Structure (13 Core Files)

```
ttEditor-extension/
├── src/
│   ├── extension.ts                          # VSCode Entry (80 lines)
│   ├── webview.ts                            # Webview Manager (120 lines)
│   ├── shared/
│   │   ├── constants.ts                      # All Constants (100 lines)
│   │   ├── messageProtocol.ts                # Type Definitions (50 lines)
│   │   └── projectConfig.ts                  # Validation Logic (80 lines)
│   └── ui/
│       ├── src/
│       │   ├── main.tsx                      # React Entry (15 lines)
│       │   ├── index.css                     # Global Styles (200 lines)
│       │   ├── components/
│       │   │   ├── Canvas.tsx                # Orchestrator (150 lines)
│       │   │   ├── Toolbar.tsx               # Hard-coded Card List (50 lines)
│       │   │   ├── CanvasArea.tsx            # Flattened Tree Renderer (80 lines)
│       │   │   └── Card.tsx                  # MERGED: All Card Logic (200 lines)
│       │   ├── cards/                        # 22 Concrete Cards (80-100 lines each)
│       │   │   ├── SimpleInputCard.tsx
│       │   │   ├── SimpleFieldsetCard.tsx
│       │   │   └── ... (20 more)
│       │   ├── inputs/                       # Form Inputs (30-40 lines each)
│       │   │   ├── SimpleInput.tsx
│       │   │   ├── Checkbox.tsx
│       │   │   └── TripleInput.tsx
│       │   ├── hooks/
│       │   │   └── useCanvas.ts              # MERGED: Bridge+Tree+DnD (300 lines)
│       │   └── utils/
│       │       ├── tree.ts                   # MERGED: Tree Helpers (250 lines)
│       │       ├── serialization.ts          # MERGED: Serializer+CodeGen (150 lines)
│       │       └── componentPalette.tsx      # Simple Array (600 lines)
│       ├── public/
│       │   └── icons/                        # 22 Card Icons (SVG/PNG)
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── dist/                                      # Build Output
├── package.json
├── tsconfig.json
└── esbuild.js
```

### Component Hierarchy

```
App
├── Toolbar
│   └── Card (mode="tool") × 22
└── Canvas
    └── CanvasArea
        └── Card (mode="canvas") × N
            ├── CardPreview (inline)
            ├── CardAttributes (inline)
            └── CardDropZone (inline, conditional)
```

---

## WHAT WAS ELIMINATED

### Removed Files (11 Total)

#### 1. Card Registry System (Over-Engineering)

**Removed:**
- `cardRegistry.ts` (Global Map + Registration Logic)
- 22x `registerCard()` calls in Card files

**Replaced with:**
- Simple array in `componentPalette.tsx`
- Direct imports

**Reason:** Cards are statically known, not dynamically loaded. Registry Pattern brings ZERO value.

#### 2. Hook Splitting (Over-Abstraction)

**Removed:**
- `useExtensionBridge.ts`
- `useTreeOperations.ts`
- `useDragAndDrop.ts`

**Replaced with:**
- Single `useCanvas.ts` (300 lines)

**Reason:** All 3 hooks operate on the SAME state (tree). No real separation of concerns. More prop-drilling without benefit.

#### 3. Card Sub-Component Fragmentation

**Removed:**
- `CardBase.tsx`
- `CardTool.tsx`
- `CardPreview.tsx`
- `CardAttributes.tsx`
- `CardDropZone.tsx`

**Replaced with:**
- Single `Card.tsx` with inline sub-components

**Reason:** Each sub-component was <50 lines and used only ONCE (in CardBase). Over-fragmentation hurts readability.

#### 4. Utils Over-Splitting

**Removed:**
- `domSerializer.ts` (standalone)
- `astroCodeGen.ts` (standalone)

**Merged into:**
- `serialization.ts` (combined)

**Reason:** Both files dealt with serialization (DOM → JSON, JSON → Astro). Thematically related.

### Comparison Table

| Category | BEFORE | AFTER | Savings |
|----------|--------|-------|---------|
| Extension Layer | 5 | 5 | 0 |
| UI Components | 8 | 4 | -4 |
| Hooks | 3 | 1 | -2 |
| Utils | 5 | 3 | -2 |
| Cards | 0 | 22 | +22 |
| Inputs | 0 | 3 | +3 |
| **TOTAL** | **21** | **38** | **-8 Core +25 Cards** |

---

## IMPLEMENTATION PHASES

### PHASE 1: Extension Foundation (2h)

**Goal:** VSCode Extension setup, activation, sidebar, webview panel creation.

#### Files to Create:

```
✅ package.json (Extension Manifest)
✅ tsconfig.json (TypeScript Config)
✅ esbuild.js (Build Script)
✅ src/extension.ts
✅ src/webview.ts
✅ src/shared/constants.ts
✅ src/shared/messageProtocol.ts
✅ src/shared/projectConfig.ts
```

#### Key Features:

**package.json:**
```json
{
  "name": "tteditor-extension",
  "displayName": "TT-Editor Low-Code",
  "version": "1.0.0",
  "engines": { "vscode": "^1.80.0" },
  "activationEvents": ["onStartupFinished"],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      { "command": "ttEditor.openCanvas", "title": "Canvas öffnen" },
      { "command": "ttEditor.generateCode", "title": "Code generieren" }
    ],
    "viewsContainers": {
      "activitybar": [
        { "id": "ttEditor", "title": "TT-Editor", "icon": "resources/icon.svg" }
      ]
    },
    "views": {
      "ttEditor": [{ "id": "ttEditor.view", "name": "TT-Editor" }]
    }
  }
}
```

**extension.ts:**
- Check for `.astro` directory
- Set context variable `ttEditor.projectValid`
- Register commands (`openCanvas`, `generateCode`)
- Register sidebar provider

**webview.ts:**
- Create singleton webview panel
- Load `dist/index.html` from UI build
- Handle messages (SAVE, LOAD, GENERATE_CODE)
- Send INIT message with project info

**constants.ts:**
```typescript
export const MAX_TREE_DEPTH = 5;
export const ASTRO_DIR = '.astro';
export const CONFIG_FILENAME = '.ttEditor.json';
export const CONFIG_VERSION = '1.0';
export const AUTOSAVE_DELAY_MS = 2000;
export const DND_ZONE_PERCENT = 0.25;
```

**messageProtocol.ts:**
```typescript
export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentNode[];
  compName: string;
}

export interface ProjectConfig {
  version: string;
  projectName: string;
  lastModified: string;
  tree: ComponentNode[];
  metadata: Record<string, any>;
}

export type CanvasToExtensionMessage =
  | { type: 'READY' }
  | { type: 'SAVE'; payload: ProjectConfig }
  | { type: 'LOAD_REQUEST' }
  | { type: 'GENERATE_CODE'; payload: string };

export type ExtensionToCanvasMessage =
  | { type: 'INIT'; payload: { projectName: string; config: ProjectConfig | null; isValidProject: boolean } }
  | { type: 'LOAD_RESPONSE'; payload: ProjectConfig }
  | { type: 'SAVE_SUCCESS'; filePath: string }
  | { type: 'ERROR'; message: string };
```

#### Deliverables:

- [ ] Extension activates in VSCode
- [ ] Sidebar shows project status
- [ ] "Canvas öffnen" command works
- [ ] Webview panel opens (empty for now)

#### Test:

```bash
npm run compile
# Press F5 → Extension Development Host
# Check: Sidebar visible, Canvas command works
```

---

### PHASE 2: React UI Setup (1h)

**Goal:** Vite + React + TypeScript setup for webview UI.

#### Files to Create:

```
✅ src/ui/package.json
✅ src/ui/vite.config.ts
✅ src/ui/tsconfig.json
✅ src/ui/index.html
✅ src/ui/src/main.tsx
✅ src/ui/src/index.css
```

#### Key Features:

**package.json:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@atlaskit/pragmatic-drag-and-drop": "^1.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  }
}
```

**vite.config.ts (CRITICAL for VSCode):**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',  // REQUIRED for VSCode Webview!
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name][extname]',
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
      },
    },
  },
});
```

**main.tsx:**
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import './index.css';

console.log('React app starting, vscodeApi available:', !!window.vscodeApi);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="app-container">
      <Canvas />
    </div>
  </React.StrictMode>
);
```

**index.css:**
```css
:root {
  --color-primary: #4a90e2;
  --color-danger: #e74c3c;
  --color-border: #ddd;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  overflow: hidden;
}

.app-container {
  display: flex;
  height: 100vh;
}
```

#### Deliverables:

- [ ] `npm install` works
- [ ] `npm run dev` starts Vite
- [ ] `npm run build` creates `dist/` folder
- [ ] React app renders (even if empty)

#### Test:

```bash
cd src/ui
npm install
npm run build
# Check: dist/assets/index.js and index.css exist
```

---

### PHASE 3: Utils & Core Logic (3h)

**Goal:** Implement all utility functions for tree manipulation, serialization, and code generation.

#### Files to Create:

```
✅ src/ui/src/utils/tree.ts
✅ src/ui/src/utils/serialization.ts
✅ src/ui/src/utils/componentPalette.tsx
```

#### tree.ts (250 lines)

**Functions:**
```typescript
// ID Generation
export function genId(): string;

// Tree Traversal
export function findNode(tree: ComponentNode[], id: string): ComponentNode | null;
export function findNodeAndParent(tree: ComponentNode[], id: string, parent?: ComponentNode | null): { node: ComponentNode; parent: ComponentNode | null; index: number } | null;

// Tree Manipulation
export function removeNode(tree: ComponentNode[], id: string): ComponentNode | null;
export function insertNode(tree: ComponentNode[], targetId: string | null, zone: 'above' | 'below' | 'inside', newNode: ComponentNode): void;
export function insertSibling(tree: ComponentNode[], found: { parent: ComponentNode | null; index: number }, newNode: ComponentNode, zone: 'above' | 'below'): void;
export function insertChild(target: ComponentNode, newNode: ComponentNode): void;

// Utilities
export function cloneDeep<T>(obj: T): T;
export function isDescendant(tree: ComponentNode[], childId: string, ancestorId: string): boolean;
export function exceedsMaxDepth(tree: ComponentNode[], nodeId: string, maxDepth: number): boolean;
export function getDepth(tree: ComponentNode[], nodeId: string): number;

// NEW: For Performance
export function flattenTree(tree: ComponentNode[]): Array<ComponentNode & { depth: number; parentId: string | null }>;
```

#### serialization.ts (150 lines)

**Functions:**
```typescript
// Form Data Extraction
export function extractFormData(formElement: HTMLFormElement): Record<string, any>;

// Tree Serialization
export function serializeTree(tree: ComponentNode[], rootElement: HTMLElement | null): ComponentNode[];
export function deserializeTree(jsonTree: any[]): ComponentNode[];

// Astro Code Generation
export function renderAstroNode(node: ComponentNode, depth: number): string;
export function generateAstroFile(tree: ComponentNode[], projectName: string): string;
```

**Key Implementation:**
```typescript
export function extractFormData(formElement: HTMLFormElement): Record<string, any> {
  const formData = new FormData(formElement);
  const data: Record<string, any> = {};

  for (const [key, value] of formData.entries()) {
    if (value === 'on') {
      data[key] = true; // Checkbox
    } else {
      data[key] = value;
    }
  }

  // Handle unchecked checkboxes
  const checkboxes = formElement.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => {
    const name = (cb as HTMLInputElement).name;
    if (!data.hasOwnProperty(name)) {
      data[name] = false;
    }
  });

  return data;
}

export function serializeTree(tree: ComponentNode[], rootElement: HTMLElement | null): ComponentNode[] {
  if (!rootElement) return tree;

  function visitNode(node: ComponentNode): ComponentNode {
    const cardEl = rootElement.querySelector(`[data-node-id="${node.id}"]`);
    const formEl = cardEl?.querySelector('form[data-comp-name]') as HTMLFormElement | null;

    const props = formEl ? extractFormData(formEl) : node.props;

    return {
      ...node,
      props,
      children: node.children?.map(visitNode),
    };
  }

  return tree.map(visitNode);
}
```

#### componentPalette.tsx (600 lines)

**Structure:**
```tsx
import SimpleInputCard from '../cards/SimpleInputCard';
import SimpleFieldsetCard from '../cards/SimpleFieldsetCard';
// ... all 22 imports

export interface ComponentPaletteEntry {
  type: string;
  label: string;
  icon: string;
  description?: string;
  canBeParent: boolean;
  defaultProps: Record<string, any>;
  codeGen: string;
  Component: React.ComponentType<any>;
}

export const COMPONENT_PALETTE: ComponentPaletteEntry[] = [
  {
    type: 'SimpleInput',
    label: 'Simple Input',
    icon: '/icons/simple-input.svg',
    description: 'Einfaches Textfeld',
    canBeParent: false,
    defaultProps: { id: '', label: '', type: 'text' },
    codeGen: '<SimpleInput id="" label="" type="text" />',
    Component: SimpleInputCard,
  },
  // ... 21 more entries
];

// Helper
export function getComponentByType(type: string): ComponentPaletteEntry | undefined {
  return COMPONENT_PALETTE.find(c => c.type === type);
}
```

#### Deliverables:

- [ ] All tree operations work correctly
- [ ] Serialization extracts form data
- [ ] Astro code generation produces valid syntax
- [ ] Component palette array populated

#### Test:

```typescript
// Unit tests for critical functions
const tree = [{ id: '1', type: 'SimpleInput', props: {}, compName: 'SimpleInput' }];
const node = findNode(tree, '1'); // Should return node
const depth = getDepth(tree, '1'); // Should return 0
```

---

### PHASE 4: Mega-Hook useCanvas (4h)

**Goal:** Single hook that manages ALL canvas state and operations.

#### File to Create:

```
✅ src/ui/src/hooks/useCanvas.ts (300 lines)
```

#### Hook Structure:

```typescript
export function useCanvas() {
  // ========================================================================
  // STATE
  // ========================================================================

  // Extension Bridge
  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isValidProject, setIsValidProject] = useState(false);

  // Tree
  const [tree, setTree] = useState<ComponentNode[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Drag and Drop
  const [dragging, setDragging] = useState<any>(null);
  const [hover, setHover] = useState<{ targetId: string | null; zone: string | null }>({ targetId: null, zone: null });

  // ========================================================================
  // EXTENSION BRIDGE (Message Handler)
  // ========================================================================

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg: ExtensionToCanvasMessage = event.data;

      switch (msg.type) {
        case 'INIT':
          setProjectName(msg.payload.projectName);
          setIsValidProject(msg.payload.isValidProject);
          if (msg.payload.config) {
            setTree(msg.payload.config.tree);
          }
          setIsReady(true);
          break;

        case 'LOAD_RESPONSE':
          setTree(msg.payload.tree);
          break;

        case 'SAVE_SUCCESS':
          console.log('Save successful:', msg.filePath);
          break;

        case 'ERROR':
          alert(`Error: ${msg.message}`);
          break;
      }
    };

    window.addEventListener('message', handler);
    window.vscodeApi?.postMessage({ type: 'READY' });

    return () => window.removeEventListener('message', handler);
  }, []);

  // ========================================================================
  // TREE OPERATIONS
  // ========================================================================

  const addNode = useCallback((type: string) => {
    const entry = getComponentByType(type);
    if (!entry) return;

    const newNode: ComponentNode = {
      id: genId(),
      type: entry.type,
      props: { ...entry.defaultProps },
      children: entry.canBeParent ? [] : undefined,
      compName: entry.type,
    };

    setTree(prev => [...prev, newNode]);
  }, []);

  const deleteNode = useCallback((id: string) => {
    setTree(prev => {
      const next = cloneDeep(prev);
      removeNode(next, id);
      return next;
    });
  }, []);

  const clearCanvas = useCallback(() => {
    if (confirm('Canvas wirklich leeren?')) {
      setTree([]);
    }
  }, []);

  const serialize = useCallback(() => {
    return serializeTree(tree, canvasRef.current);
  }, [tree]);

  // ========================================================================
  // DRAG AND DROP HANDLERS
  // ========================================================================

  const handleDragStart = useCallback((e: DragEvent, payload: any) => {
    e.dataTransfer!.effectAllowed = payload.kind === 'NEW' ? 'copy' : 'move';
    e.dataTransfer!.setData('application/x-canvas', JSON.stringify(payload));
    setDragging(payload);
  }, []);

  const handleDrop = useCallback((e: DragEvent, targetId: string | null, zone: 'above' | 'below' | 'inside') => {
    e.preventDefault();

    const payload = JSON.parse(e.dataTransfer!.getData('application/x-canvas'));

    setTree(prev => {
      const next = cloneDeep(prev);

      // Validation
      if (payload.kind === 'MOVE') {
        if (payload.nodeId === targetId) return prev;
        if (targetId && isDescendant(next, targetId, payload.nodeId)) {
          alert('Zirkuläre Abhängigkeit nicht erlaubt!');
          return prev;
        }
      }

      if (targetId && exceedsMaxDepth(next, targetId, 5)) {
        alert('Maximale Verschachtelung erreicht (5 Ebenen)!');
        return prev;
      }

      // Create or move node
      let node: ComponentNode;
      if (payload.kind === 'NEW') {
        const entry = getComponentByType(payload.type);
        if (!entry) return prev;
        node = {
          id: genId(),
          type: entry.type,
          props: { ...entry.defaultProps },
          children: entry.canBeParent ? [] : undefined,
          compName: entry.type,
        };
      } else {
        const removed = removeNode(next, payload.nodeId);
        if (!removed) return prev;
        node = removed;
      }

      // Insert at target
      insertNode(next, targetId, zone, node);

      return next;
    });

    setDragging(null);
    setHover({ targetId: null, zone: null });
  }, []);

  const computeZone = useCallback((e: DragEvent, targetNode: ComponentNode): 'above' | 'below' | 'inside' => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height;

    if (y <= h * 0.25) return 'above';
    if (y >= h * 0.75) return 'below';
    return targetNode.children !== undefined ? 'inside' : 'above';
  }, []);

  // ========================================================================
  // EXTENSION COMMUNICATION
  // ========================================================================

  const saveToExtension = useCallback(() => {
    const serialized = serialize();

    window.vscodeApi?.postMessage({
      type: 'SAVE',
      payload: {
        version: '1.0',
        projectName,
        lastModified: new Date().toISOString(),
        tree: serialized,
        metadata: {},
      },
    });
  }, [serialize, projectName]);

  const loadFromExtension = useCallback(() => {
    window.vscodeApi?.postMessage({ type: 'LOAD_REQUEST' });
  }, []);

  const generateCode = useCallback(() => {
    const serialized = serialize();
    const astroCode = generateAstroFile(serialized, projectName);

    window.vscodeApi?.postMessage({
      type: 'GENERATE_CODE',
      payload: astroCode,
    });
  }, [serialize, projectName]);

  // ========================================================================
  // AUTO-SAVE
  // ========================================================================

  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      saveToExtension();
    }, 2000); // 2 seconds debounce

    return () => clearTimeout(timer);
  }, [tree, isReady, saveToExtension]);

  // ========================================================================
  // RETURN
  // ========================================================================

  return {
    // State
    tree,
    projectName,
    config,
    isReady,
    isValidProject,
    canvasRef,

    // DnD State
    dragging,
    hover,
    setHover,

    // Tree Operations
    addNode,
    deleteNode,
    clearCanvas,
    serialize,

    // DnD Handlers
    handleDragStart,
    handleDrop,
    computeZone,

    // Extension Communication
    saveToExtension,
    loadFromExtension,
    generateCode,
  };
}
```

#### Deliverables:

- [ ] Hook compiles without errors
- [ ] All state management centralized
- [ ] Extension communication works
- [ ] Tree operations functional
- [ ] DnD handlers ready

#### Test:

```tsx
// In Canvas.tsx
const canvas = useCanvas();
console.log(canvas.tree); // Should be []
console.log(canvas.projectName); // Should be project name after INIT
```

---

### PHASE 5: Core UI Components (3h)

**Goal:** Canvas, Toolbar, CanvasArea, Card components.

#### Files to Create:

```
✅ src/ui/src/components/Canvas.tsx (150 lines)
✅ src/ui/src/components/Toolbar.tsx (50 lines)
✅ src/ui/src/components/CanvasArea.tsx (80 lines)
✅ src/ui/src/components/Card.tsx (200 lines)
```

#### Canvas.tsx

```tsx
import { useCanvas } from '../hooks/useCanvas';
import Toolbar from './Toolbar';
import CanvasArea from './CanvasArea';
import '../styles/canvas.css';

export default function Canvas() {
  const canvas = useCanvas();

  if (!canvas.isReady) {
    return <div className="canvas-loading">Lade Canvas...</div>;
  }

  return (
    <div className="app-container">
      <Toolbar onDragStart={canvas.handleDragStart} />

      <div className="canvas-main">
        <div className="canvas-header">
          <h2>{canvas.projectName || 'Canvas'}</h2>
          <div className="canvas-actions">
            <button onClick={canvas.clearCanvas}>Leeren</button>
            <button onClick={canvas.generateCode}>Code generieren</button>
          </div>
        </div>

        <div className="canvas-area" ref={canvas.canvasRef}>
          <CanvasArea
            tree={canvas.tree}
            onDelete={canvas.deleteNode}
            onDrop={canvas.handleDrop}
            onDragStart={canvas.handleDragStart}
          />
        </div>
      </div>
    </div>
  );
}
```

#### Toolbar.tsx

```tsx
import { COMPONENT_PALETTE } from '../utils/componentPalette';
import '../styles/toolbar.css';

interface Props {
  onDragStart: (e: DragEvent, payload: any) => void;
}

export default function Toolbar({ onDragStart }: Props) {
  return (
    <div className="toolbar">
      <h3>Komponenten</h3>
      <div className="toolbar-items">
        {COMPONENT_PALETTE.map(entry => {
          const CardComponent = entry.Component;
          return (
            <CardComponent
              key={entry.type}
              mode="tool"
              type={entry.type}
              label={entry.label}
              icon={entry.icon}
              onDragStart={onDragStart}
            />
          );
        })}
      </div>
    </div>
  );
}
```

#### CanvasArea.tsx

```tsx
import { flattenTree } from '../utils/tree';
import { getComponentByType } from '../utils/componentPalette';
import type { ComponentNode } from '../../../shared/messageProtocol';

interface Props {
  tree: ComponentNode[];
  onDelete: (id: string) => void;
  onDrop: (e: DragEvent, targetId: string | null, zone: 'above' | 'below' | 'inside') => void;
  onDragStart: (e: DragEvent, payload: any) => void;
}

export default function CanvasArea({ tree, onDelete, onDrop, onDragStart }: Props) {
  if (tree.length === 0) {
    return (
      <div className="canvas-empty">
        <p>Canvas ist leer</p>
        <p>Ziehe Komponenten aus der Toolbar hierher</p>
      </div>
    );
  }

  const flattened = flattenTree(tree);

  return (
    <div className="canvas-tree">
      {flattened.map(node => {
        const entry = getComponentByType(node.type);
        if (!entry) return null;

        const CardComponent = entry.Component;

        return (
          <CardComponent
            key={node.id}
            node={node}
            mode="canvas"
            depth={node.depth}
            onDelete={onDelete}
            onDrop={onDrop}
            onDragStart={onDragStart}
          />
        );
      })}
    </div>
  );
}
```

#### Card.tsx (MERGED Component)

```tsx
import { useEffect, useRef } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { ComponentNode } from '../../../shared/messageProtocol';
import '../styles/card.css';

interface Props {
  node?: ComponentNode;
  mode: 'tool' | 'canvas';
  type?: string;
  label?: string;
  icon?: string;
  depth?: number;
  previewContent?: React.ReactNode;
  attributeInputs?: React.ReactNode;
  canBeParent?: boolean;
  onDelete?: (id: string) => void;
  onDrop?: (e: DragEvent, targetId: string | null, zone: 'above' | 'below' | 'inside') => void;
  onDragStart?: (e: DragEvent, payload: any) => void;
}

export default function Card({
  node,
  mode,
  type,
  label,
  icon,
  depth = 0,
  previewContent,
  attributeInputs,
  canBeParent = false,
  onDelete,
  onDrop,
  onDragStart,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Setup Drag
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (mode === 'tool') {
      return draggable({
        element: el,
        getInitialData: () => ({ kind: 'NEW', type }),
      });
    } else if (mode === 'canvas' && node) {
      return draggable({
        element: el,
        getInitialData: () => ({ kind: 'MOVE', nodeId: node.id }),
      });
    }
  }, [mode, type, node]);

  // Setup Drop
  useEffect(() => {
    const el = cardRef.current;
    if (!el || mode !== 'canvas' || !node) return;

    return dropTargetForElements({
      element: el,
      onDrop: ({ source }) => {
        // Compute zone based on drop position
        // Simplified: always 'inside' for now
        onDrop?.(source.data as any, node.id, 'inside');
      },
    });
  }, [mode, node, onDrop]);

  // TOOL MODE: Compact display for toolbar
  if (mode === 'tool') {
    return (
      <div ref={cardRef} className="card-tool">
        <img src={icon} alt={label} className="card-tool-icon" />
        <div className="card-tool-info">
          <h4>{label}</h4>
        </div>
      </div>
    );
  }

  // CANVAS MODE: Full card display
  return (
    <div
      ref={cardRef}
      className="card-canvas"
      data-node-id={node!.id}
      style={{ marginLeft: `${depth * 20}px` }}
    >
      <div className="card-header">
        <img src={icon} alt={label} className="card-icon" />
        <span className="card-name">{label}</span>
        <button className="card-delete" onClick={() => onDelete?.(node!.id)}>
          X
        </button>
      </div>

      {/* Preview (5/6 of card height) */}
      <div className="card-preview">
        {previewContent}
      </div>

      {/* Attributes (<details>) */}
      <details className="card-attributes">
        <summary>Attribute bearbeiten</summary>
        <form data-comp-name={node!.compName}>
          {attributeInputs}
        </form>
      </details>

      {/* Drop Zone (only for parents) */}
      {canBeParent && node!.children && (
        <div className="card-dropzone">
          {node!.children.length === 0 && (
            <div className="dropzone-empty">Ziehe Komponenten hierher</div>
          )}
        </div>
      )}
    </div>
  );
}
```

#### Deliverables:

- [ ] Canvas renders without errors
- [ ] Toolbar shows all cards (from palette)
- [ ] CanvasArea renders tree
- [ ] Card component handles both modes

#### Test:

- Canvas opens
- Toolbar shows components
- Empty state displays
- No console errors

---

### PHASE 6: Input Components (1h)

**Goal:** Reusable form input components.

#### Files to Create:

```
✅ src/ui/src/inputs/SimpleInput.tsx (30 lines)
✅ src/ui/src/inputs/Checkbox.tsx (25 lines)
✅ src/ui/src/inputs/TripleInput.tsx (40 lines)
```

#### SimpleInput.tsx

```tsx
interface Props {
  name: string;
  label: string;
  type?: string;
  defaultValue?: string;
}

export default function SimpleInput({ name, label, type = 'text', defaultValue }: Props) {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        defaultValue={defaultValue}
      />
    </div>
  );
}
```

#### Checkbox.tsx

```tsx
interface Props {
  name: string;
  label: string;
  defaultChecked?: boolean;
}

export default function Checkbox({ name, label, defaultChecked }: Props) {
  return (
    <div className="form-group form-group-checkbox">
      <label>
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
        />
        {label}
      </label>
    </div>
  );
}
```

#### TripleInput.tsx

```tsx
interface Props {
  namePrefix: string;
  labels: [string, string, string];
  defaultValues?: [string, string, string];
}

export default function TripleInput({
  namePrefix,
  labels,
  defaultValues = ['', '', '']
}: Props) {
  return (
    <div className="form-group form-group-triple">
      <div className="triple-input">
        {labels.map((label, i) => (
          <div key={i} className="triple-input-item">
            <label>{label}</label>
            <input
              type="text"
              name={`${namePrefix}_${i + 1}`}
              defaultValue={defaultValues[i]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Deliverables:

- [ ] All 3 input components implemented
- [ ] Styled and functional
- [ ] Accessible (labels, IDs)

#### Test:

```tsx
<SimpleInput name="test" label="Test" defaultValue="foo" />
<Checkbox name="test2" label="Check me" defaultChecked={true} />
<TripleInput namePrefix="triple" labels={['A', 'B', 'C']} />
```

---

### PHASE 7: Concrete Cards (BULK WORK) (8h)

**Goal:** Implement all 22 card components.

#### Template for Each Card:

```tsx
import Card from '../components/Card';
import SimpleInput from '../inputs/SimpleInput';
import Checkbox from '../inputs/Checkbox';
import icon from '../../public/icons/[CARD_NAME].svg';
import type { ComponentNode } from '../../../shared/messageProtocol';

interface Props {
  node?: ComponentNode;
  mode: 'tool' | 'canvas';
  type?: string;
  label?: string;
  icon?: string;
  depth?: number;
  onDelete?: (id: string) => void;
  onDrop?: (e: DragEvent, targetId: string | null, zone: any) => void;
  onDragStart?: (e: DragEvent, payload: any) => void;
}

export default function [CardName]Card(props: Props) {
  const { node, mode } = props;

  return (
    <Card
      {...props}
      type="[CardType]"
      label="[Card Label]"
      icon={icon}
      canBeParent={[true/false]}
      previewContent={
        <div className="[card-type]-preview">
          {/* Card-specific HTML preview */}
        </div>
      }
      attributeInputs={
        <>
          <SimpleInput name="id" label="ID" defaultValue={node?.props.id} />
          {/* Card-specific inputs */}
        </>
      }
    />
  );
}
```

#### List of 22 Cards to Implement:

**Input Components (Leafs):**

1. **SimpleInputCard**
   - Props: id, label, type, klasse, value, required, hidden, maxlength, disabled
   - Preview: `<label><input />`

2. **SimpleTextfieldCard**
   - Props: id, label, row, col, value, required, maxlength, klasse, hidden
   - Preview: `<label><textarea />`

3. **SimpleSelectCard**
   - Props: id, label, name, klasse, hidden, required
   - Preview: `<label><select>`

4. **RadioButtonCard**
   - Props: id, name, value, label, required, hidden
   - Preview: `<label><input type="radio" />`

5. **SuggestionInputCard**
   - Props: id, label, hidden, klasse
   - Preview: `<label><input list><datalist>`

6. **GatekeeperSelectCard**
   - Props: id, label, hidden
   - Preview: `<label><select>`

7. **SQLinjectionSelectCard**
   - Props: id, label, hidden
   - Preview: `<label><select>`

**Container Components (Parents):**

8. **SimpleFieldsetCard** ⭐ Parent
   - Props: legend, id, klasse, hidden
   - Preview: `<fieldset><legend>`
   - canBeParent: true

9. **ConBlockCard** ⭐ Parent
   - Props: id, If, klasse, hidden
   - Preview: `<div>[Conditional Container]`
   - canBeParent: true

10. **GateCard** ⭐ Parent
    - Props: id, klasse, hidden
    - Preview: `<div>[Gate Container]`
    - canBeParent: true

11. **GateGroupCard** ⭐ Parent
    - Props: id, klasse, hidden
    - Preview: `<div>[GateGroup Container]`
    - canBeParent: true

12. **TabWrapperCard** ⭐ Parent
    - Props: id, hidden
    - Preview: `<form>[TabWrapper]`
    - canBeParent: true

13. **TabPageCard** ⭐ Parent
    - Props: id, title, hidden
    - Preview: `<section>[TabPage]`
    - canBeParent: true

**Button Components:**

14. **WeiterButtonCard**
    - Props: id, label, hidden
    - Preview: `<button>Weiter</button>`

15. **FinishButtonCard**
    - Props: id, label, hidden
    - Preview: `<button>Abschliessen</button>`

16. **RecordButtonCard**
    - Props: id, label, hidden
    - Preview: `<button>Aufzeichnen</button>`

**Display Components:**

17. **BildCard**
    - Props: dateiname
    - Preview: `<div>[Bild: filename]`

18. **NavTabsCard**
    - Props: id, tabs
    - Preview: `<div>[NavTabs]`

19. **CustomerCellsCard**
    - Props: id, data
    - Preview: `<div>[CustomerCells]`

20. **DebugLogCard**
    - Props: id, hidden
    - Preview: `<div>[DebugLog]`

21. **FootButtonsCard**
    - Props: id
    - Preview: `<div>[FootButtons]`

22. **PopupsCard**
    - Props: id
    - Preview: `<div>[Popups]`

#### Deliverables:

- [ ] All 22 cards implemented
- [ ] Each card has correct props
- [ ] Each card has meaningful preview
- [ ] Parent cards marked with canBeParent: true

#### Test:

- Each card appears in Toolbar
- Each card can be dragged to Canvas
- Each card shows preview
- Each card's attribute form works

---

### PHASE 8: Component Palette (1h)

**Goal:** Populate componentPalette.tsx with all 22 cards.

#### File to Update:

```
✅ src/ui/src/utils/componentPalette.tsx
```

#### Structure:

```tsx
import SimpleInputCard from '../cards/SimpleInputCard';
import SimpleTextfieldCard from '../cards/SimpleTextfieldCard';
// ... all 22 imports

export const COMPONENT_PALETTE: ComponentPaletteEntry[] = [
  {
    type: 'SimpleInput',
    label: 'Simple Input',
    icon: '/icons/simple-input.svg',
    description: 'Einfaches Textfeld',
    canBeParent: false,
    defaultProps: { id: '', label: '', type: 'text' },
    codeGen: '<SimpleInput id="" label="" type="text" />',
    Component: SimpleInputCard,
  },
  {
    type: 'SimpleTextfield',
    label: 'Simple Textfield',
    icon: '/icons/simple-textfield.svg',
    description: 'Mehrzeiliges Textfeld',
    canBeParent: false,
    defaultProps: { id: '', label: '', row: '3', col: '50' },
    codeGen: '<SimpleTextfield id="" label="" row="3" col="50" />',
    Component: SimpleTextfieldCard,
  },
  // ... 20 more entries
];
```

#### Deliverables:

- [ ] All 22 cards registered in palette
- [ ] Each entry has correct metadata
- [ ] Icons specified (even if placeholders)

#### Test:

```tsx
const entry = getComponentByType('SimpleInput');
console.log(entry); // Should return entry with Component
```

---

### PHASE 9: Drag & Drop Integration (4h)

**Goal:** Full DnD functionality with pragmatic-drag-and-drop.

#### Files to Update:

```
✅ src/ui/src/components/Card.tsx (DnD setup)
✅ src/ui/src/hooks/useCanvas.ts (handleDrop implementation)
✅ src/ui/src/components/CanvasArea.tsx (Root drop target)
```

#### Key Implementations:

**Card.tsx - Drag Setup:**
```tsx
// Tool Mode: NEW drag
useEffect(() => {
  const el = cardRef.current;
  if (!el || mode !== 'tool') return;

  return draggable({
    element: el,
    getInitialData: () => ({ kind: 'NEW', type }),
    onDragStart: () => {
      el.classList.add('dragging');
    },
    onDrop: () => {
      el.classList.remove('dragging');
    },
  });
}, [mode, type]);

// Canvas Mode: MOVE drag
useEffect(() => {
  const el = cardRef.current;
  if (!el || mode !== 'canvas' || !node) return;

  return draggable({
    element: el,
    getInitialData: () => ({ kind: 'MOVE', nodeId: node.id }),
    onDragStart: () => {
      el.classList.add('dragging');
    },
    onDrop: () => {
      el.classList.remove('dragging');
    },
  });
}, [mode, node]);

// Canvas Mode: Drop Target
useEffect(() => {
  const el = cardRef.current;
  if (!el || mode !== 'canvas' || !node) return;

  return dropTargetForElements({
    element: el,
    onDrop: ({ source, location }) => {
      const payload = source.data;
      const zone = computeZone(location, node);
      onDrop?.(payload, node.id, zone);
    },
    onDragEnter: () => {
      el.classList.add('drag-over');
    },
    onDragLeave: () => {
      el.classList.remove('drag-over');
    },
  });
}, [mode, node, onDrop]);
```

**useCanvas.ts - Zone Computation:**
```tsx
const computeZone = useCallback((location: any, targetNode: ComponentNode): 'above' | 'below' | 'inside' => {
  const rect = location.target.getBoundingClientRect();
  const y = location.current.clientY - rect.top;
  const h = rect.height;

  const topZone = h * 0.25;
  const bottomZone = h * 0.75;

  if (y <= topZone) return 'above';
  if (y >= bottomZone) return 'below';
  return targetNode.children !== undefined ? 'inside' : 'above';
}, []);
```

**useCanvas.ts - Drop Handler with Validation:**
```tsx
const handleDrop = useCallback((payload: any, targetId: string | null, zone: 'above' | 'below' | 'inside') => {
  setTree(prev => {
    const next = cloneDeep(prev);

    // Validation: Circular dependency
    if (payload.kind === 'MOVE' && targetId) {
      if (payload.nodeId === targetId) return prev;
      if (isDescendant(next, targetId, payload.nodeId)) {
        alert('Zirkuläre Abhängigkeit nicht erlaubt!');
        return prev;
      }
    }

    // Validation: Max depth
    if (targetId && exceedsMaxDepth(next, targetId, 5)) {
      alert('Maximale Verschachtelung erreicht (5 Ebenen)!');
      return prev;
    }

    // Create or remove node
    let node: ComponentNode;
    if (payload.kind === 'NEW') {
      const entry = getComponentByType(payload.type);
      if (!entry) return prev;
      node = {
        id: genId(),
        type: entry.type,
        props: { ...entry.defaultProps },
        children: entry.canBeParent ? [] : undefined,
        compName: entry.type,
      };
    } else {
      const removed = removeNode(next, payload.nodeId);
      if (!removed) return prev;
      node = removed;
    }

    // Insert node
    if (!targetId) {
      next.push(node); // Root level
    } else {
      const found = findNodeAndParent(next, targetId);
      if (!found) return prev;

      if (zone === 'inside' && found.node.children !== undefined) {
        insertChild(found.node, node);
      } else {
        insertSibling(next, found, node, zone);
      }
    }

    return next;
  });

  setDragging(null);
}, []);
```

#### Deliverables:

- [ ] Drag from Toolbar works
- [ ] Drag within Canvas works
- [ ] Drop zones highlighted on hover
- [ ] Validation prevents invalid drops
- [ ] Max depth enforced
- [ ] Circular dependencies blocked

#### Test:

- Drag SimpleInput from Toolbar → Canvas (NEW)
- Drag SimpleInput within Canvas (MOVE)
- Drag SimpleFieldset from Toolbar
- Drag SimpleInput into SimpleFieldset (Parent)
- Try to drag SimpleFieldset into itself → Error
- Try to nest 6 levels deep → Error

---

### PHASE 10: Serialization & Save/Load (2h)

**Goal:** Auto-save, manual save, load from .ttEditor.json.

#### Files to Update:

```
✅ src/ui/src/components/Canvas.tsx (Auto-save useEffect)
✅ src/ui/src/hooks/useCanvas.ts (saveToExtension, loadFromExtension)
✅ src/extension/webview.ts (SAVE/LOAD handlers)
```

#### Canvas.tsx - Auto-Save:

```tsx
// Auto-save after 2 seconds of inactivity
useEffect(() => {
  if (!canvas.isReady) return;

  const timer = setTimeout(() => {
    canvas.saveToExtension();
  }, 2000);

  return () => clearTimeout(timer);
}, [canvas.tree, canvas.isReady]);
```

#### useCanvas.ts - Save/Load:

```tsx
const saveToExtension = useCallback(() => {
  const serialized = serializeTree(tree, canvasRef.current);

  const config: ProjectConfig = {
    version: '1.0',
    projectName,
    lastModified: new Date().toISOString(),
    tree: serialized,
    metadata: {},
  };

  window.vscodeApi?.postMessage({
    type: 'SAVE',
    payload: config,
  });
}, [tree, projectName]);

const loadFromExtension = useCallback(() => {
  window.vscodeApi?.postMessage({ type: 'LOAD_REQUEST' });
}, []);
```

#### webview.ts - Message Handlers:

```typescript
async function handleSave(config: ProjectConfig, workspaceRoot: string): Promise<void> {
  try {
    if (!validateProjectConfig(config)) {
      throw new Error('Invalid project configuration');
    }

    const configPath = path.join(workspaceRoot, CONFIG_FILENAME);
    fs.writeFileSync(
      configPath,
      JSON.stringify(config, null, 2),
      'utf-8'
    );

    console.log('Saved:', configPath);
    panel.webview.postMessage({
      type: 'SAVE_SUCCESS',
      filePath: configPath,
    });
  } catch (err) {
    console.error('Save failed:', err);
    panel.webview.postMessage({
      type: 'ERROR',
      message: `Save failed: ${err}`,
    });
  }
}

async function handleLoad(workspaceRoot: string): Promise<void> {
  try {
    const configPath = path.join(workspaceRoot, CONFIG_FILENAME);

    if (!fs.existsSync(configPath)) {
      panel.webview.postMessage({
        type: 'ERROR',
        message: 'No saved configuration found',
      });
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

    if (!validateProjectConfig(config)) {
      throw new Error('Corrupt configuration file');
    }

    panel.webview.postMessage({
      type: 'LOAD_RESPONSE',
      payload: config,
    });
  } catch (err) {
    console.error('Load failed:', err);
    panel.webview.postMessage({
      type: 'ERROR',
      message: `Load failed: ${err}`,
    });
  }
}
```

#### Deliverables:

- [ ] Changes auto-save after 2 seconds
- [ ] .ttEditor.json created/updated
- [ ] Manual save button works
- [ ] Load button works
- [ ] Canvas restores saved state
- [ ] Validation prevents corrupt saves

#### Test:

1. Add 3 cards to canvas
2. Wait 2 seconds
3. Check: .ttEditor.json exists
4. Close canvas
5. Reopen canvas
6. Check: 3 cards are restored

---

### PHASE 11: Code Generation (2h)

**Goal:** Generate valid Astro code from canvas tree.

#### Files to Update:

```
✅ src/ui/src/utils/serialization.ts (generateAstroFile)
✅ src/ui/src/hooks/useCanvas.ts (generateCode)
✅ src/extension/webview.ts (GENERATE_CODE handler)
```

#### serialization.ts - Astro Generation:

```typescript
export function renderAstroNode(node: ComponentNode, depth: number = 0): string {
  const indent = '  '.repeat(depth);
  const tag = node.compName;

  // Format props (filter empty/false)
  const props = Object.entries(node.props)
    .filter(([_, v]) => v !== '' && v !== false && v !== null && v !== undefined)
    .map(([k, v]) => {
      if (typeof v === 'boolean') return k; // Boolean without value
      return `${k}="${v}"`;
    })
    .join(' ');

  // Recursive children
  const children = node.children
    ?.map(c => renderAstroNode(c, depth + 1))
    .join('\n');

  if (children) {
    return `${indent}<${tag}${props ? ' ' + props : ''}>\n${children}\n${indent}</${tag}>`;
  }

  return `${indent}<${tag}${props ? ' ' + props : ''} />`;
}

export function generateAstroFile(tree: ComponentNode[], projectName: string): string {
  const components = tree.map(node => renderAstroNode(node, 1)).join('\n');

  return `---
// ${projectName} - Generated by ttEditor-LC
// Generated: ${new Date().toISOString()}
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

#### useCanvas.ts - Trigger Generation:

```tsx
const generateCode = useCallback(() => {
  const serialized = serializeTree(tree, canvasRef.current);
  const astroCode = generateAstroFile(serialized, projectName);

  window.vscodeApi?.postMessage({
    type: 'GENERATE_CODE',
    payload: astroCode,
  });
}, [tree, projectName]);
```

#### webview.ts - Write File:

```typescript
async function handleGenerateCode(astroCode: string, workspaceRoot: string): Promise<void> {
  try {
    const outputPath = path.join(workspaceRoot, 'index.astro');
    fs.writeFileSync(outputPath, astroCode, 'utf-8');

    vscode.window.showInformationMessage(`Astro code generated: ${outputPath}`);

    // Open generated file
    const doc = await vscode.workspace.openTextDocument(outputPath);
    await vscode.window.showTextDocument(doc);
  } catch (err) {
    console.error('Code generation failed:', err);
    vscode.window.showErrorMessage(`Code generation failed: ${err}`);
  }
}
```

#### Deliverables:

- [ ] "Code generieren" button works
- [ ] index.astro file created
- [ ] Valid Astro syntax
- [ ] Props formatted correctly
- [ ] Nesting preserved
- [ ] File opens automatically

#### Test:

1. Create canvas with:
   - SimpleFieldset
     - SimpleInput (child)
     - SimpleTextfield (child)
   - WeiterButton
2. Click "Code generieren"
3. Check index.astro:
   ```astro
   <html>
     <body>
       <SimpleFieldset legend="My Fieldset">
         <SimpleInput id="input1" label="Name" />
         <SimpleTextfield id="textarea1" label="Description" />
       </SimpleFieldset>
       <WeiterButton label="Weiter" />
     </body>
   </html>
   ```

---

### PHASE 12: Styling & Polish (3h)

**Goal:** Professional UI with responsive layout, hover states, transitions.

#### Files to Create/Update:

```
✅ src/ui/src/index.css (Global styles - 200 lines)
✅ src/ui/src/styles/canvas.css (Canvas-specific - 100 lines)
✅ src/ui/src/styles/toolbar.css (Toolbar-specific - 80 lines)
✅ src/ui/src/styles/card.css (Card-specific - 150 lines)
```

#### index.css - Global Styles:

```css
:root {
  /* Colors */
  --color-primary: #4a90e2;
  --color-primary-dark: #357abd;
  --color-danger: #e74c3c;
  --color-danger-dark: #c0392b;
  --color-success: #27ae60;
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
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-size-xs: 11px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;

  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.15);
  --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.2);

  /* Transitions */
  --transition-fast: 0.15s ease;
  --transition-base: 0.2s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  line-height: 1.6;
  overflow: hidden;
}

.app-container {
  display: flex;
  height: 100vh;
}

button {
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  border: none;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);
}

button:hover {
  opacity: 0.9;
}

button:active {
  transform: translateY(1px);
}
```

#### canvas.css:

```css
.canvas-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.canvas-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-light);
}

.canvas-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
}

.canvas-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.canvas-actions button {
  background: var(--color-primary);
  color: white;
}

.canvas-actions button:hover {
  background: var(--color-primary-dark);
}

.canvas-area {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.canvas-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
}

.canvas-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-size: var(--font-size-lg);
}
```

#### toolbar.css:

```css
.toolbar {
  width: 250px;
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  background: var(--color-bg-light);
}

.toolbar h3 {
  padding: var(--spacing-lg);
  margin: 0;
  font-size: var(--font-size-lg);
  border-bottom: 1px solid var(--color-border);
}

.toolbar-items {
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
```

#### card.css:

```css
/* Tool Mode */
.card-tool {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  cursor: grab;
  transition: all var(--transition-fast);
}

.card-tool:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.card-tool:active {
  cursor: grabbing;
}

.card-tool.dragging {
  opacity: 0.5;
}

.card-tool-icon {
  width: 24px;
  height: 24px;
}

.card-tool-info h4 {
  font-size: var(--font-size-base);
  font-weight: 600;
}

/* Canvas Mode */
.card-canvas {
  border: 2px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg);
  margin-bottom: var(--spacing-md);
  cursor: grab;
  transition: all var(--transition-fast);
}

.card-canvas:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-md);
}

.card-canvas:active {
  cursor: grabbing;
}

.card-canvas.dragging {
  opacity: 0.5;
}

.card-canvas.drag-over {
  border-color: var(--color-success);
  border-style: dashed;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-dark);
}

.card-icon {
  width: 20px;
  height: 20px;
}

.card-name {
  flex: 1;
  font-weight: 600;
  font-size: var(--font-size-base);
}

.card-delete {
  background: var(--color-danger);
  color: white;
  padding: 4px 8px;
  font-size: var(--font-size-xs);
}

.card-delete:hover {
  background: var(--color-danger-dark);
}

/* Preview (5/6 height) */
.card-preview {
  min-height: 100px;
  max-height: 200px;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  overflow: auto;
}

/* Attributes */
.card-attributes {
  border-top: 1px solid var(--color-border);
}

.card-attributes summary {
  padding: var(--spacing-sm) var(--spacing-md);
  cursor: pointer;
  font-weight: 600;
  user-select: none;
}

.card-attributes summary:hover {
  background: var(--color-bg-light);
}

.card-attributes form {
  padding: var(--spacing-md);
  background: var(--color-bg-light);
}

.form-group {
  margin-bottom: var(--spacing-md);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
  font-size: var(--font-size-sm);
}

.form-group input[type="text"],
.form-group input[type="number"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--font-size-sm);
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group-checkbox label {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: normal;
}

/* Drop Zone */
.card-dropzone {
  min-height: 60px;
  padding: var(--spacing-sm);
  border-top: 2px dashed var(--color-border-light);
  background: var(--color-bg-dark);
}

.dropzone-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #999;
  font-size: var(--font-size-sm);
}

.dropzone-empty:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
}

/* Triple Input */
.triple-input {
  display: flex;
  gap: var(--spacing-sm);
}

.triple-input-item {
  flex: 1;
}
```

#### Deliverables:

- [ ] Professional look & feel
- [ ] Hover states on all interactive elements
- [ ] Drag feedback (cursor, opacity)
- [ ] Drop zone highlighting
- [ ] Responsive layout
- [ ] Accessible (focus states)

#### Test:

- UI looks polished
- Hover effects work
- Dragging shows visual feedback
- Drop zones highlight correctly
- No layout bugs

---

### PHASE 13: Icons & Assets (1h)

**Goal:** Add icons for all 22 cards.

#### Tasks:

1. **Source Icons:**
   - Option A: Use Material Icons (Google)
   - Option B: Use Feather Icons
   - Option C: Create custom SVGs
   - Option D: Use placeholders (colored squares)

2. **Create Icons Directory:**
   ```
   src/ui/public/icons/
   ├── simple-input.svg
   ├── simple-textfield.svg
   ├── simple-select.svg
   ├── radio-button.svg
   ├── suggestion-input.svg
   ├── gatekeeper-select.svg
   ├── sqlinjection-select.svg
   ├── simple-fieldset.svg
   ├── con-block.svg
   ├── gate.svg
   ├── gate-group.svg
   ├── tab-wrapper.svg
   ├── tab-page.svg
   ├── weiter-button.svg
   ├── finish-button.svg
   ├── record-button.svg
   ├── bild.svg
   ├── nav-tabs.svg
   ├── customer-cells.svg
   ├── debug-log.svg
   ├── foot-buttons.svg
   └── popups.svg
   ```

3. **Update componentPalette.tsx:**
   - Update all icon paths
   - Test icon loading

4. **Placeholder SVGs (if needed):**
   ```svg
   <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
     <rect width="24" height="24" fill="#4a90e2" rx="3"/>
     <text x="12" y="16" text-anchor="middle" fill="white" font-size="12">I</text>
   </svg>
   ```

#### Deliverables:

- [ ] All 22 icons created/sourced
- [ ] Icons stored in public/icons/
- [ ] Palette updated with correct paths
- [ ] Icons display in Toolbar
- [ ] Icons display in Canvas cards

#### Test:

- Open Toolbar → All cards show icons
- Drag card to Canvas → Icon shows in header
- No broken image icons

---

## TESTING STRATEGY

### After Each Phase:

```bash
# 1. Compile Extension
npm run compile

# 2. Build UI
cd src/ui && npm run build && cd ../..

# 3. Reload Extension Development Host
# Press F5 in VSCode or Reload Window

# 4. Run Phase-Specific Tests (see phase deliverables)

# 5. Check Console for Errors
# Both Extension Host Console AND Webview DevTools Console

# 6. Commit if Successful
git add .
git commit -m "Phase X: [Description]"
```

### Integration Test Checklist (After Phase 13):

#### Extension Level:
- [ ] Extension activates without errors
- [ ] Sidebar shows project status
- [ ] "Canvas öffnen" command works
- [ ] Webview panel opens
- [ ] No errors in Extension Host console

#### UI Level:
- [ ] React app renders
- [ ] Toolbar visible with all 22 cards
- [ ] All cards show icons
- [ ] Canvas shows empty state
- [ ] No errors in Webview console

#### Drag & Drop:
- [ ] Drag from Toolbar to Canvas (NEW)
- [ ] Card appears on Canvas
- [ ] Card shows preview content
- [ ] Drag within Canvas (MOVE)
- [ ] Card changes position
- [ ] Drag into Parent card (INSIDE)
- [ ] Card becomes child
- [ ] Max depth validation works
- [ ] Circular dependency blocked

#### Forms & Attributes:
- [ ] Click "Attribute bearbeiten"
- [ ] Details expand
- [ ] All inputs visible
- [ ] Can type in text inputs
- [ ] Can toggle checkboxes
- [ ] Values persist

#### Save & Load:
- [ ] Add 5 cards to canvas
- [ ] Edit attributes
- [ ] Wait 2 seconds
- [ ] .ttEditor.json created
- [ ] Close Canvas
- [ ] Reopen Canvas
- [ ] All 5 cards restored
- [ ] All attributes preserved

#### Code Generation:
- [ ] Create nested structure:
  - SimpleFieldset
    - SimpleInput (child)
    - SimpleTextfield (child)
  - WeiterButton
- [ ] Click "Code generieren"
- [ ] index.astro created
- [ ] File opens automatically
- [ ] Astro syntax valid
- [ ] Nesting preserved
- [ ] Props formatted correctly

#### Performance:
- [ ] Add 20 cards to canvas
- [ ] No lag when dragging
- [ ] No lag when scrolling
- [ ] Auto-save doesn't freeze UI

#### Edge Cases:
- [ ] Empty canvas saves correctly
- [ ] Delete all cards works
- [ ] Undo/Redo (if implemented)
- [ ] Large trees (50+ nodes) work

---

## EFFORT ESTIMATION

| Phase | Task | Hours | Risk | Priority |
|-------|------|-------|------|----------|
| 1 | Extension Foundation | 2h | Low | Critical |
| 2 | React UI Setup | 1h | Low | Critical |
| 3 | Utils & Core Logic | 3h | Medium | Critical |
| 4 | useCanvas Mega-Hook | 4h | High | Critical |
| 5 | Core UI Components | 3h | Medium | Critical |
| 6 | Input Components | 1h | Low | Critical |
| 7 | 22 Card Implementations | 8h | Medium | Critical |
| 8 | Component Palette | 1h | Low | Critical |
| 9 | Drag & Drop Integration | 4h | High | Critical |
| 10 | Serialization & Save/Load | 2h | Medium | Critical |
| 11 | Code Generation | 2h | Low | Critical |
| 12 | Styling & Polish | 3h | Low | Nice-to-Have |
| 13 | Icons & Assets | 1h | Low | Nice-to-Have |

**Total Effort:** 35 hours (~5 full working days)

**Critical Path:** Phases 1-11 (31 hours)
**Polish:** Phases 12-13 (4 hours)

---

## CRITICAL SUCCESS FACTORS

### 1. No Emojis (Textual Icons Only)

```typescript
// ❌ WRONG
const ICON = '📁';

// ✅ RIGHT
const ICON = '[P]';  // Or use actual SVG/PNG
```

### 2. All Constants in constants.ts

```typescript
// ❌ WRONG
if (depth >= 5) { ... }
setTimeout(() => { ... }, 2000);

// ✅ RIGHT
import { MAX_TREE_DEPTH, AUTOSAVE_DELAY_MS } from '@/shared/constants';
if (depth >= MAX_TREE_DEPTH) { ... }
setTimeout(() => { ... }, AUTOSAVE_DELAY_MS);
```

### 3. Immutability Pattern

```typescript
// ❌ WRONG (mutates state directly)
tree[0].props.id = 'new-id';
setTree(tree);

// ✅ RIGHT (clone first)
const next = cloneDeep(tree);
next[0].props.id = 'new-id';
setTree(next);
```

### 4. vscodeApi Only Once

```typescript
// In webview.ts (Extension Host):
<script>window.vscodeApi = acquireVsCodeApi();</script>

// In React (UI):
window.vscodeApi.postMessage({ ... });  // Don't call acquireVsCodeApi() again!
```

### 5. Vite Config base: './'

```typescript
// CRITICAL for VSCode Webviews!
export default defineConfig({
  base: './',  // Without this: Assets won't load!
  // ...
});
```

### 6. Test After EVERY Phase

Don't implement 5 phases at once → Debugging hell!

After each phase:
1. Compile
2. Build
3. Test
4. Commit

### 7. Form Data Extraction

```typescript
// Forms MUST have data-comp-name attribute
<form data-comp-name="SimpleInput">
  <input name="id" />
  <input name="label" />
</form>

// Extraction uses this attribute:
const compName = formEl.getAttribute('data-comp-name');
```

### 8. Tree Depth Validation

```typescript
// MUST validate BEFORE inserting
if (exceedsMaxDepth(tree, targetId, MAX_TREE_DEPTH)) {
  alert('Max depth reached!');
  return;
}
```

### 9. Circular Dependency Check

```typescript
// MUST validate BEFORE moving
if (isDescendant(tree, targetId, movingNodeId)) {
  alert('Circular dependency!');
  return;
}
```

### 10. Extension Context Variable

```typescript
// Set context to enable/disable commands
vscode.commands.executeCommand('setContext', 'ttEditor.projectValid', true);

// In package.json:
"enablement": "ttEditor.projectValid"
```

---

## FINAL CHECKLIST

### Pre-Implementation:
- [ ] VSCode installed
- [ ] Node.js 18+ installed
- [ ] Git initialized
- [ ] Workspace folder created
- [ ] .astro directory exists (for testing)

### After Phases 1-6 (Core Setup):
- [ ] Extension activates
- [ ] Webview opens
- [ ] React app renders
- [ ] useCanvas hook functional
- [ ] Core components render

### After Phases 7-9 (Cards & DnD):
- [ ] All 22 cards implemented
- [ ] Toolbar shows all cards
- [ ] Drag & Drop works
- [ ] Drop zones functional
- [ ] Validation prevents errors

### After Phases 10-11 (Persistence):
- [ ] Save/Load works
- [ ] .ttEditor.json valid
- [ ] Auto-save functional
- [ ] Code generation works
- [ ] index.astro valid

### After Phases 12-13 (Polish):
- [ ] Styling complete
- [ ] Icons loaded
- [ ] Professional appearance
- [ ] No layout bugs

### Final Release:
- [ ] All integration tests pass
- [ ] No console errors
- [ ] Performance acceptable (30+ FPS)
- [ ] README written
- [ ] CHANGELOG created
- [ ] Git repository clean
- [ ] All phases committed

---

## APPENDIX: Key Differences from Original Plan

### What Changed:

1. **Card Registry → Component Palette Array**
   - REMOVED: cardRegistry.ts, registerCard() calls
   - ADDED: Simple array in componentPalette.tsx

2. **3 Hooks → 1 Hook**
   - REMOVED: useExtensionBridge, useTreeOperations, useDragAndDrop
   - ADDED: Single useCanvas hook (300 lines)

3. **8 Card Components → 1 Card Component**
   - REMOVED: CardBase, CardTool, CardPreview, CardAttributes, CardDropZone
   - ADDED: Single Card.tsx with inline sub-components

4. **4 Utils → 3 Utils**
   - REMOVED: domSerializer.ts, astroCodeGen.ts (separate)
   - ADDED: serialization.ts (merged)

5. **Recursive Rendering → Flattened Rendering**
   - REMOVED: Recursive CanvasArea calls
   - ADDED: flattenTree() utility, simple .map()

### Why These Changes?

- **Simpler architecture** (38% fewer files)
- **Less abstraction** (no over-engineering)
- **Easier to debug** (fewer layers)
- **Better performance** (flattened tree)
- **YAGNI principle** (no unused patterns)

### Result:

Same functionality, drastically reduced complexity.

---

## NEXT STEPS

Ready to start implementation?

1. Review this plan
2. Ask questions if anything is unclear
3. Start with Phase 1 (Extension Foundation)
4. Test after EACH phase
5. Commit after each successful phase

**Let's build this! 🚀**
