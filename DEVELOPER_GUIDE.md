# Developer Guide

## Architecture Overview

This VSCode extension generates Astro code from visual canvas designs. The system uses a three-layer architecture:

1. **UI Layer** (React + Vite) - Visual canvas interface
2. **Extension Layer** (VSCode API) - Extension host and webview manager
3. **Generator Layer** (TypeScript) - Code generation engine

## Core Modules

### Generator Layer (`src/generator/`)

#### `types.ts`
Defines the entity type system using discriminated unions:

- **TabPageEntity**: Represents tabs with `name`, `tabIndex`, and `children`
- **StandardEntity**: Represents components with `type`, `inputs`, and `children`
- **Entity**: Union type of TabPageEntity | StandardEntity
- **GenerateHTMLResult**: Output format with tabs, components list, and HTML string

Key distinction: TabPage has metadata fields (name/tabIndex), StandardEntity has inputs (form fields).

#### `validation.ts`
Runtime validation with Zod schemas:

- **validateEntity()**: Validates single Entity (recursive)
- **validateEntities()**: Validates Entity arrays
- Conditional validation based on NODE_ENV (disabled in production)
- z.lazy() used for recursive children validation

#### `CodeGenerator.ts`
Main generation engine (Facade Pattern):

- **generate()**: Entry point - validates and generates HTML from Entity trees
- **collectComponents()**: Recursively collects all component types for imports
- **renderEntity()**: Converts Entity to HTML string with indentation
- **extractAttributes()**: Extracts attributes based on entity type
- **processInputs()**: Transforms inputs into HTML attributes
  - Groups numbered attributes (e.g., `options_0`, `options_1` → `[[value, label]]`)
  - Handles Triple_List (actions), Double_List (options), Mix_List (If-conditions)

#### `Formatters.ts`
HTML attribute formatting and XSS protection:

- **formatAttribute()**: Formats single attribute (boolean, string, number, array, object)
- **buildAttributesString()**: Combines all attributes into HTML string
- **escapeHTML()**: Sanitizes string values to prevent XSS attacks

#### `AstroMerger.ts`
Merges generated HTML with Astro template:

- **mergeAstro()**: Combines HTML output with metadata into complete Astro file
- Generates import statements for all used components
- Formats tabs array for NavTabs component
- Injects campaign metadata (campaignNr, headerTitle, etc.)

### Extension Layer (`src/`)

#### `extension.ts`
VSCode extension entry point:

- **activate()**: Registers commands and initializes extension
- Provides command `astro-code-gen.openGenerator` to open canvas UI

#### `services/WebviewManager.ts`
Manages webview lifecycle and message handling:

- **createOrShowPanel()**: Creates webview or focuses existing panel
- **handleAstroGeneration()**: Receives JSON from UI, generates Astro code, writes file
- **getHtmlForWebview()**: Injects UI build into webview
- Handles messages: `generateAstro`, `astroGenerated`, `astroError`

### UI Layer (`src/ui/src/`)

#### `components/Canvas.tsx`
Main canvas component:

- **State Management**: Multi-tab canvas with tree structures per tab
- **Drag & Drop**: Atlassian Pragmatic DnD for component placement
- **Form Serialization**: Extracts inputs from DOM elements
- **Message Protocol**: Sends `generateAstro` to extension via `window.vscodeApi.postMessage()`

Key functions:
- **handleReadCanvas()**: Iterates all tabs, serializes DOM inputs, creates TabPage entities
- **handleGenerateAstroCode()**: Collects metadata form, sends to backend
- **performDrop()**: Handles NEW component drops and MOVE operations

#### `utils/tabState.ts`
Tab state management:

- **initTabState()**: Creates initial "Start" tab
- **addTab()**: Adds new tab with incremented tabIndex
- **deleteTab()**: Removes tab (prevents deleting last tab)
- **updateTabTree()**: Updates tree for specific tab
- **switchTab()**: Changes active tab

#### `utils/extractInputs.ts`
DOM input extraction:

- **extractInputsFromElement()**: Reads all form inputs from element
- Handles: input, select, checkbox, radio, textarea
- Returns Record<string, InputValue>

#### `components/canvas/tree-utils.ts`
Tree manipulation utilities:

- **genId()**: Generates unique IDs
- **cloneDeep()**: Deep clones tree structures
- **findNodeAndParent()**: Locates node in tree with parent reference
- **removeNode()**: Removes node from tree
- **insertNode()**: Inserts node at specific zone (before/after/inside)
- **isDescendant()**: Prevents circular drops

## Data Flow

### Canvas → Astro File Generation

1. User designs UI in Canvas (drag & drop components)
2. User clicks "Canvas lesen" → `handleReadCanvas()`
   - Switches through all tabs sequentially
   - Serializes DOM inputs for each tab
   - Creates TabPage entities with children
3. User enters metadata → Opens metadata form
4. User clicks "Astro-Datei generieren" → `handleGenerateAstroCode()`
   - Collects metadata (campaignNr, campaignTitle, headerTitle, headerImg)
   - Posts message to extension: `{ type: 'generateAstro', data: { jsonData, metadata } }`
5. Extension receives message → `WebviewManager.handleAstroGeneration()`
   - Calls `mergeAstro(jsonData, metadata)`
6. Generator processes data:
   - `CodeGenerator.generate()` validates and generates HTML
   - Collects all component types for imports
   - Renders entity tree to HTML with proper indentation
   - Returns `{ tabs, components, html }`
7. `AstroMerger.mergeAstro()` wraps HTML in Astro template
   - Generates component imports
   - Formats tabs array
   - Injects metadata
8. Extension writes file to workspace → Shows save dialog
9. Extension posts message back: `{ type: 'astroGenerated', data: { astroCode, filename } }`
10. UI downloads file → `downloadAstro()`

## Key Design Patterns

### Discriminated Union (Entity Type System)
```typescript
type Entity = TabPageEntity | StandardEntity;
```
- Type-safe distinction between TabPage (metadata) and StandardEntity (inputs)
- TypeScript narrows type based on `type` field

### Facade Pattern (CodeGenerator)
- Single entry point `generate()` hides complex processing
- Delegates to specialized methods (collectComponents, renderEntity, processInputs)

### Message Passing (VSCode Webview)
- UI ↔ Extension communication via `postMessage()`
- Async bidirectional messages: `generateAstro`, `astroGenerated`, `astroError`

### Recursive Validation (Zod)
- `z.lazy()` enables recursive schema definitions
- Validates entire entity tree structure

## Important Concepts

### Entity vs TreeNode
- **TreeNode** (UI layer): Canvas representation with `id`, `type`, `canHaveChildren`, `props`, `children`
- **Entity** (Generator layer): Code generation model with `type`, `inputs`, `children`
- Transformation happens in `serializeCurrentTabFromDOM()`

### Numbered Attributes
Inputs like `options_0`, `options_1` get grouped into arrays:
```typescript
inputs: { options_0: "value1", options_1: "label1", options_2: "value2", options_3: "label2" }
→ attributes: { options: [["value1", "label1"], ["value2", "label2"]] }
```

### Tab System
- **Start Tab** (tabIndex=0): Always present, not shown in NavTabs
- **Additional Tabs** (tabIndex>0): Shown in NavTabs, user-deletable
- TabPage entities serialize entire canvas tree per tab

### Component Collection
- Generator walks entity tree and collects all component types
- TabPage is excluded from imports (statically imported in template)
- Component imports use Astro alias: `@/components/ComponentName.astro`

## Error Handling

### Validation Errors
- Thrown by `validateEntity()` / `validateEntities()`
- Contains detailed path and message from Zod
- Wrapped in `ValidationError` class

### Generation Errors
- Thrown by `CodeGenerator.generate()`
- Wrapped in `GenerationError` class with original error

### Null-Safety Guards
- `collectComponents()` and `renderEntity()` check for undefined/null entities
- Returns empty string instead of crashing on invalid nodes

## Testing

### Test Structure (`__tests__/`)
- **fixtures/entities.ts**: Test data (tabPageWithChildren, emptyTabPage, etc.)
- **generator/**: Tests for CodeGenerator, Formatters, validation
- Run with: `npm test`

### Test Patterns
```typescript
describe('CodeGenerator', () => {
  it('should render TabPage with nested children', () => {
    const generator = new CodeGenerator();
    const result = generator.generate(fixtures.tabPageWithChildren);
    expect(result.html).toContain('<TabPage');
    expect(result.html).toContain('<Gate');
  });
});
```

## Build System

### Extension Build (TypeScript)
- Source: `src/**/*.ts` (excluding `src/ui/`)
- Output: `dist/`
- Compiler: `tsc` with `tsconfig.json`
- Command: `npm run compile`

### UI Build (Vite + React)
- Source: `src/ui/src/**/*.tsx`
- Output: `src/ui/dist/`
- Bundler: Vite
- Command: `cd src/ui && npm run build`

### Watch Mode
- Extension: `npm run watch` (recompiles on change)
- UI: `cd src/ui && npm run watch`

## Debugging

### Extension Debugging
1. Open in VSCode
2. Press F5 → Launches Extension Development Host
3. Set breakpoints in `src/**/*.ts`

### UI Debugging
1. In Extension Development Host, open canvas
2. Cmd+Shift+P → "Developer: Open Webview Developer Tools"
3. Inspect React components and console logs

### Production Logs
Keep these console statements:
- `console.error()` in error handlers (Canvas.tsx, WebviewManager.ts)
- `console.warn()` for defensive programming guards (CodeGenerator.ts)

## Maintenance Guidelines

### Adding New Components
1. Define in `src/ui/src/utils/componentPalette/index.ts`
2. No generator changes needed - dynamically handled
3. Component type becomes HTML tag name

### Modifying Entity Types
1. Update `src/generator/types.ts`
2. Update validation schemas in `src/generator/validation.ts`
3. Update `extractAttributes()` if new metadata fields
4. Run tests: `npm test`

### Changing Astro Template
1. Edit template string in `AstroMerger.ts` → `mergeAstro()`
2. Test with sample metadata

### Code Style
- Remove unnecessary comments (code should be self-explanatory)
- Keep production logs (errors/warnings only)
- Use discriminated unions for type safety
- Validate external inputs with Zod
