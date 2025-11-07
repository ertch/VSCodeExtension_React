/**
 * SidebarProvider - Provides content for VSCode Sidebar View
 */
import * as vscode from 'vscode';
export declare class SidebarProvider implements vscode.WebviewViewProvider {
    private readonly context;
    constructor(context: vscode.ExtensionContext);
    resolveWebviewView(webviewView: vscode.WebviewView): void;
    /**
     * Generate professional sidebar HTML
     */
    private getSidebarHTML;
}
//# sourceMappingURL=SidebarProvider.d.ts.map