import { useRef, useEffect, useState } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { NodeWrapperProps } from '../../utils/types/canvas';
import { TrashIcon } from './components';

export function NodeWrapper({ node, meta, onDelete, uniqueContextId, children }: NodeWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [childrenEl, setChildrenEl] = useState<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const DropZone = (input: { clientY: number }, element: HTMLElement): 'above' | 'below' => {
      const rect = element.getBoundingClientRect();
      const y = input.clientY - rect.top;
      const h = rect.height;

      if (y < h * 0.5) {
        return "above";
      } else {
        return "below";
      }
    };

    const isInnermostTarget = (targets: readonly unknown[]): boolean => {
      if (!targets || targets.length === 0) {
        return true;
      }

      const innermostTarget = targets[0];

      if (
        innermostTarget &&
        typeof innermostTarget === 'object' &&
        'data' in innermostTarget &&
        innermostTarget.data &&
        typeof innermostTarget.data === 'object' &&
        'nodeId' in innermostTarget.data
      ) {
        return innermostTarget.data.nodeId === node.id;
      }
      return true;
    };

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: ({ input, element }) => {
        const zone = DropZone(input, element);
        return { nodeId: node.id, zone };
      },

      // Verhindern von Multi-Highlighting 
      onDragEnter: ({ self, location }) => { 
        if (!isInnermostTarget(location.current.dropTargets)) {
          return;
        }

        const innermostTarget = location.current.dropTargets[0];
        if (
          innermostTarget &&
          typeof innermostTarget === 'object' &&
          'data' in innermostTarget &&
          innermostTarget.data &&
          typeof innermostTarget.data === 'object' &&
          'zone' in innermostTarget.data &&
          innermostTarget.data.zone === 'inside'
        ) {
          return; // Drop-Zone prioisieren
        }

        setDropIndicator(self.data.zone as 'above' | 'below');
      },

      onDrag: ({ self, location }) => {
        if (!isInnermostTarget(location.current.dropTargets)) {
          setDropIndicator(null);
          return;
        }

        const innermostTarget = location.current.dropTargets[0];
        if (
          innermostTarget &&
          typeof innermostTarget === 'object' &&
          'data' in innermostTarget &&
          innermostTarget.data &&
          typeof innermostTarget.data === 'object' &&
          'zone' in innermostTarget.data &&
          innermostTarget.data.zone === 'inside'
        ) {
          setDropIndicator(null); 
          return;
        }

        setDropIndicator(self.data.zone as 'above' | 'below');
      },

      onDragLeave: () => {
        setDropIndicator(null);
      },

      onDrop: () => {
        setDropIndicator(null);
      },
    });
  }, [node.id, uniqueContextId]);

  useEffect(() => {
    if (!node.canHaveChildren) return;

    const el = childrenEl;
    if (!el) return;

    const isInnermostInsideTarget = (targets: readonly unknown[]): boolean => {
      if (!targets || targets.length === 0) {
        return true;
      }

      const innermostTarget = targets[0];

      if (
        innermostTarget &&
        typeof innermostTarget === 'object' &&
        'data' in innermostTarget &&
        innermostTarget.data &&
        typeof innermostTarget.data === 'object' &&
        'nodeId' in innermostTarget.data
      ) {
        return innermostTarget.data.nodeId === node.id;
      }

      return true;
    };

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: () => {
        return { nodeId: node.id, zone: "inside" };
      },
      onDragEnter: ({ location }) => {
        if (!isInnermostInsideTarget(location.current.dropTargets)) {
          return;
        }

        setDropIndicator("inside");
        el.classList.add('is-inside');
      },
      onDrag: ({ location }) => {
        if (!isInnermostInsideTarget(location.current.dropTargets)) {
          setDropIndicator(null);
          el.classList.remove('is-inside');
          return;
        }

        setDropIndicator("inside");
        el.classList.add('is-inside');
      },
      onDragLeave: () => {
        setDropIndicator(null);
        el.classList.remove('is-inside');
      },
      onDrop: () => {
        setDropIndicator(null);
        el.classList.remove('is-inside');
      },
    });
  }, [node.id, node.canHaveChildren, uniqueContextId, childrenEl]);

  const Comp = meta.Component;

  // Bereite Slot-Props vor (nur für canHaveChildren)
  const slotProps = node.canHaveChildren ? {
    children,
    ref: setChildrenEl,
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
