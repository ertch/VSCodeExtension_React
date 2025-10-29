/**
 * React Entry Point
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import Canvas from './components/Canvas';
import './index.css';

// VS Code API is already injected by the host HTML
// Don't call acquireVsCodeApi() again - it can only be called once
console.log('React app starting, vscodeApi available:', !!window.vscodeApi);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Canvas />
  </React.StrictMode>
);
