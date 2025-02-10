# VSCreact

## Overview
VSCreact is a **VS Code extension** that provides a **low-code editing environment** for Astro projects. It allows users to create, configure, and manage Astro components via a GUI instead of manually editing code. The extension uses **React** for the frontend and generates Astro-compatible code dynamically.

## Features
- **Component-Based Editing**: Define and configure Astro components via an interactive UI.
- **Code Generation**: Generates `index.astro` based on the configured components.
- **Hot Reload Support**: Automatically updates the project on changes.
- **Attribute-Based Logic**: Components are controlled exclusively via attributes.
- **Drag-and-Drop Interface**: Easily arrange and modify components.
- **Unique ID Handling**: Ensures component uniqueness to prevent errors.

## Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/ertch/VSCodeExtension_React
   ```
2. Navigate to the directory:
   ```sh
   cd VSCreact
   ```
3. Install dependencies:
   ```sh
   npm install
   ```
4. Build the extension:
   ```sh
   npm run build
   ```
5. Open VS Code and install the extension manually:
   - Run `vsce package` (if required, install `vsce` via `npm install -g @vscode/vsce`).
   - Install the generated `.vsix` file in VS Code.

## Usage
1. Open a project in **VS Code**.
2. Activate the **VSCreact** extension.
3. Use the GUI to add, configure, and manage components.
4. Click the **Generate** button to create the `index.astro` file.
5. Check the **Live Preview** to see updates immediately.

## Development Workflow
### Code Generation
- **Trigger**: The `Generate` button initiates the code generation.
- **Process**:
  - The UI-defined components are serialized.
  - The `index.astro` file is dynamically created.
  - The project’s hot-reload updates the preview.

### GUI Structure
- **Component Selector**: Choose components to add.
- **Property Panel**: Modify attributes of selected components.
- **Canvas Area**: Arrange components visually.
- **Code Preview**: View the generated Astro code in real-time.

## Contribution
### Prerequisites
- **Node.js** (LTS version recommended)
- **VS Code** (latest version)
- **Astro Framework** (for testing compatibility)

## Contact
For issues, feature requests, or contributions, open an issue in the GitHub repository or contact the maintainers.

---
**Maintainers:**
- [etch](https://github.com/etch)

