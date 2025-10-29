/**
 * Extension Bridge Hook
 * Managed Kommunikation zwischen Canvas und VS Code Extension
 */

import { useState, useEffect, useCallback } from 'react';

export function useExtensionBridge() {
  const [config, setConfig] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [isValidProject, setIsValidProject] = useState(false);

  useEffect(() => {
    // Listen for messages from Extension
    const handler = (event) => {
      const msg = event.data;

      switch (msg.type) {
        case 'INIT':
          console.log('Canvas: Received INIT', msg.payload);
          setProjectName(msg.payload.projectName);
          setIsValidProject(msg.payload.isValidProject || false);
          if (msg.payload.config) {
            setConfig(msg.payload.config);
          }
          setIsReady(true);
          break;

        case 'LOAD_RESPONSE':
          console.log('Canvas: Received LOAD_RESPONSE');
          setConfig(msg.payload);
          break;

        case 'SAVE_SUCCESS':
          console.log('Canvas: Save successful', msg.filePath);
          // Optional: Show toast notification
          break;

        case 'ERROR':
          console.error('Canvas: Extension error', msg.message);
          alert(`Fehler: ${msg.message}`);
          break;

        default:
          console.warn('Canvas: Unknown message type', msg);
      }
    };

    window.addEventListener('message', handler);

    // Signal ready to Extension
    if (window.vscodeApi) {
      window.vscodeApi.postMessage({ type: 'READY' });
      console.log('Canvas: Sent READY signal');
    }

    return () => window.removeEventListener('message', handler);
  }, []);

  /**
   * Speichert Config in Extension (.ttEditor.json)
   */
  const saveToExtension = useCallback(
    (tree, metadata = {}) => {
      if (!window.vscodeApi) {
        console.error('Canvas: vscodeApi not available');
        return;
      }

      const payload = {
        version: '1.0',
        projectName,
        lastModified: new Date().toISOString(),
        tree,
        metadata,
      };

      window.vscodeApi.postMessage({
        type: 'SAVE',
        payload,
      });

      console.log('Canvas: Sent SAVE request');
    },
    [projectName]
  );

  /**
   * Lädt Config von Extension
   */
  const loadFromExtension = useCallback(() => {
    if (!window.vscodeApi) {
      console.error('Canvas: vscodeApi not available');
      return;
    }

    window.vscodeApi.postMessage({
      type: 'LOAD_REQUEST',
    });

    console.log('Canvas: Sent LOAD_REQUEST');
  }, []);

  return {
    config,
    projectName,
    isReady,
    isValidProject,
    saveToExtension,
    loadFromExtension,
  };
}
