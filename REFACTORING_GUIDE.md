# Refactoring Guide - React VSCode Extension

## Projektziel
Vollständiges Refactoring der VSCode Extension mit React UI zu einer optimalen, performanten und minimalistischen Architektur unter Beibehaltung aller Funktionalitäten.

## Tech Stack
- **Frontend**: React 19.0.0, Vite 6.1.0
- **Backend/Extension**: TypeScript 5.7.3, VSCode Extension API 1.96.0
- **Drag & Drop**: @atlaskit/pragmatic-drag-and-drop 1.7.7
- **Styling**: SASS 1.93.3
- **Build**: esbuild 0.24.2

## Architektur-Prinzipien
1. **Single Responsibility**: Jede Komponente hat genau eine Aufgabe
2. **DRY**: Keine Code-Duplikation
3. **Composition over Inheritance**: Kleine, wiederverwendbare Komponenten
4. **Performance First**: Memoization, lazy loading, code splitting
5. **Type Safety**: Strikte TypeScript-Typen

## Workflow pro Arbeitsschritt
1. **Analyse**: Bestehenden Code analysieren und verstehen
2. **Planung**: Optimale Architektur entwerfen
3. **Kritik**: Agent (Software-Architekt-Rolle) reviewt Plan
4. **Finales Refactoring**: Plan nach Kritik anpassen
5. **Implementierung**: Code im New_Project schreiben
6. **Validierung**: Domain-spezifischer Agent überprüft Implementierung

## Domains

### 1. Core Extension (Backend)
- Extension Entry Points (main.ts, sidebar.ts, extension.ts)
- Code Generator (CodeGenerator.ts, AstroMerger.ts)
- VSCode API Integration

### 2. Type System & Utilities
- Type Definitions (palette.ts, canvas.ts, vscode.d.ts)
- Utility Functions (downloadAstro.ts, downloadJSON.ts, extractInputs.ts, tabState.ts)

### 3. State Management
- Context System (NamedElementsContext.tsx)
- Component Palette System

### 4. Canvas System
- Canvas Components (Slot.tsx, NodeWrapper.tsx, components.tsx)
- Canvas Form (CanvasForm.tsx)
- Tree Utilities (tree-utils.ts)
- Tab System (TabNavigation.tsx, TabButton.tsx)

### 5. Card Components
- Card Layout System (BaseCard.tsx)
- Form Cards (SimpleInput, SimpleSelect, SimpleTextfield, SimpleFieldset)
- Interactive Cards (RadioButton, SuggestionInput, RecordButton)
- Navigation Cards (WeiterButton, FinishButton, FootButtons)
- Logic Cards (Gate.tsx, GateGroup.tsx, ConBlock.tsx, GatekeeperSelect.tsx, SQLinjectionSelect.tsx)
- Visual Cards (Bild.tsx, TabPage.tsx)
- Card Index (index.ts)

### 6. Input Components
- Input_String.tsx
- Input_Checkbox.tsx
- Input_DoubleSingle.tsx
- Input_TrippleSingle.tsx
- Input_TrippleList.tsx
- Input_Function.tsx

### 7. Common Components
- Select Components (Select_Actions.tsx, Select_NamedElements.tsx, NamedElementsSelect.tsx)
- Shared Components (ConfirmDialog.tsx)

### 8. Build & Configuration
- Build System (esbuild.js, vite.config, tsconfig)
- Package Configuration

## Agent-Instruktionen

### Software-Architekt Agent (Kritiker)
Rolle: Kritische Überprüfung der Architektur-Pläne
- Prüfe auf: Separation of Concerns, DRY-Prinzip, Performance-Optimierungen
- Identifiziere: Code-Duplikation, unnötige Komplexität, fehlende Abstraktion
- Schlage vor: Verbesserungen, alternative Patterns, Optimierungen
- Fokus: React Best Practices, TypeScript-Typsicherheit, Bundle-Größe

### Domain-Validator Agents
Rolle: Validierung der implementierten Domain
- Überprüfe: Vollständigkeit aller Funktionen, Einhaltung der Architektur
- Teste: Integration mit anderen Domains, Type Safety
- Validiere: Performance, Code-Qualität, Konsistenz
- Berichte: Fehlende Features, Bugs, Verbesserungspotenzial

## Status Tracking
- [x] Projekt-Analyse abgeschlossen ✅ (2025-11-07)
- [x] Domain 1: Core Extension ✅ (2025-11-07) - Rating: 8.0/10
- [x] Domain 2: Type System & Utilities ✅ (2025-11-07) - Rating: 8.0/10
- [ ] Domain 3: State Management
- [ ] Domain 4: Canvas System
- [ ] Domain 5: Card Components
- [ ] Domain 6: Input Components
- [ ] Domain 7: Common Components
- [ ] Domain 8: Build & Configuration
- [ ] Integration & Testing

**Domain 1 Deliverables:**
- ✅ 10 Files implemented (845 LOC production, 524 LOC tests)
- ✅ 79.73% test coverage (target: >70%)
- ✅ TypeScript compilation successful
- ✅ Validator approval (8.0/10)
- ✅ Documentation (452 lines README)
- 📄 See DOMAIN_1_COMPLETION.md for details

**Domain 2 Deliverables:**
- ✅ 6 Files implemented (442 LOC production, 381 LOC tests)
- ✅ 82.89% test coverage, 100% on tabState.ts (target: >70%)
- ✅ TypeScript compilation successful
- ✅ Validator approval (8.0/10)
- ✅ Pragmatic approach (5.5/10 → 8.0/10 after simplification)
- 📄 See DOMAIN_2_COMPLETION.md for details

## Metriken
- **Vor Refactoring**:
  - Anzahl Source-Dateien: 53
  - Lines of Code: 3233
  - Bundle Size: TBD (wird gemessen)
  - React-Komponenten: 17 Card Components + 6 Input Components (1 implementiert) + Canvas System + Shared Components

- **Nach Refactoring**: Target
  - Anzahl Dateien: ~70-80 (mehr, aber besser organisiert)
  - Lines of Code: Target < 2300 LOC (-30%)
  - Bundle Size: Target < 60% von Original
  - Komponenten: ~50-60 (kleiner, wiederverwendbar, memoized)

## Notizen
- Alle Funktionalitäten müssen erhalten bleiben
- Rückwärtskompatibilität mit VSCode API gewährleisten
- User Experience darf sich nicht verschlechtern
