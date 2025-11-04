/// <reference types="vite/client" />

// Extend Window interface for VSCode API
interface Window {
  vscodeApi?: {
    postMessage(message: any): void;
    getState(): any;
    setState(state: any): void;
  };
}
