import { useRef, useEffect, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { NodeWrapperProps } from '../../utils/types/canvas';
import { TrashIcon } from './components';

export function NodeWrapper({ node, meta, onDelete, uniqueContextId, children }: NodeWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const childrenRef = useRef<HTMLDivElement>(null);
  const [dropIndicator, setDropIndicator] = useState<'above' | 'below' | 'inside' | null>(null);

  // Make node draggable
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({
        kind: "MOVE",
        nodeId: node.id,
        contextId: uniqueContextId,
      }),
    });
  }, [node.id, uniqueContextId]);

  // Make node content a drop target (for above/below)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const computeZone = (input: { clientY: number }, element: HTMLElement): 'above' | 'below' => {
      const rect = element.getBoundingClientRect();
      const y = input.clientY - rect.top;
      const h = rect.height;

      // Content-Bereich: nur above/below
      if (y < h * 0.5) {
        return "above";
      } else {
        return "below";
      }
    };

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: ({ input, element }) => {
        const zone = computeZone(input, element);
        return { nodeId: node.id, zone };
      },
      onDragEnter: ({ self }) => {
        setDropIndicator(self.data.zone);
      },
      onDrag: ({ self }) => {
        setDropIndicator(self.data.zone);
      },
      onDragLeave: () => {
        setDropIndicator(null);
      },
      onDrop: () => {
        // Entfernt: Drop-Verarbeitung erfolgt jetzt zentral im Monitor
        setDropIndicator(null);
      },
    });
  }, [node.id, uniqueContextId]);

  // Make children area a drop target (only for containers, always "inside")
  useEffect(() => {
    if (!node.canHaveChildren) return;

    const el = childrenRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: () => {
        return { nodeId: node.id, zone: "inside" };
      },
      onDragEnter: () => {
        setDropIndicator("inside");
      },
      onDrag: () => {
        setDropIndicator("inside");
      },
      onDragLeave: () => {
        setDropIndicator(null);
      },
      onDrop: () => {
        setDropIndicator(null);
      },
    });
  }, [node.id, node.canHaveChildren, uniqueContextId]);

  const Comp = meta.Component;

  // Bereite Slot-Props vor (nur für canHaveChildren)
  const slotProps = node.canHaveChildren ? {
    children,
    ref: childrenRef,
    isEmpty: !children || children.length === 0,
  } : undefined;

  return (
    <div
      ref={wrapperRef}
      className="canvas-node-wrapper"
      data-node-id={node.id}
    >
      {/* Drop-Indikatoren */}
      {dropIndicator === "above" && (
        <div className="canvas-drop-indicator top" />
      )}
      {dropIndicator === "below" && (
        <div className="canvas-drop-indicator bottom" />
      )}
      {dropIndicator === "inside" && node.canHaveChildren && (
        <div className="canvas-drop-indicator inside" />
      )}

      {/* Delete-Button */}
      <button
        type="button"
        onClick={() => onDelete(node.id)}
        className="canvas-delete-btn"
        title="Löschen"
      >
        <TrashIcon />
      </button>

      {/* Eigentliche Komponente - Drop-Target für above/below */}
      <div ref={contentRef} data-content-area={node.id}>
        <Comp slotProps={slotProps} />
      </div>
    </div>
  );
}
