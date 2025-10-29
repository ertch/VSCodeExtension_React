"use strict";
/**
 * Webview Manager
 * Erstellt und verwaltet das Canvas Webview
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCanvasWebview = createCanvasWebview;
exports.handleWebviewMessage = handleWebviewMessage;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const projectConfig_1 = require("./shared/projectConfig");
let canvasPanel;
// ============================================================================
// CREATE WEBVIEW
// ============================================================================
function createCanvasWebview(context, workspaceRoot, isValidProject) {
    // If panel exists, reveal it
    if (canvasPanel) {
        canvasPanel.reveal(vscode.ViewColumn.One);
        return canvasPanel;
    }
    const projectName = path.basename(workspaceRoot);
    // Create new panel
    canvasPanel = vscode.window.createWebviewPanel('ttEditorCanvas', `${projectName} - Canvas`, vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath, 'src', 'ui', 'dist')),
        ],
    });
    // Set HTML content
    canvasPanel.webview.html = getCanvasHTML(canvasPanel.webview, context);
    // Handle disposal
    canvasPanel.onDidDispose(() => {
        canvasPanel = undefined;
    }, null, context.subscriptions);
    // Handle messages from Canvas
    canvasPanel.webview.onDidReceiveMessage((message) => __awaiter(this, void 0, void 0, function* () {
        yield handleWebviewMessage(message, canvasPanel, workspaceRoot);
    }), null, context.subscriptions);
    // Send initial config
    sendInitMessage(canvasPanel, workspaceRoot, projectName, isValidProject);
    return canvasPanel;
}
// ============================================================================
// MESSAGE HANDLER
// ============================================================================
function handleWebviewMessage(message, panel, workspaceRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (message.type) {
            case 'READY':
                console.log('TT-Editor: Canvas ready');
                break;
            case 'SAVE':
                yield handleSave(message.payload, panel, workspaceRoot);
                break;
            case 'LOAD_REQUEST':
                yield handleLoadRequest(panel, workspaceRoot);
                break;
            default:
                console.warn('TT-Editor: Unknown message type', message);
        }
    });
}
// ============================================================================
// SAVE HANDLER
// ============================================================================
function handleSave(config, panel, workspaceRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Validate config
            if (!(0, projectConfig_1.validateProjectConfig)(config)) {
                throw new Error('Invalid project configuration');
            }
            // Update timestamp
            const updatedConfig = (0, projectConfig_1.updateTimestamp)(config);
            // Write to file
            const configPath = path.join(workspaceRoot, '.ttEditor.json');
            fs.writeFileSync(configPath, JSON.stringify(updatedConfig, null, 2), 'utf-8');
            console.log('TT-Editor: Configuration saved', configPath);
            // Send success message
            const successMsg = {
                type: 'SAVE_SUCCESS',
                filePath: configPath,
            };
            panel.webview.postMessage(successMsg);
            vscode.window.showInformationMessage('TT-Editor: Konfiguration gespeichert');
        }
        catch (err) {
            console.error('TT-Editor: Save failed', err);
            const errorMsg = {
                type: 'ERROR',
                message: `Fehler beim Speichern: ${err}`,
            };
            panel.webview.postMessage(errorMsg);
            vscode.window.showErrorMessage(`TT-Editor: Fehler beim Speichern - ${err}`);
        }
    });
}
// ============================================================================
// LOAD HANDLER
// ============================================================================
function handleLoadRequest(panel, workspaceRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const config = loadConfig(workspaceRoot);
            if (!config) {
                vscode.window.showWarningMessage('TT-Editor: Keine gespeicherte Konfiguration gefunden');
                return;
            }
            const loadMsg = {
                type: 'LOAD_RESPONSE',
                payload: config,
            };
            panel.webview.postMessage(loadMsg);
            console.log('TT-Editor: Configuration loaded');
        }
        catch (err) {
            console.error('TT-Editor: Load failed', err);
            const errorMsg = {
                type: 'ERROR',
                message: `Fehler beim Laden: ${err}`,
            };
            panel.webview.postMessage(errorMsg);
            vscode.window.showErrorMessage(`TT-Editor: Fehler beim Laden - ${err}`);
        }
    });
}
// ============================================================================
// CONFIG I/O
// ============================================================================
/**
 * Lädt .ttEditor.json aus Workspace Root
 */
function loadConfig(workspaceRoot) {
    const configPath = path.join(workspaceRoot, '.ttEditor.json');
    if (!fs.existsSync(configPath)) {
        console.log('TT-Editor: No .ttEditor.json found');
        return null;
    }
    try {
        const content = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(content);
        if (!(0, projectConfig_1.validateProjectConfig)(config)) {
            throw new Error('Invalid configuration format');
        }
        return config;
    }
    catch (err) {
        console.error('TT-Editor: Failed to load config', err);
        throw new Error(`Korrupte Konfigurationsdatei: ${err}`);
    }
}
/**
 * Sendet INIT Message an Canvas mit optional geladener Config
 */
function sendInitMessage(panel, workspaceRoot, projectName, isValidProject) {
    const config = loadConfig(workspaceRoot);
    const initMsg = {
        type: 'INIT',
        payload: {
            projectName,
            config: config || null,
            isValidProject,
        },
    };
    // Send after short delay to ensure webview is ready
    setTimeout(() => {
        panel.webview.postMessage(initMsg);
        console.log('TT-Editor: INIT message sent', { isValidProject });
    }, 100);
}
// ============================================================================
// HTML GENERATION
// ============================================================================
function getCanvasHTML(webview, context) {
    // Read the built index.html from Vite
    const indexPath = vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist', 'index.html'));
    let html = fs.readFileSync(indexPath.fsPath, 'utf-8');
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.js')));
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'src/ui/dist/assets/index.css')));
    const cspSource = webview.cspSource;
    const cspMetaTag = `
    <meta http-equiv="Content-Security-Policy" content="
      default-src 'self' ${cspSource};
      script-src 'unsafe-inline' 'unsafe-eval' ${cspSource} ${scriptUri};
      style-src 'unsafe-inline' ${cspSource} ${styleUri};
    ">
  `;
    // Inject CSP, styles, and scripts into the head
    html = html.replace('<head>', `<head>${cspMetaTag}
    <link rel="stylesheet" href="${styleUri}">
    <script>
      window.vscodeApi = acquireVsCodeApi();
      console.log('VS Code API injected:', !!window.vscodeApi);
    </script>
    <script type="module" src="${scriptUri}" defer></script>
  `);
    return html;
}
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
