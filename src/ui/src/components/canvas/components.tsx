import { useRef, useEffect, useState, ReactNode } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { PaletteEntry } from '../../utils/types/palette';
import type { RootDropAreaProps, SidebarProps, PaletteButtonProps } from '../../utils/types/canvas';

// RootDropArea
export function RootDropArea({ tree, renderNode, uniqueContextId }: RootDropAreaProps) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    /**
     * Helper: Prüft ob die RootDropArea das innerste "inside" Target ist.
     * Verhindert dass die RootDropArea highlightet, wenn über verschachtelte Nodes gehovered wird.
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
        // RootDropArea hat nodeId: null
        return innermostTarget.data.nodeId === null;
      }

      return true;
    };

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: () => ({
        nodeId: null, // Root-Level
        zone: "inside",
      }),
      onDragEnter: ({ location }) => {
        // Nur highlighten wenn RootDropArea das innerste Target ist
        if (!isInnermostInsideTarget(location.current.dropTargets)) {
          return;
        }
        setIsDraggedOver(true);
      },
      onDrag: ({ location }) => {
        // Nur highlighten wenn RootDropArea das innerste Target ist
        if (!isInnermostInsideTarget(location.current.dropTargets)) {
          setIsDraggedOver(false);
          return;
        }
        setIsDraggedOver(true);
      },
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });
  }, [uniqueContextId]);

  return (
    <div
      ref={dropRef}
      className={`canvas-root-drop ${isDraggedOver ? 'is-dragged-over' : ''}`}
    >
      {tree.length === 0 && (
        <div className="canvas-empty-hint">
          Leerer Canvas – ziehe eine Card aus der Seitenleiste hierher
        </div>
      )}
      {tree.map((n) => renderNode(n))}
    </div>
  );
}

// -----------------------
// Sidebar mit Palette
// -----------------------
export function Sidebar({ palette, onAddClick, uniqueContextId }: SidebarProps) {
  return (
    <aside className="canvas-sidebar">
      <div className="canvas-sidebar__title">Komponentenauswahl</div>
      {palette.map((p) => (
        <PaletteButton key={p.type} entry={p} onAddClick={onAddClick} uniqueContextId={uniqueContextId} />
      ))}
    </aside>
  );
}

// -----------------------
// PaletteButton (draggable)
// -----------------------
export function PaletteButton({ entry, onAddClick, uniqueContextId }: PaletteButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({
        kind: "NEW",
        type: entry.type,
        contextId: uniqueContextId,
      }),
    });
  }, [entry.type, uniqueContextId]);

  return (
    <button
      ref={buttonRef}
      className="canvas-palette-btn"
      onClick={() => onAddClick(entry.type)}
      title="Ziehen zum Platzieren, Klick fügt unten ein"
    >
      {entry.label}
    </button>
  );
}

// -----------------------
// TrashIcon
// -----------------------
export function TrashIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9 3h6m-9 4h12M8 7l1 13h6l1-13" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11v6M14 11v6" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
