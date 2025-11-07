// TypeScript-Deklaration für VSCode Webview API
interface VsCodeApi {
  postMessage(message: any): void;
  getState(): any;
  setState(state: any): void;
}

interface Window {
  vscodeApi?: VsCodeApi;
}
