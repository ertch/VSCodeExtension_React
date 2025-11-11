import * as vscode from 'vscode';
export declare class SidebarProvider implements vscode.WebviewViewProvider {
    private context;
    private view?;
    constructor(context: vscode.ExtensionContext);
    resolveWebviewView(webviewView: vscode.WebviewView): void;
    updatePreview(data: {
        components: any[];
        tabName: string;
        tabId: string;
    }): void;
    private getSidebarHTML;
}
//# sourceMappingURL=SidebarProvider.d.ts.map