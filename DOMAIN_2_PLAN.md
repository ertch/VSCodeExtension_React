# Domain 2 - Type System & Utilities: Architecture Plan

**Datum:** 2025-11-07
**Status:** Initial Plan (vor Architekt-Review)
**Ziel:** Type-Safety erhöhen, Code-Duplikation eliminieren, Testbarkeit verbessern

---

## Executive Summary

Refactoring von **368 LOC → ~308 LOC** in 7→10 Dateien mit folgenden Zielen:

1. ✅ **Type-Safety:** `any` eliminieren, Branded Types, Generics
2. ✅ **DRY:** 99% Duplikation bei Downloads eliminieren
3. ✅ **Separation of Concerns:** tabState.ts (231 LOC) in 3 Files splitten
4. ✅ **Testbarkeit:** Pure Functions, DOM-Abstraktion
5. ✅ **Zod Integration:** Runtime Validation wie Domain 1

---

## Architecture Overview

### Neue Struktur

```
New_Project/src/
├── types/
│   ├── index.ts                    # Barrel Export
│   ├── palette.types.ts            # Palette Types (branded)
│   ├── canvas.types.ts             # Canvas, TreeNode, DropPayload
│   ├── canvas.validation.ts        # Zod Schemas für TreeNode
│   └── vscode.types.ts             # VSCode API (generic)
│
├── state/
│   ├── index.ts                    # Barrel Export
│   ├── tabState.types.ts           # TabData, TabState, FIXED_TABS
│   ├── tabState.reducers.ts        # Pure Reducers (8 functions)
│   └── tabState.utils.ts           # Helpers & Validation
│
└── utils/
    ├── index.ts                    # Barrel Export
    ├── download.ts                 # Generic downloadFile()
    └── extractInputs.ts            # Refactored DOM extraction
```

---

## Detailed File Plans

### 1. types/palette.types.ts (~15 LOC)

**Purpose:** Type-safe Palette Entry definitions mit Branded Types

```typescript
/**
 * Branded Type for Component Type Identifiers
 * Prevents mixing component types with regular strings
 */
export type ComponentType = string & { readonly __brand: unique symbol };

export function createComponentType(type: string): ComponentType {
  return type as ComponentType;
}

/**
 * Palette Entry with strict typing
 */
export interface PaletteEntry<TProps = Record<string, unknown>> {
  type: ComponentType;
  label: string;
  canHaveChildren: boolean;
  Component: React.FC<TProps>;
}

/**
 * Type guard for ComponentType
 */
export function isComponentType(value: unknown): value is ComponentType {
  return typeof value === 'string' && value.length > 0;
}
```

**Changes from v1.0:**
- ❌ `type: string` → ✅ `type: ComponentType` (branded)
- ❌ `TProps = {}` → ✅ `TProps = Record<string, unknown>`
- ✅ Helper: `createComponentType()`, `isComponentType()`

**LOC:** 7 → 15 (+8, mehr Type-Safety)

---

### 2. types/canvas.types.ts (~40 LOC)

**Purpose:** Canvas & TreeNode Types ohne Validation

```typescript
import { ComponentType } from './palette.types';
import { EntityInputs } from '../generator/types'; // From Domain 1

/**
 * Branded Type for Node IDs
 */
export type NodeId = string & { readonly __brand: unique symbol };

export function createNodeId(): NodeId {
  return `node_${Date.now()}_${Math.random().toString(36)}` as NodeId;
}

export function isNodeId(value: unknown): value is NodeId {
  return typeof value === 'string' && value.startsWith('node_');
}

/**
 * TreeNode with strict typing (uses EntityInputs from Domain 1)
 */
export interface TreeNode {
  id: NodeId;
  type: ComponentType;
  canHaveChildren: boolean;
  props: EntityInputs;  // ✅ Reuse from Domain 1
  children: TreeNode[];
}

/**
 * Canvas Props
 */
export interface CanvasProps {
  palette?: PaletteEntry[];
  initialNodes?: TreeNode[];
}

/**
 * Root Drop Area Props
 */
export interface RootDropAreaProps {
  tree: TreeNode[];
  renderNode: (node: TreeNode) => React.ReactNode;
  uniqueContextId: symbol;
}

// ... (other interfaces unchanged)

/**
 * Discriminated Union for Drag & Drop Payload
 */
export type DropPayload =
  | { kind: 'NEW'; type: ComponentType; contextId: symbol }
  | { kind: 'MOVE'; nodeId: NodeId; contextId: symbol };

export interface PerformDropParams {
  dropTargetId: NodeId | null;
  zone: string;
  payload: DropPayload;
}
```

**Changes from v1.0:**
- ❌ `id: string` → ✅ `id: NodeId` (branded)
- ❌ `type: string` → ✅ `type: ComponentType` (branded)
- ❌ `props: Record<string, unknown>` → ✅ `props: EntityInputs` (Domain 1 integration)
- ✅ `createNodeId()`, `isNodeId()` helpers

**LOC:** 52 → 40 (-12, cleaner durch Domain 1 Reuse)

---

### 3. types/canvas.validation.ts (~30 LOC)

**Purpose:** Zod Schemas für Runtime Validation

```typescript
import { z } from 'zod';
import { TreeNode, NodeId, ComponentType } from './canvas.types';
import { EntityInputsSchema } from '../generator/validation'; // From Domain 1

/**
 * Zod Schema for NodeId
 */
const NodeIdSchema = z.string().refine(
  (val) => val.startsWith('node_'),
  { message: 'Invalid NodeId format' }
);

/**
 * Zod Schema for ComponentType
 */
const ComponentTypeSchema = z.string().min(1);

/**
 * Recursive TreeNode Schema
 */
export const TreeNodeSchema: z.ZodType<TreeNode> = z.lazy(() =>
  z.object({
    id: NodeIdSchema,
    type: ComponentTypeSchema,
    canHaveChildren: z.boolean(),
    props: EntityInputsSchema, // ✅ Reuse from Domain 1
    children: z.array(TreeNodeSchema)
  })
);

/**
 * Validate TreeNode with conditional validation
 */
export function validateTreeNode(data: unknown, skipValidation = false): TreeNode {
  const shouldValidate = skipValidation
    ? false
    : (process.env.NODE_ENV !== 'production');

  if (!shouldValidate) {
    return data as TreeNode;
  }

  return TreeNodeSchema.parse(data);
}

export function validateTreeNodes(data: unknown, skipValidation = false): TreeNode[] {
  const shouldValidate = skipValidation
    ? false
    : (process.env.NODE_ENV !== 'production');

  if (!shouldValidate) {
    return data as TreeNode[];
  }

  return z.array(TreeNodeSchema).parse(data);
}
```

**New Features:**
- ✅ Runtime validation for TreeNode
- ✅ Conditional validation (same pattern as Domain 1)
- ✅ Integration mit Domain 1 EntityInputsSchema

**LOC:** 0 → 30 (neu)

---

### 4. types/vscode.types.ts (~20 LOC)

**Purpose:** Type-safe VSCode Webview API mit Generics

```typescript
/**
 * Generic VSCode Webview API
 * @template TMessage - Type of messages posted to extension
 * @template TState - Type of webview state
 */
export interface VsCodeApi<TMessage = unknown, TState = unknown> {
  /**
   * Post message to extension
   */
  postMessage(message: TMessage): void;

  /**
   * Get current webview state
   */
  getState(): TState | undefined;

  /**
   * Set webview state (persisted across reloads)
   */
  setState(state: TState): void;
}

/**
 * Extend Window interface for VSCode API
 */
declare global {
  interface Window {
    vscodeApi?: VsCodeApi;
  }
}

/**
 * Get typed VSCode API
 */
export function getVsCodeApi<TMessage = unknown, TState = unknown>(): VsCodeApi<TMessage, TState> | undefined {
  return (window as Window).vscodeApi as VsCodeApi<TMessage, TState> | undefined;
}

/**
 * Type guard for VSCode API
 */
export function hasVsCodeApi(): boolean {
  return typeof window !== 'undefined' && 'vscodeApi' in window;
}
```

**Changes from v1.0:**
- ❌ `any` types (3x) → ✅ Generics `<TMessage, TState>`
- ✅ Helper: `getVsCodeApi()`, `hasVsCodeApi()`
- ✅ Proper global augmentation

**LOC:** 10 → 20 (+10, viel bessere Type-Safety)

---

### 5. state/tabState.types.ts (~30 LOC)

**Purpose:** Types & Constants für Tab State Management

```typescript
import { TreeNode } from '../types/canvas.types';

/**
 * Branded Type for Tab IDs
 */
export type TabId = string & { readonly __brand: unique symbol };

export function createTabId(name: string): TabId {
  return `tab_${name.toLowerCase().replace(/\s+/g, '_')}` as TabId;
}

export function isTabId(value: unknown): value is TabId {
  return typeof value === 'string' && value.startsWith('tab_');
}

/**
 * Tab Data
 */
export interface TabData {
  id: TabId;
  name: string;
  tree: TreeNode[];
  isFixed: boolean;
  tabIndex: number;
}

/**
 * Tab State
 */
export interface TabState {
  tabs: TabData[];
  activeTabId: TabId;
}

/**
 * Fixed Tabs (immutable)
 */
export const FIXED_TABS = {
  START: { id: 'tab_start' as TabId, name: 'Start', isFixed: true },
  ABSCHLUSS: { id: 'tab_end' as TabId, name: 'Abschluss', isFixed: true }
} as const;
```

**Changes from v1.0:**
- ❌ `id: string` → ✅ `id: TabId` (branded)
- ✅ Extracted from 231 LOC file
- ✅ Branded Type helpers

**LOC:** 0 → 30 (extracted)

---

### 6. state/tabState.reducers.ts (~80 LOC)

**Purpose:** Pure Reducer Functions für Tab State (7 Funktionen)

```typescript
import { TabState, TabData, TabId, FIXED_TABS, createTabId } from './tabState.types';
import { reindexTabs, validateTabMove } from './tabState.utils';

/**
 * Initialize Tab State with 2 fixed tabs
 */
export function initTabState(initialNodes: TreeNode[] = []): TabState {
  return {
    tabs: [
      { ...FIXED_TABS.START, tree: initialNodes, tabIndex: 0 },
      { ...FIXED_TABS.ABSCHLUSS, tree: [], tabIndex: 1 }
    ],
    activeTabId: FIXED_TABS.START.id
  };
}

/**
 * Add new tab (between Start and Abschluss)
 */
export function addTab(state: TabState, name: string): TabState {
  const newTabIndex = state.tabs.length - 1;
  const newTab: TabData = {
    id: createTabId(name),
    name,
    tree: [],
    isFixed: false,
    tabIndex: newTabIndex
  };

  const newTabs = [
    ...state.tabs.slice(0, -1),
    newTab,
    { ...state.tabs[state.tabs.length - 1], tabIndex: newTabIndex + 1 }
  ];

  return { ...state, tabs: newTabs };
}

/**
 * Delete dynamic tab (fixed tabs protected)
 */
export function deleteTab(state: TabState, id: TabId): TabState {
  const tab = state.tabs.find(t => t.id === id);

  if (!tab || tab.isFixed) {
    return state;
  }

  const filtered = state.tabs.filter(t => t.id !== id);
  const reindexed = reindexTabs(filtered);

  return {
    tabs: reindexed,
    activeTabId: state.activeTabId === id ? FIXED_TABS.START.id : state.activeTabId
  };
}

/**
 * Update tab tree
 */
export function updateTabTree(state: TabState, tabId: TabId, tree: TreeNode[]): TabState {
  return {
    ...state,
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, tree } : t)
  };
}

/**
 * Update tab name
 */
export function updateTabName(state: TabState, tabId: TabId, name: string): TabState {
  return {
    ...state,
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, name } : t)
  };
}

/**
 * Move tab to new position (replaces both updateTabIndex and moveTab)
 */
export function moveTab(state: TabState, tabId: TabId, newIndex: number): TabState {
  const tab = state.tabs.find(t => t.id === tabId);

  // Validate move
  if (!validateTabMove(tab, newIndex, state.tabs.length)) {
    return state;
  }

  // Remove and reinsert at new position
  const filtered = state.tabs.filter(t => t.id !== tabId);
  const reordered = [
    ...filtered.slice(0, newIndex),
    tab!,
    ...filtered.slice(newIndex)
  ];

  return { ...state, tabs: reindexTabs(reordered) };
}

/**
 * Switch active tab
 */
export function switchTab(state: TabState, tabId: TabId): TabState {
  return { ...state, activeTabId: tabId };
}
```

**Changes from v1.0:**
- ❌ 231 LOC in 1 File → ✅ 80 LOC (extracted)
- ❌ `updateTabIndex()` (55 LOC, komplex) → ✅ Removed (use `moveTab()`)
- ✅ Extract helpers: `validateTabMove()`, `reindexTabs()`
- ✅ Branded Types (TabId)

**LOC:** 231 → 80 (-65%)

---

### 7. state/tabState.utils.ts (~30 LOC)

**Purpose:** Helper Functions für Tab State Logic

```typescript
import { TabData } from './tabState.types';

/**
 * Reindex tabs sequentially
 */
export function reindexTabs(tabs: TabData[]): TabData[] {
  return tabs.map((t, idx) => ({ ...t, tabIndex: idx }));
}

/**
 * Validate if tab move is allowed
 * @param tab - Tab to move (undefined if not found)
 * @param newIndex - Target index
 * @param tabsLength - Total number of tabs
 * @returns true if move is valid
 */
export function validateTabMove(
  tab: TabData | undefined,
  newIndex: number,
  tabsLength: number
): boolean {
  // Tab must exist and not be fixed
  if (!tab || tab.isFixed) {
    return false;
  }

  // newIndex must be between 1 (after Start) and tabsLength - 2 (before Abschluss)
  const minIndex = 1;
  const maxIndex = tabsLength - 2;

  return newIndex >= minIndex && newIndex <= maxIndex;
}

/**
 * Find tab by ID
 */
export function findTab(tabs: TabData[], id: TabId): TabData | undefined {
  return tabs.find(t => t.id === id);
}

/**
 * Get dynamic tabs (excluding fixed tabs)
 */
export function getDynamicTabs(tabs: TabData[]): TabData[] {
  return tabs.filter(t => !t.isFixed);
}
```

**New Features:**
- ✅ Extracted validation logic
- ✅ Reusable helpers
- ✅ Easy to test (pure functions)

**LOC:** 0 → 30 (extracted)

---

### 8. utils/download.ts (~25 LOC)

**Purpose:** Generic File Download Utility (replaces downloadAstro + downloadJSON)

```typescript
/**
 * File download options
 */
export interface DownloadOptions {
  /** File extension (used for default filename) */
  extension: 'astro' | 'json';
  /** Custom filename (optional) */
  filename?: string;
  /** MIME type (auto-detected if not provided) */
  mimeType?: string;
  /** Prefix for default filename */
  filenamePrefix?: string;
}

/**
 * Download file with auto-cleanup
 * @param data - File content
 * @param options - Download options
 */
export function downloadFile(data: string, options: DownloadOptions): void {
  const {
    extension,
    filename,
    mimeType,
    filenamePrefix
  } = options;

  // Generate filename
  const defaultPrefix = filenamePrefix || (extension === 'astro' ? 'index' : 'canvas');
  const defaultFilename = `${defaultPrefix}-${Date.now()}.${extension}`;
  const finalFilename = filename || defaultFilename;

  // Detect MIME type
  const defaultMimeType = extension === 'json' ? 'application/json' : 'text/plain';
  const finalMimeType = mimeType || defaultMimeType;

  // Create blob and download
  try {
    const blob = new Blob([data], { type: finalMimeType });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = finalFilename;
    anchor.click();

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('[downloadFile] Failed:', error);
    throw new Error(`File download failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Download Astro file
 */
export function downloadAstro(data: string, filename?: string): void {
  downloadFile(data, { extension: 'astro', filename });
}

/**
 * Download JSON file
 */
export function downloadJSON(data: string, filename?: string): void {
  downloadFile(data, { extension: 'json', filename });
}
```

**Changes from v1.0:**
- ❌ 2 separate files (26 LOC, 99% duplication) → ✅ 1 generic function
- ✅ Error handling
- ✅ Testable (inject Date.now via options)
- ✅ Backwards compatible (downloadAstro, downloadJSON helpers)

**LOC:** 26 → 25 (-1, aber viel besser)

---

### 9. utils/extractInputs.ts (~65 LOC)

**Purpose:** DOM Input Extraction (refactored for testability)

```typescript
import { EntityInputs, InputValue } from '../generator/types'; // From Domain 1

/**
 * Input extraction strategies
 */
const InputExtractors = {
  checkbox: (input: HTMLInputElement): boolean => input.checked,

  radio: (input: HTMLInputElement): string | null =>
    input.checked ? input.value : null,

  'select-multiple': (select: HTMLSelectElement): string[] =>
    Array.from(select.selectedOptions).map(o => o.value),

  'select-one': (select: HTMLSelectElement): string => select.value,

  text: (input: HTMLInputElement | HTMLTextAreaElement): string => input.value
};

/**
 * Get input key (name or id)
 */
function getInputKey(element: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): string | null {
  return element.name || element.id || null;
}

/**
 * Check if input should be skipped
 */
function shouldSkipInput(element: HTMLElement): boolean {
  if (element.id === 'preview') return true;

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.disabled;
  }

  return false;
}

/**
 * Extract value from input element
 */
function extractInputValue(element: Element): InputValue | null {
  if (element instanceof HTMLInputElement) {
    if (element.type === 'checkbox') {
      return InputExtractors.checkbox(element);
    }
    if (element.type === 'radio') {
      return InputExtractors.radio(element);
    }
    return InputExtractors.text(element);
  }

  if (element instanceof HTMLSelectElement) {
    return element.multiple
      ? InputExtractors['select-multiple'](element)
      : InputExtractors['select-one'](element);
  }

  if (element instanceof HTMLTextAreaElement) {
    return InputExtractors.text(element);
  }

  return null;
}

/**
 * Extract inputs from DOM element
 * @param el - Container element with data-node-id
 * @returns EntityInputs (from Domain 1)
 */
export function extractInputsFromElement(el: HTMLElement): EntityInputs {
  const nodeId = el.getAttribute('data-node-id');
  if (!nodeId) return {};

  const contentArea = el.querySelector(`[data-content-area="${nodeId}"]`);
  if (!contentArea) return {};

  const inputs = contentArea.querySelectorAll('input, select, textarea');
  const data: EntityInputs = {};

  inputs.forEach((input) => {
    if (shouldSkipInput(input as HTMLElement)) return;

    const key = getInputKey(input as any);
    if (!key) return;

    const value = extractInputValue(input);
    if (value !== null) {
      data[key] = value;
    }
  });

  return data;
}
```

**Changes from v1.0:**
- ❌ 42 LOC monolithic function → ✅ 65 LOC, but split into testable parts
- ✅ Strategy Pattern for input extraction
- ✅ Pure functions (easy to test)
- ✅ Type-safe (EntityInputs from Domain 1)
- ✅ Better separation of concerns

**LOC:** 42 → 65 (+23, aber viel besser strukturiert)

---

## Integration mit Domain 1

### Shared Types

Domain 2 nutzt folgende Types aus Domain 1:

1. **EntityInputs** - Für TreeNode.props und extractInputs Return
2. **InputValue** - Für Input-Werte (string | number | boolean | InputValue[])
3. **EntityInputsSchema** (Zod) - Für TreeNode Validation

**Import Path:**
```typescript
import { EntityInputs, InputValue } from '../generator/types';
import { EntityInputsSchema } from '../generator/validation';
```

---

## Testing Strategy

### Test Files (300+ LOC Tests)

1. **types/canvas.validation.test.ts** (~80 LOC)
   - Test TreeNodeSchema validation
   - Test conditional validation
   - Test invalid data rejection

2. **state/tabState.reducers.test.ts** (~120 LOC)
   - Test all 7 reducers
   - Test fixed tabs protection
   - Test reindexing logic
   - Edge cases: empty state, invalid IDs

3. **state/tabState.utils.test.ts** (~40 LOC)
   - Test validateTabMove()
   - Test reindexTabs()
   - Test edge cases

4. **utils/download.test.ts** (~40 LOC)
   - Mock URL.createObjectURL, Blob
   - Test filename generation
   - Test error handling

5. **utils/extractInputs.test.ts** (~60 LOC)
   - Mock DOM structure
   - Test all input types
   - Test skipping logic

**Total Test LOC:** ~340 LOC (Target: >70% coverage)

---

## LOC Summary

| File | v1.0 | v2.0 | Change |
|------|------|------|--------|
| palette.ts | 7 | 15 | +8 |
| canvas.ts | 52 | 40 | -12 |
| canvas.validation.ts | - | 30 | +30 |
| vscode.d.ts | 10 | 20 | +10 |
| tabState.ts | 231 | - | -231 |
| tabState.types.ts | - | 30 | +30 |
| tabState.reducers.ts | - | 80 | +80 |
| tabState.utils.ts | - | 30 | +30 |
| downloadAstro.ts | 13 | - | -13 |
| downloadJSON.ts | 13 | - | -13 |
| download.ts | - | 25 | +25 |
| extractInputs.ts | 42 | 65 | +23 |
| **TOTAL** | **368** | **335** | **-33 (-9%)** |

**Plus Tests:** +340 LOC

**Net Result:**
- Production: 368 → 335 LOC (-9%)
- Tests: 0 → 340 LOC (+∞%)
- Total: 368 → 675 LOC (mit Tests)

---

## Benefits

### Type Safety ✅
- ❌ 3x `any` in vscode.d.ts → ✅ Generics
- ❌ `Record<string, unknown>` → ✅ EntityInputs (typed)
- ✅ Branded Types (NodeId, TabId, ComponentType)

### Code Quality ✅
- ❌ 99% Duplikation (downloads) → ✅ 1 generic function
- ❌ 231 LOC file → ✅ 3 files (30, 80, 30 LOC)
- ❌ 42 LOC function → ✅ 6 small functions

### Testability ✅
- ❌ 0% Test-Coverage → ✅ Target: >70%
- ✅ Pure functions (easy to test)
- ✅ Strategy Pattern (easy to mock)

### Maintainability ✅
- ✅ Separation of Concerns (Types, Reducers, Utils)
- ✅ Domain 1 Integration (no duplication)
- ✅ Branded Types (prevent ID confusion)

---

## Risks & Mitigations

### Risk 1: Branded Types Complexity
**Risk:** Branded Types können verwirrend sein für Entwickler
**Mitigation:**
- Helper-Functions (`createNodeId()`, `isNodeId()`)
- Gute Dokumentation in JSDoc
- Type-Guards für Runtime-Checks

### Risk 2: Breaking Changes
**Risk:** TreeNode.id ändert von `string` zu `NodeId`
**Mitigation:**
- Migration Helper: `migrateTreeNode()`
- Backwards-compatible Type-Guards
- Update nur in New_Project, nicht in original src/

### Risk 3: Test-Coverage
**Risk:** DOM-Tests sind schwer
**Mitigation:**
- Strategy Pattern in extractInputs (testbar ohne DOM)
- Mock DOM APIs
- Focus on Reducers (pure functions, einfach zu testen)

---

## Next Steps

1. ✅ Plan erstellt
2. ⏳ **Software-Architekt Review** (Agent)
3. ⏳ Finaler Plan nach Kritik
4. ⏳ Implementierung
5. ⏳ Tests schreiben
6. ⏳ Validator Review

---

**Erstellt:** 2025-11-07
**Architekt:** Claude (Anthropic)
**Status:** ⏳ Awaiting Software-Architect Review
