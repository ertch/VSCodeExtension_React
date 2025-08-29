# VS Code Extension with React UI - Project Documentation

## Architecture Overview

This VS Code extension integrates a React-based user interface within VS Code webviews, providing both a command palette action and an interactive sidebar webview with buttons and controls for quick access to extension functionality.

### Key Components

- **Extension Host**: TypeScript-based VS Code extension (`src/extension.ts`)
- **Main React UI**: Vite-powered React application (`src/ui/`) for full-panel webviews
- **Sidebar Webview**: Interactive HTML interface with buttons and VS Code theme integration
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

1. **Dual Webview System**: Creates both full-panel React webviews and sidebar webview interfaces
2. **Interactive Sidebar**: Custom HTML webview with buttons, sections, and VS Code theme integration
3. **Activity Bar Integration**: Extension icon in activity bar opens interactive sidebar
4. **Command Registration**: Registers `vscExtension.showWebview` command for main panel
5. **Message Communication**: Bidirectional messaging between sidebar webview and extension host
6. **CSP Security**: Implements Content Security Policy for both webview types
7. **Theme Integration**: Sidebar automatically adapts to VS Code light/dark themes
8. **Asset Loading**: Handles React build assets (JS/CSS) in main webview context

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
   - Click on the extension icon in the Activity Bar to open the interactive sidebar
   - Use the sidebar buttons to:
     - Open the main React panel
     - Test VS Code integration features
     - Access quick tools and settings

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
- React UI builds to `src/ui/dist/` which extension loads for main panels
- CSP headers are configured for both sidebar and main webview security
- Extension supports both command palette and activity bar access
- Sidebar contains interactive webview with buttons and VS Code theme integration
- Main React panel opens in separate editor tab when requested from sidebar

## Current Implementation Details

### Extension Activation
- Activates on `onCommand:vscExtension.showWebview`
- Registers `SidebarWebviewProvider` for sidebar webview interface
- Creates both sidebar webview and main React panel when needed

### Sidebar Implementation
- **WebviewViewProvider**: Uses `SidebarWebviewProvider` class implementing `vscode.WebviewViewProvider`
- **Interactive Content**: Custom HTML with buttons, sections, and VS Code CSS variables
- **Message Handling**: Processes messages from sidebar buttons to execute commands
- **Theme Integration**: Automatically matches VS Code's current theme (light/dark)

### Sidebar Features
- **Quick Actions Section**: 
  - 📋 Open Extension Panel (launches main React UI)
  - 💬 Show Alert (demonstrates VS Code integration)  
  - ⚙️ Settings (placeholder for future features)
- **Tools Section**: Customizable tool buttons for extension functionality
- **Info Display**: Shows extension version and status information

### Message Communication
```typescript
// Sidebar to Extension Host
webview.postMessage({
    command: 'openMainPanel' | 'alert',
    text?: string
});

// Extension Host handles messages
switch (message.command) {
    case 'openMainPanel':
        vscode.commands.executeCommand('vscExtension.showWebview');
        break;
    case 'alert':
        vscode.window.showInformationMessage(message.text);
        break;
}
```

### Extensibility
The sidebar webview slot can be easily extended with:
- Additional button sections
- Form inputs and controls
- Real-time status displays
- Integration with external APIs
- Custom styling and themes