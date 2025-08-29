# VS Code Extension with React UI - Project Documentation

## Architecture Overview

This VS Code extension integrates a React-based user interface within VS Code webviews, providing a command palette action and a sidebar tree view that directly executes the webview command.

### Key Components

- **Extension Host**: TypeScript-based VS Code extension (`src/extension.ts`)
- **React UI**: Vite-powered React application (`src/ui/`)
- **Build System**: ESBuild for extension bundling, Vite for React UI

## Dependencies

### Root Project Dependencies

#### Dev Dependencies
- `@types/node`: ^22.13.1 - Node.js type definitions
- `@types/vscode`: ^1.96.0 - VS Code API type definitions  
- `esbuild`: ^0.24.2 - Fast JavaScript bundler
- `typescript`: ^5.7.3 - TypeScript compiler
- `vscode-test`: ^1.5.0 - VS Code extension testing framework

### React UI Dependencies (`src/ui/`)

#### Runtime Dependencies
- `react`: ^19.0.0 - React library
- `react-dom`: ^19.0.0 - React DOM rendering

#### Dev Dependencies
- `@eslint/js`: ^9.19.0 - ESLint JavaScript rules
- `@types/react`: ^19.0.8 - React type definitions
- `@types/react-dom`: ^19.0.3 - React DOM type definitions
- `@vitejs/plugin-react`: ^4.3.4 - Vite React plugin
- `eslint`: ^9.19.0 - JavaScript linter
- `eslint-plugin-react`: ^7.37.4 - React ESLint rules
- `eslint-plugin-react-hooks`: ^5.0.0 - React Hooks ESLint rules
- `eslint-plugin-react-refresh`: ^0.4.18 - React Refresh ESLint rules
- `globals`: ^15.14.0 - Global variables definitions
- `vite`: ^6.1.0 - Frontend build tool

## Architecture Details

### Extension Structure

```
VSCodeExtension_React/
├── src/
│   ├── extension.ts           # Main extension entry point
│   ├── components/           # Extension components
│   ├── generator/           # Code generation utilities
│   ├── main.ts             # Additional main logic
│   └── ui/                 # React UI application
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── css/        # Stylesheets
│       │   └── main.jsx    # React app entry point
│       ├── index.html      # HTML template
│       └── vite.config.js  # Vite configuration
├── dist/                   # Built extension files
├── media/                  # Extension icons and assets
└── package.json           # Extension manifest
```

### Key Features

1. **Webview Integration**: Creates VS Code webview panels with React UI
2. **Activity Bar**: Adds extension icon to VS Code activity bar with tree view
3. **Command Registration**: Registers `vscExtension.showWebview` command
4. **Tree Data Provider**: Implements `QuickAccessProvider` for sidebar interaction
5. **CSP Security**: Implements Content Security Policy for webviews
6. **Asset Loading**: Handles React build assets (JS/CSS) in webview context

### Build Configuration

- **Extension**: ESBuild bundles TypeScript to `dist/extension.js`
- **React UI**: Vite builds React app to `src/ui/dist/`
- **TypeScript**: Configured for ES6 target with CommonJS modules

## Getting Started

### Prerequisites
- Node.js (compatible with npm)
- VS Code
- Git

### Installation & Setup

1. **Clone and navigate to project**:
   ```bash
   cd /home/etchorz/AP2/VSCodeExtension_React
   ```

2. **Install dependencies**:
   ```bash
   # Install extension dependencies
   npm install
   
   # Install React UI dependencies
   cd src/ui
   npm install
   cd ../..
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

### Development

1. **Start development**:
   ```bash
   # Build extension in watch mode
   npm run watch
   
   # In separate terminal, start React UI dev server
   cd src/ui
   npm run dev
   ```

2. **Test extension**:
   - Open project in VS Code
   - Press `F5` to launch Extension Development Host
   - Click on the extension icon in the Activity Bar
   - Click "Open Extension Panel" in the sidebar to launch the React UI

### Available Scripts

#### Root Project
- `npm run compile`: Build extension and React UI
- `npm run watch`: Watch TypeScript files for changes
- `npm run build`: Full build (extension + React UI)
- `npm test`: Run extension tests

#### React UI (`src/ui/`)
- `npm run dev`: Start Vite development server
- `npm run build`: Build React app for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview built React app

## Important Notes

- Extension requires VS Code ^1.96.0
- React UI builds to `src/ui/dist/` which extension loads
- CSP headers are configured for webview security
- Extension supports both command palette and activity bar access
- Sidebar shows a tree view with "Open Extension Panel" item that executes the webview command
- No webview content is displayed in the sidebar itself - it only provides navigation to open the main panel

## Current Implementation Details

### Extension Activation
- Activates on `onCommand:vscExtension.showWebview`
- Registers tree data provider for sidebar navigation
- Creates webview panel when command is executed

### Sidebar Integration
- Activity bar icon opens a sidebar panel
- Sidebar contains `QuickAccessProvider` tree data provider
- Single tree item "Open Extension Panel" executes the main command
- No data provider errors - uses proper TreeDataProvider implementation