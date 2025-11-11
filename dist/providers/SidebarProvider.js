"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class SidebarProvider {
    constructor(context) {
        this.context = context;
    }
    resolveWebviewView(webviewView) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this.context.extensionUri]
        };
        webviewView.webview.html = this.getSidebarHTML(webviewView.webview);
        // Handle messages from webview
        webviewView.webview.onDidReceiveMessage(async (message) => {
            if (message.type === 'openEditor') {
                try {
                    await vscode.commands.executeCommand('vscExtension.showWebview');
                }
                catch (error) {
                    console.error('Failed to open editor:', error);
                }
            }
        });
        // Don't auto-open main panel on startup anymore
        // User can click the button when they want
    }
    updatePreview(data) {
        if (!this.view) {
            return;
        }
        // Send update to webview
        this.view.webview.postMessage({
            type: 'updatePreview',
            data
        });
    }
    getSidebarHTML(webview) {
        const cspSource = webview.cspSource;
        return `
    <!DOCTYPE html>
      <html lang="de">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="
            default-src 'none';
            style-src ${cspSource} 'unsafe-inline';
            script-src ${cspSource} 'unsafe-inline';
          ">
          <title>DOM Preview</title>
          <style>
            body {
              font-family: var(--vscode-font-family);
              padding: 0;
              margin: 0;
              color: var(--vscode-foreground);
              background-color: var(--vscode-editor-background);
              font-size: 13px;
            }
            .preview-header {
              padding: 12px;
              background-color: var(--vscode-sideBarSectionHeader-background);
              border-bottom: 1px solid var(--vscode-panel-border);
              position: sticky;
              top: 0;
              z-index: 10;
            }
            .preview-header h3 {
              margin: 0 0 8px 0;
              font-size: 14px;
              font-weight: 600;
              color: var(--vscode-textLink-foreground);
            }
            .preview-tab-name {
              font-size: 11px;
              opacity: 0.7;
              margin-bottom: 8px;
            }
            .open-editor-btn {
              width: 100%;
              padding: 6px 12px;
              background-color: var(--vscode-button-background);
              color: var(--vscode-button-foreground);
              border: none;
              border-radius: 2px;
              cursor: pointer;
              font-size: 12px;
              font-family: var(--vscode-font-family);
              transition: background-color 0.2s;
            }
            .open-editor-btn:hover {
              background-color: var(--vscode-button-hoverBackground);
            }
            .open-editor-btn:active {
              transform: translateY(1px);
            }
            .preview-content {
              padding: 12px;
              overflow-y: auto;
              max-height: calc(100vh - 60px);
            }
            .preview-placeholder {
              opacity: 0.6;
              font-style: italic;
              text-align: center;
              margin-top: 40px;
            }
            .component-tree {
              list-style: none;
              padding-left: 0;
              margin: 0;
            }
            .component-item {
              padding: 4px 0;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.6;
            }
            .component-tag {
              color: var(--vscode-symbolIcon-classForeground);
            }
            .component-bracket {
              color: var(--vscode-symbolIcon-keywordForeground);
            }
            .indent {
              display: inline-block;
              width: 16px;
            }
          </style>
        </head>
        <body>
          <div class="preview-header">
            
            <button class="open-editor-btn" id="openEditorBtn">
              Editor öffnen
            </button>
          </div>
          <div class="preview-content">
          <h3>DOM Preview</h3>
            <div class="preview-tab-name" id="tabName">-</div>
            <div class="preview-placeholder" id="placeholder">
              Warten auf Canvas-Änderungen...
            </div>
            <div id="previewTree" style="display: none;"></div>
          </div>
          <script>
            (function() {
              const vscode = acquireVsCodeApi();

              // Open editor button
              const openEditorBtn = document.getElementById('openEditorBtn');
              openEditorBtn.addEventListener('click', () => {
                vscode.postMessage({ type: 'openEditor' });
              });

              const placeholder = document.getElementById('placeholder');
              const previewTree = document.getElementById('previewTree');
              const tabNameEl = document.getElementById('tabName');

              // Listen for messages from extension
              window.addEventListener('message', event => {
                const message = event.data;

                if (message.type === 'updatePreview') {
                  updatePreview(message.data);
                }
              });

              function updatePreview(data) {
                const { components, tabName } = data;

                // Update tab name
                tabNameEl.textContent = 'Tab: ' + tabName;

                if (!components || components.length === 0) {
                  placeholder.style.display = 'block';
                  previewTree.style.display = 'none';
                  return;
                }

                placeholder.style.display = 'none';
                previewTree.style.display = 'block';

                // Build HTML tree with proper closing tags
                let html = '<div class="component-tree">';
                const stack = []; // Stack to track open tags

                components.forEach((comp, index) => {
                  const indent = '  '.repeat(comp.depth);
                  const spaces = indent.replace(/ /g, '<span class="indent"></span>');

                  // Close tags if we're back at a lower depth
                  while (stack.length > 0 && stack[stack.length - 1].depth >= comp.depth) {
                    const closing = stack.pop();
                    const closingIndent = '  '.repeat(closing.depth);
                    const closingSpaces = closingIndent.replace(/ /g, '<span class="indent"></span>');
                    html += '<div class="component-item">';
                    html += closingSpaces;
                    html += '<span class="component-bracket">&lt;/</span>';
                    html += '<span class="component-tag">' + escapeHtml(closing.type) + '</span>';
                    html += '<span class="component-bracket">&gt;</span>';
                    html += '</div>';
                  }

                  if (comp.canHaveChildren) {
                    // Opening tag for components that can have children
                    html += '<div class="component-item">';
                    html += spaces;
                    html += '<span class="component-bracket">&lt;</span>';
                    html += '<span class="component-tag">' + escapeHtml(comp.type) + '</span>';
                    html += '<span class="component-bracket">&gt;</span>';
                    html += '</div>';

                    // Add to stack to close later
                    stack.push({ type: comp.type, depth: comp.depth });
                  } else {
                    // Self-closing tag
                    html += '<div class="component-item">';
                    html += spaces;
                    html += '<span class="component-bracket">&lt;</span>';
                    html += '<span class="component-tag">' + escapeHtml(comp.type) + '</span>';
                    html += '<span class="component-bracket"> /&gt;</span>';
                    html += '</div>';
                  }
                });

                // Close any remaining open tags
                while (stack.length > 0) {
                  const closing = stack.pop();
                  const closingIndent = '  '.repeat(closing.depth);
                  const closingSpaces = closingIndent.replace(/ /g, '<span class="indent"></span>');
                  html += '<div class="component-item">';
                  html += closingSpaces;
                  html += '<span class="component-bracket">&lt;/</span>';
                  html += '<span class="component-tag">' + escapeHtml(closing.type) + '</span>';
                  html += '<span class="component-bracket">&gt;</span>';
                  html += '</div>';
                }

                html += '</div>';
                previewTree.innerHTML = html;
              }

              function escapeHtml(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
              }
            })();
          </script>
        </body>
      </html>`;
    }
}
exports.SidebarProvider = SidebarProvider;
//# sourceMappingURL=SidebarProvider.js.map