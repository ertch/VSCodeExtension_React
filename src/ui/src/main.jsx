
import React from "react";
import ReactDOM from "react-dom/client";
import Canvas from './components/Canvas.jsx';
import { previewComponents } from "./utils/componentPalette";
import "./css/main.scss";

// VSCode Webview API initialisieren
if (typeof window.acquireVsCodeApi !== 'undefined') {
  window.vscodeApi = window.acquireVsCodeApi();
}

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <Canvas palette={previewComponents}/>
    </React.StrictMode>
);
