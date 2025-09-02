# VSCodeExtension_React - Astro Code Generator

Dieses Projekt ist eine VS Code Extension für die Generierung von Astro-Komponenten aus bestehenden `.astro` Dateien.

## Projektstruktur

```
src/
├── extension.ts          # Haupt-Extension Code
└── ui/                  # React Interface
    ├── src/components/Card.tsx  # Snippet-Anzeige
    └── dist/           # Gebaute React App
```

## Funktionsweise

### 1. Astro File Reader
- Scannt `src/pages/*/index.astro` im Workspace
- Liest Astro-Dateien mit Cheerio (XML Parser)
- Erkennt verwendete Komponenten automatisch

### 2. Snippet-Definitionen
```typescript
const snippetDefinitions = {
    'Layout': {
        attributes: { campaignNr: '', campaignTitle: '', jsFiles: '' ... },
        childs: {}
    },
    'NavTabs': { attributes: { tabs: '' }, childs: {} },
    // 16 vordefinierte Komponenten
}
```

### 3. Code-Generierung
- **Statischer Config-Block**: Layout → NavTabs → TabWrapper (immer vorhanden)
- **Dynamische Snippets**: Basierend auf gefundenen Komponenten
- **Values-Objekt**: `<script> let values = { attribute1: "realValue" ... }`

### 4. Sidebar-Interface
- **📖 Read Astro File**: Automatische Analyse und Generierung
- **16 Component-Buttons**: Manuelle Snippet-Einfügung
- **📋 Open Panel**: React-Interface öffnen

## Workflow

1. Öffne Astro-Projekt in VS Code
2. Klicke "📖 Read Astro File" in der Sidebar
3. Extension liest `src/pages/*/index.astro`
4. Generiert automatisch alle gefundenen Komponenten
5. Zeigt Snippets mit realen Attribut-Daten im React-Panel

## Unterstützte Komponenten

Layout, NavTabs, TabWrapper, TabPage, Field, Input, Select, Gatekeeper, Gate, GateGroup, SQL_Select, Suggestion, ConBlock, RecordBtn, FinishBtn, NextPageBtn

## Dependencies

### Runtime
- `cheerio`: ^1.0.0 - HTML/XML Parser für Astro-Dateien

### Dev Dependencies
- `@types/vscode`: ^1.96.0 - VS Code API Typen
- `typescript`: ^5.7.3 - TypeScript Compiler
- `esbuild`: ^0.24.2 - JavaScript Bundler

## Build

```bash
npm run compile  # Kompiliert TypeScript
cd src/ui && npm run build  # Baut React App
```

## Architektur

Die Extension folgt einem **einfachen, schlanken Design**:

- **~287 Zeilen Code** (reduziert von 670+ Zeilen)
- **Vordefinierte Component-Struktur** statt dynamische Generierung
- **Cheerio-basiertes Parsing** statt komplexe Regex
- **Minimale Dependencies** - nur was nötig ist
- **Klare Trennung**: Datei lesen → Component finden → Snippet generieren

Die Extension ist für die Arbeit mit dem ttEditor-Framework optimiert und folgt der Struktur aus `WhereToGenCode.md`.