import * as vscode from 'vscode';
import { SidebarProvider } from '../providers/SidebarProvider';
export declare class WebviewManager {
    private context;
    private panel;
    private readonly distPath;
    private htmlCache;
    private readonly outputChannel;
    private sidebarProvider?;
    constructor(context: vscode.ExtensionContext, outputChannel?: vscode.OutputChannel, sidebarProvider?: SidebarProvider);
    createOrShow(): Promise<void>;
    private getWebviewOptions;
    private loadIndexHTML;
    private getWebviewUri;
    private buildCSP;
    private handleMessage;
    private handlePreviewUpdate;
    private handleAstroGeneration;
    clearCache(): void;
    dispose(): void;
}
//# sourceMappingURL=WebviewManager.d.ts.map