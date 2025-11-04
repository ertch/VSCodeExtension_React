// src/ui/src/components/Toolbar.tsx

import React from 'react';
import type { ComponentPaletteEntry } from '../utils/componentPalette';

/**
 * Toolbar Component (STUB)
 *
 * TODO: Implement full component palette with drag-and-drop
 */

interface ToolbarProps {
  paletteMap: Map<string, ComponentPaletteEntry>;
  handlePaletteDragStart: (e: React.DragEvent, type: string) => void;
}

export function Toolbar({ paletteMap, handlePaletteDragStart }: ToolbarProps) {
  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Komponenten</h3>
      <div style={styles.list}>
        {Array.from(paletteMap.values()).map((entry) => (
          <div
            key={entry.type}
            draggable
            onDragStart={(e) => handlePaletteDragStart(e, entry.type)}
            style={styles.item}
          >
            {entry.label}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '200px',
    borderRight: '1px solid var(--vscode-panel-border, #ddd)',
    backgroundColor: 'var(--vscode-sideBar-background, #f5f5f5)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  title: {
    margin: 0,
    padding: '12px 16px',
    fontSize: '13px',
    fontWeight: 600,
    borderBottom: '1px solid var(--vscode-panel-border, #ddd)',
    color: 'var(--vscode-editor-foreground, #333)',
  },

  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px',
  },

  item: {
    padding: '8px 12px',
    marginBottom: '4px',
    fontSize: '12px',
    cursor: 'grab',
    borderRadius: '3px',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
    border: '1px solid var(--vscode-panel-border, #ddd)',
    transition: 'background-color 0.15s ease',
  },
};
