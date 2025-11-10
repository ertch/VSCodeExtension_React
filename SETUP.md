# Setup Guide

Step-by-step instructions for setting up and building this VSCode extension.

## Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Version 9 or higher (comes with Node.js)
- **VSCode**: Version 1.95.0 or higher

Check your versions:
```bash
node --version
npm --version
code --version
```

## Initial Setup

### 1. Clone/Download Project
```bash
cd /path/to/project
```

### 2. Install Extension Dependencies
```bash
npm install
```

This installs:
- VSCode extension dependencies (@vscode/vsce, esbuild, etc.)
- TypeScript and compiler tools
- Zod (validation library)
- Test frameworks (Jest, ts-jest)

### 3. Install UI Dependencies
```bash
cd src/ui
npm install
cd ../..
```

This installs:
- React and React DOM
- Vite (build tool)
- Atlassian Pragmatic DnD (drag & drop)
- ESLint and TypeScript tools

## Building

### Build Extension (TypeScript Compilation)

Compile extension source code to JavaScript:

```bash
npm run compile
```

**What it does:**
- Compiles `src/**/*.ts` to `dist/**/*.js`
- Generates `.d.ts` type definitions
- Creates source maps (`.js.map`, `.d.ts.map`)
- Excludes `src/ui/` (separate build)

**Output:**
```
dist/
├── extension.js
├── extension.d.ts
├── generator/
│   ├── index.js
│   ├── CodeGenerator.js
│   ├── AstroMerger.js
│   ├── Formatters.js
│   ├── validation.js
│   └── types.d.ts
├── services/
│   └── WebviewManager.js
└── errors/
    └── ExtensionErrors.js
```

### Build UI (Vite Bundling)

Compile React UI to production bundle:

```bash
cd src/ui
npm run build
cd ../..
```

**What it does:**
- Bundles React components with Vite
- Minifies JavaScript and CSS
- Outputs to `src/ui/dist/`

**Output:**
```
src/ui/dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
```

### Build Everything

To build both extension and UI in one command:

```bash
npm run compile && cd src/ui && npm run build && cd ../..
```

## Development Mode

### Watch Mode (Auto-Rebuild)

**Extension watch:**
```bash
npm run watch
```
Automatically recompiles TypeScript on file changes.

**UI watch (separate terminal):**
```bash
cd src/ui
npm run watch
```
Automatically rebuilds React bundle on file changes.

### Running Extension in Development

1. Open project in VSCode
2. Press `F5` (or Run → Start Debugging)
3. This launches "Extension Development Host" window
4. In new window, press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
5. Type: "Astro Code Generator: Open Canvas"
6. Canvas UI opens

### Hot Reload

**Extension code changes:**
- After watch recompiles, press `Cmd+R` (Mac) or `Ctrl+R` (Windows/Linux) in Extension Development Host to reload

**UI code changes:**
- After UI watch rebuilds, close and reopen canvas panel

## Testing

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Specific Test File
```bash
npm test -- CodeGenerator.test.ts
```

### Test Coverage
```bash
npm test -- --coverage
```

## Packaging

### Create .vsix Package

Package extension for distribution:

```bash
npm run package
```

**Prerequisites:**
- Extension and UI must be built first
- Runs `vsce package`

**Output:**
```
astro-code-gen-1.0.0.vsix
```

### Install Packaged Extension

```bash
code --install-extension astro-code-gen-1.0.0.vsix
```

Or in VSCode:
1. View → Extensions
2. Click "..." menu → "Install from VSIX..."
3. Select `.vsix` file

## Project Structure

```
.
├── src/
│   ├── extension.ts              # Extension entry point
│   ├── services/
│   │   └── WebviewManager.ts     # Webview lifecycle management
│   ├── generator/
│   │   ├── index.ts              # Generator exports
│   │   ├── types.ts              # Type definitions
│   │   ├── validation.ts         # Zod schemas
│   │   ├── CodeGenerator.ts      # HTML generation
│   │   ├── Formatters.ts         # Attribute formatting
│   │   └── AstroMerger.ts        # Astro template merging
│   ├── errors/
│   │   └── ExtensionErrors.ts    # Custom error classes
│   └── ui/
│       ├── package.json          # UI dependencies
│       ├── vite.config.ts        # Vite configuration
│       └── src/
│           ├── main.tsx          # React entry point
│           ├── components/
│           │   └── Canvas.tsx    # Main canvas component
│           ├── utils/
│           │   ├── tabState.ts   # Tab state management
│           │   └── extractInputs.ts # DOM input extraction
│           └── vscode.d.ts       # VSCode API types
├── dist/                         # Compiled extension (generated)
├── __tests__/                    # Jest tests
├── tsconfig.json                 # Extension TypeScript config
├── package.json                  # Extension manifest + scripts
├── DEVELOPER_GUIDE.md            # Developer documentation
└── SETUP.md                      # This file
```

## Common Issues

### Issue: `Cannot find module 'zod'`
**Solution:** Run `npm install` in project root

### Issue: UI shows blank screen
**Solution:** Build UI first: `cd src/ui && npm run build`

### Issue: TypeScript errors in VSCode
**Solution:**
1. Check correct TypeScript version: `npm list typescript`
2. Reload VSCode window: `Cmd+Shift+P` → "Developer: Reload Window"

### Issue: Tests fail with "cannot read property 'type'"
**Solution:**
1. Delete stale test files: `find __tests__ -name "*.js" -delete`
2. Run tests again: `npm test`

### Issue: Extension not loading after changes
**Solution:**
1. Ensure watch compiled successfully (check terminal)
2. Reload Extension Development Host: `Cmd+R` or `Ctrl+R`

### Issue: `jest: not found`
**Solution:** Jest is in devDependencies. Run via npm: `npm test`

## Debugging Tips

### Debug Extension Code
1. Set breakpoints in `src/**/*.ts` files in main VSCode window
2. Press `F5` to start debugging
3. Breakpoints hit when extension executes in Extension Development Host

### Debug UI Code
1. In Extension Development Host, open canvas
2. `Cmd+Shift+P` → "Developer: Open Webview Developer Tools"
3. Use Chrome DevTools to inspect React components

### View Extension Logs
1. In Extension Development Host
2. Help → Toggle Developer Tools
3. Console tab shows extension logs

### View Webview Messages
1. In Webview Developer Tools (see above)
2. Console tab shows UI logs
3. Network tab shows resource loading

## Build Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `compile` | `tsc -p ./` | Compile extension TypeScript |
| `watch` | `tsc -watch -p ./` | Watch extension for changes |
| `test` | `jest` | Run Jest tests |
| `package` | `vsce package` | Create .vsix package |

## Environment Variables

### NODE_ENV
- **production**: Disables validation for performance
- **development**: Enables validation and warnings

Set in shell:
```bash
export NODE_ENV=development
npm run compile
```

## Next Steps

After setup:
1. Read [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) for architecture overview
2. Run tests to verify setup: `npm test`
3. Try running extension: Press `F5`
4. Make a small change and verify hot reload works
