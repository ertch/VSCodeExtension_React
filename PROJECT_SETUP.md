# VS Code Extension with React UI - Project Documentation

## Architecture Overview

This VS Code extension is a **Code Snippet Generator** that integrates a React-based user interface with an interactive sidebar, providing a low-code development experience. Users can generate HTML components by clicking sidebar buttons, which are then injected and rendered in real-time within the React application.

### Key Components

- **Extension Host**: TypeScript-based VS Code extension (`src/extension.ts`)
- **Code Snippet Generator**: React application (`src/ui/`) that receives and renders HTML snippets
- **Interactive Sidebar**: HTML interface with snippet generation tools
- **Snippet Library**: Modular HTML files (`src/snippets/`) for different component types
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
│   ├── snippets/            # HTML snippet library
│   │   ├── tool1-snippet.html  # Basic component snippet
│   │   └── tool2-snippet.html  # Advanced component snippet
│   └── ui/                 # React UI application
│       ├── src/
│       │   ├── components/  # React components (Card.tsx)
│       │   ├── css/        # Stylesheets
│       │   └── main.jsx    # React app entry point
│       ├── index.html      # HTML template
│       └── vite.config.js  # Vite configuration
├── dist/                   # Built extension files
├── media/                  # Extension icons and assets
└── package.json           # Extension manifest
```

### Key Features

1. **Code Snippet Generation**: Click sidebar buttons to generate HTML components
2. **Real-time DOM Injection**: Snippets are instantly rendered in the React application
3. **Modular Snippet System**: HTML snippets stored as separate files for easy customization
4. **Interactive React Canvas**: Live preview area where generated components appear
5. **Snippet Management**: Individual removal, clear all functionality, and visual organization
6. **Low-Code Development**: Build UI components without writing code manually
7. **Dual Webview Architecture**: Separate sidebar controls and main React display
8. **Message Communication**: Real-time communication between sidebar and React app
9. **Theme Integration**: Components automatically adapt to VS Code themes
10. **Extensible Architecture**: Easy to add new snippet types and generation tools

### Build Configuration

- **Extension**: ESBuild bundles TypeScript to `dist/extension.js`
- **React UI**: Vite builds React app to `src/ui/dist/`
- **Snippet Files**: Raw HTML files loaded dynamically by extension
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
   - Use the code snippet generation tools:
     - Click "Tool 1 - Basic Component" to generate a blue-themed input component
     - Click "Tool 2 - Advanced Component" to generate a green-themed component with dropdown
     - Open the main React panel to see generated components
     - Use snippet management features (individual removal, clear all)

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
- HTML snippets are stored as separate files in `src/snippets/` for easy modification
- CSP headers are configured for both sidebar and main webview security
- Extension supports both command palette and activity bar access
- Generated components use `dangerouslySetInnerHTML` for dynamic HTML rendering
- Snippet generation works in real-time without requiring page refresh

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

### Code Snippet Generation Features
- **Quick Actions Section**: 
  - 📋 Open Extension Panel (launches main React UI)
  - 💬 Show Alert (demonstrates VS Code integration)  
  - ⚙️ Settings (placeholder for future features)
- **Code Snippet Tools Section**: 
  - 🔧 Tool 1 - Basic Component (generates blue-themed input field)
  - 🔨 Tool 2 - Advanced Component (generates green-themed form with dropdown)
- **Info Display**: Shows extension version and ready status

### React Application Features
- **Snippet Canvas**: Main area where generated components are rendered
- **Real-time Updates**: Components appear instantly when generated from sidebar
- **Snippet Management**:
  - Individual snippet removal with ✕ button
  - "Clear All Snippets" button to remove all components
  - Visual headers showing which tool generated each snippet
- **Responsive Layout**: Components stack vertically with proper spacing
- **Empty State**: Helpful message when no snippets are present

### Message Communication Flow

#### 1. Sidebar to Extension Host
```typescript
// Generate snippet command
webview.postMessage({
    command: 'insertSnippet',
    tool: 'tool1' | 'tool2'
});

// Other commands
webview.postMessage({
    command: 'openMainPanel' | 'alert',
    text?: string
});
```

#### 2. Extension Host Processing
```typescript
switch (message.command) {
    case 'insertSnippet':
        this.handleSnippetInsertion(message.tool);
        break;
    case 'openMainPanel':
        vscode.commands.executeCommand('vscExtension.showWebview');
        break;
}
```

#### 3. Extension Host to React App
```typescript
// Send loaded snippet to React
mainPanel.webview.postMessage({
    command: 'insertSnippet',
    tool: tool,
    content: snippetContent  // HTML from snippet file
});
```

#### 4. React App Processing
```typescript
// React receives and renders snippet
const handleMessage = (event: MessageEvent) => {
    if (event.data.command === 'insertSnippet') {
        const newSnippet = {
            id: Date.now().toString(),
            content: event.data.content,
            tool: event.data.tool
        };
        setSnippets(prev => [...prev, newSnippet]);
    }
};
```

## Snippet System Architecture

### Adding New Snippets
1. **Create HTML File**: Add new snippet in `src/snippets/toolX-snippet.html`
2. **Update Sidebar**: Add button with `onclick="insertSnippet('toolX')"`
3. **Test**: Snippets are loaded dynamically - no code changes needed

### Current Snippet Templates
- **tool1-snippet.html**: Blue-themed basic component with text input
- **tool2-snippet.html**: Green-themed advanced component with input and dropdown

### Extensibility Options
1. **More Snippet Types**: Forms, buttons, cards, navigation components
2. **Interactive Components**: Add JavaScript functionality to snippets  
3. **Template Variables**: Dynamic content replacement in snippets
4. **Snippet Categories**: Organize tools into themed sections
5. **Export Functionality**: Save generated components as HTML/React files
6. **Custom Styling**: User-configurable themes and colors
7. **Component Library**: Build reusable component collections
8. **Integration APIs**: Connect with design systems and component libraries

This foundation provides a **low-code development environment** where users can visually build UI components through simple button clicks, making it an excellent base for more advanced code generation tools.