// src/ui/src/components/Canvas.tsx

import React, { useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';
import { Toolbar } from './Toolbar';
import { CanvasArea } from './CanvasArea';
import { generateAstroFile } from '../utils/astroCodeGen';
import { BUTTON_LABELS, UI_TEXT } from '../../../shared/constants';
import type { CanvasToExtensionMessage } from '../../../shared/messageProtocol';

/**
 * Canvas - Main Orchestrator Component
 *
 * RESPONSIBILITIES (DEUTSCH):
 * - Verwendet useCanvas Mega-Hook für komplette State-Verwaltung
 * - Rendert Two-Column Layout: Toolbar (links) + CanvasArea (rechts)
 * - Keyboard Shortcuts: Cmd+S / Ctrl+S für Save
 * - Action Buttons: Save, Load, Clear Canvas, Generate Code
 * - Loading State während !isReady
 *
 * ARCHITECTURE (DEUTSCH):
 * ┌─────────────────────────────────────┐
 * │  Canvas (main container)            │
 * │  ┌──────────┬──────────────────────┐│
 * │  │ Toolbar  │  CanvasArea          ││
 * │  │ (200px)  │  (flex: 1)           ││
 * │  │          │                      ││
 * │  │ [Comps]  │  [Tree visualization]││
 * │  │          │                      ││
 * │  └──────────┴──────────────────────┘│
 * │  [Action Buttons Row]               │
 * └─────────────────────────────────────┘
 */
export default function Canvas() {
  // ==========================================================================
  // STATE FROM useCanvas MEGA-HOOK
  // ==========================================================================

  const {
    // Extension Bridge
    projectName,
    isReady,
    isValidProject,
    saveToExtension,
    loadFromExtension,

    // Tree Operations
    tree,
    handleDelete,
    clearCanvas,
    serializeCanvas,
    updateNodeProps,

    // Drag & Drop
    dragging,
    hover,
    setHover,
    handlePaletteDragStart,
    handleNodeDragStart,
    computeZone,
    performDrop,

    // Refs & Palette
    formRef,
    paletteMap,
  } = useCanvas();

  // ==========================================================================
  // KEYBOARD SHORTCUTS: Cmd+S / Ctrl+S for Save
  // ==========================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+S (Mac) or Ctrl+S (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser save dialog
        handleManualSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tree, formRef]);

  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================

  /**
   * Manual Save Handler
   *
   * FLOW (DEUTSCH):
   * 1. Serialisiere Tree mit DOM-Input-Werten
   * 2. Sende an Extension via saveToExtension
   */
  const handleManualSave = () => {
    const serialized = serializeCanvas();
    saveToExtension(serialized);
    console.log('Canvas: Manual save triggered');
  };

  /**
   * Load Handler
   *
   * FLOW (DEUTSCH):
   * 1. Sende LOAD_REQUEST an Extension
   * 2. Extension antwortet mit LOAD_RESPONSE (wird von useCanvas verarbeitet)
   */
  const handleLoad = () => {
    loadFromExtension();
    console.log('Canvas: Load triggered');
  };

  /**
   * Clear Canvas Handler
   *
   * FLOW (DEUTSCH):
   * 1. Zeige Confirmation-Dialog
   * 2. Bei Bestaetigung: Clear Tree
   */
  const handleClear = () => {
    if (window.confirm(UI_TEXT.CLEAR_CANVAS_CONFIRM)) {
      clearCanvas();
      console.log('Canvas: Canvas cleared');
    }
  };

  /**
   * Generate Code Handler
   *
   * FLOW (DEUTSCH):
   * 1. Prüfe ob isValidProject (nur in ttEditor-Projekten möglich)
   * 2. Serialisiere Tree
   * 3. Generiere Astro-Code mit generateAstroFile
   * 4. Sende GENERATE_CODE-Message an Extension
   */
  const handleGenerateCode = () => {
    if (!isValidProject) {
      alert(UI_TEXT.CODE_GEN_NOT_AVAILABLE);
      return;
    }

    const serialized = serializeCanvas();
    const astroCode = generateAstroFile(serialized, projectName);

    if (window.vscodeApi) {
      window.vscodeApi.postMessage({
        type: 'GENERATE_CODE',
        payload: astroCode,
      } as CanvasToExtensionMessage);
      console.log('Canvas: Code generation triggered');
    } else {
      console.error('Canvas: vscodeApi not available!');
    }
  };

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (!isReady) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingText}>{UI_TEXT.CANVAS_LOADING}</div>
      </div>
    );
  }

  // ==========================================================================
  // MAIN RENDER
  // ==========================================================================

  return (
    <div style={styles.container}>
      {/* Header with Project Name */}
      <div style={styles.header}>
        <h2 style={styles.title}>{projectName || 'ttEditor Canvas'}</h2>
        {isValidProject && (
          <span style={styles.badge}>{UI_TEXT.VALID_PROJECT}</span>
        )}
      </div>

      {/* Two-Column Layout: Toolbar + CanvasArea */}
      <div style={styles.mainContent}>
        {/* Left: Toolbar (Component Palette) */}
        <Toolbar
          paletteMap={paletteMap}
          handlePaletteDragStart={handlePaletteDragStart}
        />

        {/* Right: CanvasArea (Tree Visualization) */}
        <CanvasArea
          tree={tree}
          formRef={formRef}
          dragging={dragging}
          hover={hover}
          setHover={setHover}
          handleNodeDragStart={handleNodeDragStart}
          computeZone={computeZone}
          performDrop={performDrop}
          handleDelete={handleDelete}
          updateNodeProps={updateNodeProps}
          paletteMap={paletteMap}
        />
      </div>

      {/* Action Buttons Row */}
      <div style={styles.actionBar}>
        <button
          onClick={handleManualSave}
          style={styles.button}
          title="Cmd+S / Ctrl+S"
        >
          {BUTTON_LABELS.SAVE}
        </button>

        <button onClick={handleLoad} style={styles.button}>
          {BUTTON_LABELS.LOAD}
        </button>

        <button onClick={handleClear} style={{ ...styles.button, ...styles.buttonDanger }}>
          {BUTTON_LABELS.CLEAR}
        </button>

        <button
          onClick={handleGenerateCode}
          style={{
            ...styles.button,
            ...styles.buttonPrimary,
            ...(isValidProject ? {} : styles.buttonDisabled),
          }}
          disabled={!isValidProject}
        >
          {BUTTON_LABELS.GENERATE_CODE}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// INLINE STYLES
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
    color: 'var(--vscode-editor-foreground, #333)',
    fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)',
  },

  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100%',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
    color: 'var(--vscode-editor-foreground, #333)',
  },

  loadingText: {
    fontSize: '16px',
    fontWeight: 500,
  },

  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: '1px solid var(--vscode-panel-border, #ddd)',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
  },

  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--vscode-editor-foreground, #333)',
  },

  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '3px',
    backgroundColor: 'var(--vscode-badge-background, #4a90e2)',
    color: 'var(--vscode-badge-foreground, #fff)',
    fontWeight: 500,
  },

  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },

  actionBar: {
    display: 'flex',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid var(--vscode-panel-border, #ddd)',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
  },

  button: {
    padding: '6px 16px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid var(--vscode-button-border, transparent)',
    borderRadius: '2px',
    cursor: 'pointer',
    backgroundColor: 'var(--vscode-button-secondaryBackground, #f5f5f5)',
    color: 'var(--vscode-button-secondaryForeground, #333)',
    transition: 'background-color 0.15s ease',
  },

  buttonPrimary: {
    backgroundColor: 'var(--vscode-button-background, #4a90e2)',
    color: 'var(--vscode-button-foreground, #fff)',
  },

  buttonDanger: {
    backgroundColor: 'var(--vscode-inputValidation-errorBackground, #e74c3c)',
    color: '#fff',
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
