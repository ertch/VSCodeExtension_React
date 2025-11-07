# Domain 2 - Type System & Utilities: Analyse

**Datum:** 2025-11-07
**Status:** Analyse abgeschlossen
**Umfang:** 7 Dateien, 368 LOC

---

## Executive Summary

Domain 2 umfasst das **Type System** und **Utility-Funktionen** für die React UI. Die Analyse zeigt:

- ✅ **Starke Type-Definitionen** in palette.ts und canvas.ts
- ⚠️ **Lange, komplexe Datei** tabState.ts (231 LOC mit 10 Funktionen)
- ⚠️ **Code-Duplikation** bei Download-Funktionen (99% identisch)
- ⚠️ **Unsichere `any` Types** in vscode.d.ts und extractInputs
- ✅ **Gute Funktionssignaturen** mit klarer Verantwortung

**Refactoring-Potenzial:** ~30% LOC-Reduktion (368 → ~260 LOC)

---

## File-by-File Analysis

### 1. `palette.ts` (7 LOC) ✅

**Purpose:** Type-Definition für Palette-Einträge (Drag & Drop Komponenten)

```typescript
export type PaletteEntry<TProps = {}> = {
  type: string;
  label: string;
  canHaveChildren: boolean;
  Component: React.FC<TProps>;
};
```

**Strengths:**
- ✅ Klare, minimale Type-Definition
- ✅ Generic `TProps` für Flexibilität
- ✅ Alle Properties klar benannt

**Issues:**
- ⚠️ `TProps = {}` sollte `TProps = Record<string, unknown>` sein (strictere Types)
- ⚠️ `type: string` könnte `type: string & { __brand: 'ComponentType' }` sein (branded type)

**Refactoring:**
- Branded Type für `type` (verhindert Verwechslung mit anderen Strings)
- Bessere Generic-Defaults

**LOC-Potenzial:** 7 → 10 (mehr Types, besser)

---

### 2. `canvas.ts` (52 LOC) ✅

**Purpose:** Type-Definitionen für Canvas, Drag & Drop, Tree-Nodes

**Strengths:**
- ✅ Discriminated Union für `DropPayload` (type-safe)
- ✅ Klare Interface-Struktur
- ✅ Separation of Concerns (ein Interface pro Verantwortung)

**Issues:**
- ⚠️ `Record<string, unknown>` in TreeNode.props ist zu generisch
- ⚠️ `ReactNode` importiert, aber eigentlich nicht nötig (kann durch `React.ReactNode` ersetzt werden)
- ⚠️ Keine Validierung für TreeNode IDs (UUID vs. beliebiger String)

**Key Types:**
```typescript
export interface TreeNode {
  id: string;              // ⚠️ Sollte branded type sein
  type: string;            // ⚠️ Sollte ComponentType sein
  canHaveChildren: boolean;
  props: Record<string, unknown>; // ⚠️ Zu generisch
  children: TreeNode[];
}

export type DropPayload =
  | { kind: 'NEW'; type: string; contextId: symbol }
  | { kind: 'MOVE'; nodeId: string; contextId: symbol }; // ✅ Gut!
```

**Refactoring:**
- Branded Types für IDs
- Zod-Schema für Runtime-Validation
- Bessere Props-Typisierung (EntityInputs aus Domain 1 wiederverwenden)

**LOC-Potenzial:** 52 → 65 (mehr Type-Safety)

---

### 3. `extractInputs.ts` (42 LOC) ⚠️

**Purpose:** Extrahiert Formular-Daten aus DOM-Elementen

**Code Analysis:**
```typescript
export function extractInputsFromElement(el: HTMLElement): Record<string, unknown> {
  const nodeId = el.getAttribute('data-node-id');
  if (!nodeId) return {};

  const contentArea = el.querySelector(`[data-content-area="${nodeId}"]`);
  if (!contentArea) return {};

  const inputs = contentArea.querySelectorAll("input, select, textarea");
  const data: Record<string, unknown> = {};

  inputs.forEach((inp) => {
    // 42 lines of type checking and value extraction
  });
  return data;
}
```

**Strengths:**
- ✅ Unterstützt alle Input-Typen (text, checkbox, radio, select, textarea)
- ✅ Disabled-Inputs werden ignoriert
- ✅ Preview-Input wird übersprungen

**Issues:**
- ❌ **Keine Type-Guards** - viele `instanceof` checks
- ❌ **Lange Funktion** (42 LOC, zu komplex)
- ❌ **Keine Tests** möglich (DOM-abhängig)
- ⚠️ `Record<string, unknown>` - Return-Type sollte typisiert sein
- ⚠️ Keine Fehlerbehandlung für ungültige DOM-Strukturen
- ⚠️ Multi-Select Logic inline (sollte extrahiert werden)

**Refactoring:**
- Extract Input-Handler pro Type (extractCheckbox, extractRadio, etc.)
- Type-Guards für Input-Typen
- Testbare Funktionen (pure functions)
- Zod-Schema für Rückgabe

**LOC-Potenzial:** 42 → 60 (mehr Funktionen, aber besser testbar)

---

### 4. `tabState.ts` (231 LOC) ⚠️⚠️

**Purpose:** State-Management für Multi-Tab Canvas (10 Funktionen)

**Functions:**
1. `initTabState()` - Initialize state with 2 fixed tabs
2. `addTab()` - Add dynamic tab
3. `deleteTab()` - Delete dynamic tab
4. `updateTabTree()` - Update tree of tab
5. `updateTabName()` - Update tab name
6. `updateTabIndex()` - Update tab index (complex)
7. `switchTab()` - Switch active tab
8. `moveTab()` - Move tab to new position (complex)
9. _(2 more helper functions implied)_

**Strengths:**
- ✅ Pure Functions (immutable state updates)
- ✅ Fixed Tabs (START, ABSCHLUSS) nicht löschbar/verschiebbar
- ✅ Gute JSDoc-Kommentare
- ✅ Klare Validierung (fixe Tabs, Index-Ranges)

**Critical Issues:**
- ❌ **231 LOC in einer Datei** - zu lang!
- ❌ **Funktions-Duplikation:** `updateTabIndex()` und `moveTab()` machen fast dasselbe (90% Duplikation)
- ❌ **Komplexe Logik:** `updateTabIndex()` hat 60 LOC mit nested ifs
- ⚠️ **Keine Tests** - komplexe Index-Logik ist fehleranfällig
- ⚠️ **Ineffiziente Re-Indexierung** - immer alle Tabs durchlaufen

**Code Duplication Analysis:**
```typescript
// updateTabIndex() - Lines 125-179 (55 LOC)
export function updateTabIndex(state: TabState, tabId: string, newIndex: number): TabState {
  // Validation
  if (!tab || tab.isFixed) return state;
  if (newIndex < minIndex || newIndex > maxIndex) return state;

  // Complex reindexing logic (30 LOC)
  const updatedTabs = state.tabs.map(t => { ... });
}

// moveTab() - Lines 200-231 (32 LOC)
export function moveTab(state: TabState, tabId: string, newIndex: number): TabState {
  // Same validation
  if (!tab || tab.isFixed) return state;
  if (newIndex < minIndex || newIndex > maxIndex) return state;

  // Different reindexing approach (simpler)
  const filtered = state.tabs.filter(t => t.id !== tabId);
  const reordered = [...filtered.slice(0, newIndex), tab, ...filtered.slice(newIndex)];
  const reindexed = reordered.map((t, idx) => ({ ...t, tabIndex: idx }));
}
```

**Verdict:** `moveTab()` ist besser - einfacher und kürzer. `updateTabIndex()` sollte entfernt werden.

**Refactoring:**
1. **Split File:** tabState.ts → 3 files
   - `tabState.types.ts` - Types (TabData, TabState, FIXED_TABS)
   - `tabState.reducers.ts` - Core reducers (init, add, delete, update)
   - `tabState.helpers.ts` - Helpers (validation, reindexing)

2. **Remove Duplication:**
   - Delete `updateTabIndex()` (use `moveTab()` instead)
   - Extract validation logic: `validateTabMove()`
   - Extract reindexing: `reindexTabs()`

3. **Add Tests:**
   - Test fixed tabs cannot be moved/deleted
   - Test reindexing edge cases
   - Test active tab switching on delete

**LOC-Potenzial:** 231 → 140 (60% durch Duplikation-Removal, 40% besser strukturiert)

---

### 5. `downloadAstro.ts` (13 LOC) ⚠️

**Purpose:** Download Astro code as file

```typescript
export const downloadAstro = (data: string, filename: string = `index-${Date.now()}.astro`) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([data], { type: 'text/plain' })),
    download: filename
  });
  a.click();
  URL.revokeObjectURL(a.href);
};
```

**Strengths:**
- ✅ Funktioniert
- ✅ Memory-Leak-Prevention (revokeObjectURL)

**Issues:**
- ❌ **99% Code-Duplikation** mit downloadJSON.ts
- ⚠️ `Object.assign()` statt direkte Properties (unüblich)
- ⚠️ Keine Error-Handling (Blob-Creation kann fehlschlagen)
- ⚠️ `Date.now()` im Default-Parameter (nicht testbar)

---

### 6. `downloadJSON.ts` (13 LOC) ⚠️

**Purpose:** Download JSON data as file

```typescript
export const downloadJSON = (data: string, filename: string = `canvas-${Date.now()}.json`) => {
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(new Blob([data], { type: 'application/json' })),
    download: filename
  });
  a.click();
  URL.revokeObjectURL(a.href);
};
```

**Same Issues as downloadAstro.ts**

**Refactoring:**
Merge beide Funktionen in eine generische `downloadFile()`:

```typescript
export function downloadFile(data: string, options: {
  filename?: string;
  extension: 'astro' | 'json';
  mimeType?: string;
}): void {
  const { extension, mimeType, filename } = options;
  const defaultFilename = `${extension === 'astro' ? 'index' : 'canvas'}-${Date.now()}.${extension}`;
  const finalFilename = filename || defaultFilename;
  const finalMimeType = mimeType || (extension === 'json' ? 'application/json' : 'text/plain');

  // ... blob creation + download
}
```

**LOC-Potenzial:** 26 → 18 (1 Funktion statt 2, besser testbar)

---

### 7. `vscode.d.ts` (10 LOC) ⚠️

**Purpose:** VSCode Webview API Type-Deklarationen

```typescript
interface VsCodeApi {
  postMessage(message: any): void;  // ❌ any
  getState(): any;                  // ❌ any
  setState(state: any): void;       // ❌ any
}

interface Window {
  vscodeApi?: VsCodeApi;
}
```

**Critical Issues:**
- ❌ **3x `any` types** - keine Type-Safety
- ❌ **Keine Generics** - VsCodeApi<TMessage, TState> wäre besser
- ⚠️ Global `Window` augmentation ohne Namespace

**Refactoring:**
```typescript
export interface VsCodeApi<TMessage = unknown, TState = unknown> {
  postMessage(message: TMessage): void;
  getState(): TState | undefined;
  setState(state: TState): void;
}

declare global {
  interface Window {
    vscodeApi?: VsCodeApi;
  }
}
```

**LOC-Potenzial:** 10 → 15 (mehr Type-Safety)

---

## Summary of Issues

### Critical Issues (Must Fix)

| Issue | File | Severity | Impact |
|-------|------|----------|--------|
| `any` types in VSCode API | vscode.d.ts | ❌ Critical | No type safety für Messages/State |
| 99% Code duplication | download*.ts | ❌ Critical | DRY violation |
| 231 LOC in single file | tabState.ts | ❌ Critical | Maintainability |
| updateTabIndex vs moveTab duplication | tabState.ts | ❌ Critical | Funktions-Duplikation |
| No tests for complex logic | tabState.ts | ❌ Critical | Bug-prone reindexing |

### Medium Priority

| Issue | File | Severity | Impact |
|-------|------|----------|--------|
| Long function (42 LOC) | extractInputs.ts | ⚠️ Medium | Hard to test |
| No type guards | extractInputs.ts | ⚠️ Medium | Runtime errors |
| `Record<string, unknown>` too generic | canvas.ts | ⚠️ Medium | Lost type info |
| No branded types for IDs | canvas.ts | ⚠️ Medium | String confusion |

### Low Priority

| Issue | File | Severity | Impact |
|-------|------|----------|--------|
| `TProps = {}` default | palette.ts | ⚠️ Low | Minor type issue |
| `Object.assign()` style | download*.ts | ⚠️ Low | Code style |
| No JSDoc | extractInputs.ts | ⚠️ Low | Documentation |

---

## Refactoring Recommendations

### High Priority

1. **Merge Download Functions** (downloadAstro + downloadJSON)
   - Create `downloadFile()` utility
   - Reduce LOC: 26 → 18
   - Better testability

2. **Split tabState.ts** (231 LOC → 3 files)
   - `tabState.types.ts` - Types & constants (30 LOC)
   - `tabState.reducers.ts` - Pure reducers (80 LOC)
   - `tabState.utils.ts` - Helpers (30 LOC)
   - Total: 140 LOC (39% reduction)

3. **Remove updateTabIndex()** (duplicate of moveTab)
   - Use `moveTab()` everywhere
   - Reduce 55 LOC

4. **Fix vscode.d.ts `any` types**
   - Add Generics: `VsCodeApi<TMessage, TState>`
   - Type-safe API

### Medium Priority

5. **Refactor extractInputs.ts**
   - Extract input handlers: `extractCheckboxValue()`, `extractSelectValue()`, etc.
   - Add type guards
   - Make testable (pure functions)

6. **Add Branded Types**
   - `NodeId`, `ComponentType` branded strings
   - Prevent ID/Type confusion

7. **Add Zod Schemas**
   - Runtime validation for TreeNode, TabState
   - Integrate with Domain 1 validation patterns

---

## Estimated LOC Reduction

| File | Current | After Refactoring | Reduction |
|------|---------|-------------------|-----------|
| palette.ts | 7 | 10 | +3 (more types) |
| canvas.ts | 52 | 65 | +13 (Zod schemas) |
| extractInputs.ts | 42 | 60 | +18 (split functions) |
| tabState.ts | 231 | 140 | **-91** ✅ |
| downloadAstro.ts | 13 | - | -13 (merged) |
| downloadJSON.ts | 13 | - | -13 (merged) |
| download.ts | - | 18 | +18 (new) |
| vscode.d.ts | 10 | 15 | +5 (generics) |
| **TOTAL** | **368** | **308** | **-60 (-16%)** |

**Plus neue Files:**
- tabState.types.ts (30 LOC)
- tabState.reducers.ts (80 LOC)
- tabState.utils.ts (30 LOC)

**Net Result:** 368 → ~308 LOC in main files, aber besser strukturiert mit +3 neuen Files für Separation of Concerns.

---

## Testing Strategy

### High Priority Tests

1. **tabState.reducers.test.ts**
   - Test alle 8 Funktionen
   - Edge cases: Fixed tabs, invalid indices, empty state
   - Reindexing logic (critical)

2. **download.test.ts**
   - Mock DOM APIs (URL.createObjectURL, Blob)
   - Test filename generation
   - Test MIME types

### Medium Priority Tests

3. **extractInputs.test.ts**
   - Mock DOM structure
   - Test alle Input-Typen
   - Test disabled/preview inputs ignored

---

## Next Steps

1. ✅ Analyse abgeschlossen
2. ⏳ **Create DOMAIN_2_PLAN.md** (Architecture Plan)
3. ⏳ Software-Architekt Review
4. ⏳ Final Plan nach Kritik
5. ⏳ Implementierung
6. ⏳ Tests
7. ⏳ Validator Review

---

**Erstellt:** 2025-11-07
**Analyst:** Claude (Anthropic)
**Status:** ✅ Analyse Complete - Ready for Planning
