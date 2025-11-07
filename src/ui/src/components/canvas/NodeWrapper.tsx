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

    /**
     * Helper: Prüft ob DIESER Node das innerste (erste) Drop-Target ist.
     *
     * Rationale:
     * - location.current.dropTargets ist sortiert von INNERSTEM zu ÄUSSERSTEM
     * - Nur das innerste Target soll visuelles Feedback geben
     * - Performance: O(1) statt O(n) durch direkten Array-Zugriff
     *
     * @param targets - Array der aktuellen Drop-Targets (innermost first)
     * @returns true wenn dieser Node highlighten darf
     */
    const isInnermostTarget = (targets: readonly unknown[]): boolean => {
      // Kein Target = sollte nicht vorkommen, aber safe guard
      if (!targets || targets.length === 0) {
        return true;
      }

      // Prüfe ob das erste (innerste) Target dieser Node ist
      const innermostTarget = targets[0];

      // Type Guard: Stelle sicher dass target die erwartete Struktur hat
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

      // Fallback: Bei unerwarteter Struktur, erlaube Highlight
      // (besser false positive als keine Visualisierung)
      return true;
    };

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: ({ input, element }) => {
        const zone = computeZone(input, element);
        return { nodeId: node.id, zone };
      },

      onDragEnter: ({ self, location }) => {
        // WICHTIG: Nur das innerste Target darf highlighten
        // Verhindert Multi-Level Highlighting bei verschachtelten Nodes
        if (!isInnermostTarget(location.current.dropTargets)) {
          return;
        }

        // ZUSÄTZLICH: Prüfe ob das innerste Target eine "inside" Zone ist
        // Falls ja, hat die Drop-Zone Priorität über above/below
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
          return; // Drop-Zone hat Priorität
        }

        setDropIndicator(self.data.zone as 'above' | 'below');
      },

      onDrag: ({ self, location }) => {
        // WICHTIG: Nur das innerste Target darf highlighten
        // Verhindert Multi-Level Highlighting bei verschachtelten Nodes
        if (!isInnermostTarget(location.current.dropTargets)) {
          // Entferne eventuelles vorheriges Highlight
          // (wichtig falls sich die Target-Hierarchie geändert hat)
          setDropIndicator(null);
          return;
        }

        // ZUSÄTZLICH: Prüfe ob das innerste Target eine "inside" Zone ist
        // Falls ja, hat die Drop-Zone Priorität über above/below
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
          setDropIndicator(null); // Entferne above/below Highlight
          return;
        }

        setDropIndicator(self.data.zone as 'above' | 'below');
      },

      onDragLeave: () => {
        // Immer Highlight entfernen beim Verlassen
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

    const el = childrenEl;
    if (!el) return;

    /**
     * Helper: Prüft ob DIESER Node das innerste "inside" Drop-Target ist.
     * Gleiche Logik wie bei above/below, aber für die Drop-Zone.
     */
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
        // WICHTIG: Nur das innerste "inside" Target darf highlighten
        // Verhindert dass Parent-Drop-Zones auch highlighten
        if (!isInnermostInsideTarget(location.current.dropTargets)) {
          return;
        }

        setDropIndicator("inside");
        el.classList.add('is-inside');
      },
      onDrag: ({ location }) => {
        // WICHTIG: Nur das innerste "inside" Target darf highlighten
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
