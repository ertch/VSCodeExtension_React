import { useRef, useEffect, useState, ReactNode } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { PaletteEntry } from '../../utils/types/palette';
import type { RootDropAreaProps, SidebarProps, PaletteButtonProps } from '../../utils/types/canvas';

// -----------------------
// Default Components (Fallback Palette)
// -----------------------
export const DefaultComponents: PaletteEntry[] = [
  {
    type: "Container",
    label: "Container",
    canHaveChildren: true,
    Component: ({ children }) => (
      <div style={{ padding: "12px", border: "1px dashed #999", background: "#fafafa" }}>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>Container</div>
        {children}
      </div>
    ),
  },
  {
    type: "Heading",
    label: "Überschrift",
    canHaveChildren: false,
    Component: () => (
      <div>
        <h3 style={{ margin: 0 }}>Überschrift</h3>
        <input name="text" placeholder="Text der Überschrift" />
      </div>
    ),
  },
  {
    type: "Paragraph",
    label: "Text",
    canHaveChildren: false,
    Component: () => (
      <div>
        <p style={{ margin: "4px 0" }}>Lorem ipsum dolor sit amet…</p>
        <textarea name="content" placeholder="Inhalt"></textarea>
      </div>
    ),
  },
  {
    type: "InputField",
    label: "Eingabefeld",
    canHaveChildren: false,
    Component: () => (
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <label style={{ minWidth: 80 }}>Label:</label>
        <input name="label" placeholder="Label" />
        <input name="value" placeholder="Wert" />
      </div>
    ),
  },
  {
    type: "Button",
    label: "Button",
    canHaveChildren: false,
    Component: () => (
      <div>
        <button type="button">Klick</button>
        <input name="buttonLabel" placeholder="Button-Text" />
      </div>
    ),
  },
];

// -----------------------
// RootDropArea
// -----------------------
export function RootDropArea({ tree, renderNode, uniqueContextId }: RootDropAreaProps) {
  const dropRef = useRef<HTMLDivElement>(null);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: () => ({
        nodeId: null, // Root-Level
        zone: "inside",
      }),
      onDragEnter: () => setIsDraggedOver(true),
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
          Leerer Canvas – droppe etwas hier hinein…
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
      <div className="canvas-sidebar__title">Palette</div>
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
