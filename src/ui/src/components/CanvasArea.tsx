// src/ui/src/components/CanvasArea.tsx

import React from 'react';
import type { ComponentNode } from '../../../shared/messageProtocol';
import type { ComponentPaletteEntry } from '../utils/componentPalette';
import { UI_TEXT } from '../../../shared/constants';

/**
 * CanvasArea Component (STUB)
 *
 * TODO: Implement full tree visualization with drag-and-drop
 */

interface CanvasAreaProps {
  tree: ComponentNode[];
  formRef: React.RefObject<HTMLFormElement>;
  dragging: { kind: 'NEW' | 'MOVE'; type?: string; nodeId?: string } | null;
  hover: { targetId: string | null; zone: 'above' | 'below' | 'inside' | null };
  setHover: React.Dispatch<React.SetStateAction<{ targetId: string | null; zone: 'above' | 'below' | 'inside' | null }>>;
  handleNodeDragStart: (e: React.DragEvent, nodeId: string) => void;
  computeZone: (e: React.DragEvent, targetNode: ComponentNode) => 'above' | 'below' | 'inside';
  performDrop: (params: {
    dropTargetId: string | null;
    zone: 'above' | 'below' | 'inside';
    payload: { kind: 'NEW' | 'MOVE'; type?: string; nodeId?: string } | null;
  }) => void;
  handleDelete: (nodeId: string) => void;
  updateNodeProps: (nodeId: string, newProps: Record<string, any>) => void;
  paletteMap: Map<string, ComponentPaletteEntry>;
}

export function CanvasArea({ tree, formRef, performDrop, dragging }: CanvasAreaProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/x-canvas');
    if (!data) return;

    const payload = JSON.parse(data);
    performDrop({
      dropTargetId: null,
      zone: 'inside',
      payload,
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div style={styles.container}>
      <form
        ref={formRef}
        style={styles.form}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {tree.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyText}>{UI_TEXT.CANVAS_EMPTY}</div>
            <div style={styles.emptyHint}>{UI_TEXT.CANVAS_EMPTY_HINT}</div>
          </div>
        ) : (
          <div style={styles.treeContainer}>
            {tree.map((node) => (
              <div key={node.id} style={styles.nodeCard}>
                {node.type} [{node.id.slice(0, 8)}]
              </div>
            ))}
          </div>
        )}
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    flex: 1,
    overflow: 'auto',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
  },

  form: {
    minHeight: '100%',
    padding: '16px',
  },

  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
    textAlign: 'center',
  },

  emptyText: {
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--vscode-descriptionForeground, #666)',
    marginBottom: '8px',
  },

  emptyHint: {
    fontSize: '13px',
    color: 'var(--vscode-descriptionForeground, #999)',
  },

  treeContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },

  nodeCard: {
    padding: '12px 16px',
    border: '1px solid var(--vscode-panel-border, #ddd)',
    borderRadius: '4px',
    backgroundColor: 'var(--vscode-editor-background, #fff)',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
};
