# TT-Editor Low-Code Extension

Lightweight Low-Code Editor für ttEditor Astro-Projekte.

## 📦 Projektstruktur

```
newVersion/
├── src/
│   ├── extension.ts          # VS Code Extension Entry Point
│   ├── webview.ts             # Webview Manager (Canvas)
│   ├── shared/                # Shared Types zwischen Extension & Canvas
│   │   ├── messageProtocol.ts
│   │   └── projectConfig.ts
│   ├── templates/             # Template Files
│   │   └── defaultAstro.ts
│   └── ui/                    # React Canvas Application
│       └── src/
│           ├── components/    # React Components
│           ├── hooks/         # Custom Hooks
│           ├── styles/        # CSS Modules
│           └── utils/         # Utilities
├── package.json               # Extension Package
├── tsconfig.json              # TypeScript Config
└── esbuild.js                 # Build Script
```

## 🚀 Installation

```bash
# 1. Extension Dependencies
npm install

# 2. Canvas Dependencies
cd src/ui
npm install
cd ../..

# 3. Build Extension
npm run compile

# 4. Build Canvas
cd src/ui
npm run build
cd ../..
```

## 🔧 Development

```bash
# Terminal 1: Extension Watch Mode
npm run watch

# Terminal 2: Canvas Dev Server
cd src/ui
npm run dev
```

## 📋 Features

- ✅ Single-Projekt Validation (`.env.ttEditor-LC`)
- ✅ Sidebar mit "Canvas öffnen" + "Projekt laden"
- ✅ Drag & Drop Canvas (Toolbar rechts, Buttons unten)
- ✅ 18 ttEditor-Komponenten als Cards
- ✅ Attribute-Editing (Text + Checkbox)
- ✅ JSON-Speicherung (`.ttEditor.json`)
- ✅ Keyboard Shortcuts (Cmd+S, Delete)
- ✅ Autosave (2s debounced)
- ✅ Max 5 Levels Nesting
- ✅ Versionierung

## 📝 JSON Schema

```json
{
  "version": "1.0",
  "projectName": "mein-projekt",
  "lastModified": "2025-10-29T14:30:00Z",
  "tree": [
    {
      "id": "node_abc123",
      "type": "SimpleInput",
      "props": { "label": "Name", "required": true },
      "children": [],
      "codeGen": { "component": "SimpleInput" }
    }
  ],
  "metadata": {}
}
```

## 🎯 Roadmap

- **Phase 1-2** (✅ Done): Extension + Canvas + Save/Load
- **Phase 3** (Deferred): Code-Generierung (JSON → Astro)

## 📄 License

MIT
