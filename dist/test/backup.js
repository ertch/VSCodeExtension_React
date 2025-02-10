"use strict";
// Backup package.json
// { 
//   "name": "tteditor",
//   "displayName": "ttEditor",
//   "description": "GUI for LowCode with ttEditor",
//   "version": "0.0.1",
//   "publisher": "dein-name",
//   "engines": {
//     "vscode": "^1.96.0"
//   },
//   "categories": ["Other"],
//   "activationEvents": ["onCommand:tteditor.showWebview"],
//   "main": "./dist/extension.js",
//   "contributes": {
//     "commands": [
//       {
//         "command": "tteditor.showWebview",
//         "title": "Open ttEditor Panel"
//       }
//     ]
//   },
//   "scripts": {
//     "compile": "tsc && node esbuild.js",
//     "watch": "tsc --watch",
//     "pretest": "npm run compile",
//     "test": "vscode-test"
//   },
//   "devDependencies": {
//     "@types/vscode": "^1.96.0",
//     "typescript": "^5.7.3",
//     "vscode-test": "^1.5.0"
//   }
// }
// backup extensions.ts
// import * as vscode from 'vscode';
// import * as path from 'path';
// export function activate(context: vscode.ExtensionContext) {
//     let disposable = vscode.commands.registerCommand('tteditor.showWebview', () => {
//         const panel = vscode.window.createWebviewPanel(
//             'tteditorWebview', // Identifikator der Webview
//             'ttEditor Panel',   // Titel der Webview
//             vscode.ViewColumn.One, // Wo das Panel angezeigt wird
//             { enableScripts: true } // Erlaubt JavaScript in der Webview
//         );
//         // HTML-Content für die Webview
//         const htmlPath = vscode.Uri.file(path.join(context.extensionPath, 'build', 'index.html'));
//         panel.webview.html = getWebviewContent(htmlPath);
//     });
//     context.subscriptions.push(disposable);
// }
// export function deactivate() {}
// function getWebviewContent(htmlPath: vscode.Uri) {
//     return `
//         <!DOCTYPE html>
//         <html lang="de">
//         <head>
//             <meta charset="UTF-8">
//             <meta name="viewport" content="width=device-width, initial-scale=1.0">
//             <title>ttEditor Webview</title>
//         </head>
//         <body>
//             <h1>Test<h1>
//         </body>
//         </html>
//     `;
// }
