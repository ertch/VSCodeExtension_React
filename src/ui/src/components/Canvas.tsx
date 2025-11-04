import { useCallback, useMemo, useRef, useState, useEffect, ReactNode } from "react";
import { draggable, dropTargetForElements, monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type {
  CanvasProps,
  RootDropAreaProps,
  SidebarProps,
  PaletteButtonProps,
  NodeWrapperProps,
  TreeNode,
  PerformDropParams,
  DropPayload
} from '../utils/types/canvas';
import type { PaletteEntry } from '../utils/types/palette';

// -----------------------
// Beispiel-Palette (Fallback)
// -----------------------
const DefaultComponents: PaletteEntry[] = [
  {
    type: "Container",
    label: "Container",
    canHaveChildren: true,
    codeGen: { component: "Container", variant: "default" },
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
    codeGen: { component: "Heading", level: 3 },
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
    codeGen: { component: "Paragraph" },
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
    codeGen: { component: "Input", role: "text" },
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
    codeGen: { component: "Button", variant: "primary" },
    Component: () => (
      <div>
        <button type="button">Klick</button>
        <input name="buttonLabel" placeholder="Button-Text" />
      </div>
    ),
  },
];

// -----------------------
// Styles
// -----------------------
const STYLES: Record<string, React.CSSProperties> = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1fr 280px",
    gap: "0",
    height: "100%",
    minHeight: "100vh",
  },
  canvasArea: {
    padding: "16px",
    overflow: "auto",
    background: "#f5f7fb",
  },
  sidebar: {
    borderLeft: "1px solid #e5e7eb",
    padding: "12px",
    background: "#fff",
  },
  paletteButton: {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 10px",
    marginBottom: "8px",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    background: "#f9fafb",
    cursor: "grab",
    fontSize: 14,
  },
  form: {
    width: "100%",
    maxWidth: 1000,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  addHint: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  rootDropArea: {
    minHeight: 64,
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    padding: 12,
  },
  nodeWrapper: {
    position: "relative",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#ffffff",
    padding: 8,
    margin: "8px 0",
  },
  deleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  childrenColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  dropIndicator: {
    position: "absolute",
    left: 8,
    right: 8,
    height: 4,
    background: "#4f46e5",
    borderRadius: 2,
    boxShadow: "0 0 0 2px rgba(79,70,229,0.25)",
    pointerEvents: "none",
  },
  dropIndicatorTop: {
    top: -2,
  },
  dropIndicatorBottom: {
    bottom: -2,
  },
  dropIndicatorInside: {
    position: "absolute",
    inset: 0,
    border: "2px dashed #4f46e5",
    borderRadius: 8,
    background: "rgba(79,70,229,0.06)",
    pointerEvents: "none",
  },
  toolbar: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
  primaryBtn: {
    padding: "8px 12px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
  secondaryBtn: {
    padding: "8px 12px",
    background: "#f3f4f6",
    color: "#111827",
    border: "1px solid #e5e7eb",
    borderRadius: 6,
    cursor: "pointer",
  },
  previewBox: {
    marginTop: 12,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  previewHeader: {
    background: "#f9fafb",
    padding: "8px 12px",
    fontSize: 12,
    color: "#6b7280",
    borderBottom: "1px solid #e5e7eb",
  },
  previewArea: {
    width: "100%",
    minHeight: 120,
    padding: 12,
    border: "none",
    outline: "none",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
    fontSize: 12,
  },
};

// -----------------------
// Hilfsfunktionen
// -----------------------
const genId = () => "n_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

function cloneDeep<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

function findNodeAndParent(
  tree: TreeNode[],
  id: string,
  parent: TreeNode | null = null
): { node: TreeNode; parent: TreeNode | null; index: number } | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) return { node, parent, index: i };
    const found = findNodeAndParent(node.children || [], id, node);
    if (found) return found;
  }
  return null;
}

function removeNode(tree: TreeNode[], id: string): TreeNode | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      const [removed] = tree.splice(i, 1);
      return removed;
    }
    const removedChild = removeNode(node.children || [], id);
    if (removedChild) return removedChild;
  }
  return null;
}

function isDescendant(tree: TreeNode[], maybeChildId: string, ancestorId: string): boolean {
  const found = findNodeAndParent(tree, ancestorId, null);
  if (!found) return false;
  const stack = [...(found.node.children || [])];
  while (stack.length) {
    const n = stack.pop();
    if (n && n.id === maybeChildId) return true;
    if (n?.children?.length) stack.push(...n.children);
  }
  return false;
}

function extractInputsFromElement(el: HTMLElement): Record<string, unknown> {
  const inputs = el.querySelectorAll("input, select, textarea");
  const data: Record<string, unknown> = {};
  inputs.forEach((inp) => {
    if (inp.id === "preview") return;
    if (inp instanceof HTMLInputElement || inp instanceof HTMLSelectElement || inp instanceof HTMLTextAreaElement) {
      if (inp.disabled) return;
    }

    let key = '';
    if (inp instanceof HTMLInputElement || inp instanceof HTMLSelectElement || inp instanceof HTMLTextAreaElement) {
      key = inp.name || inp.id;
    }
    if (!key) return;

    if (inp instanceof HTMLInputElement) {
      if (inp.type === "checkbox") {
        data[key] = inp.checked;
      } else if (inp.type === "radio") {
        if (inp.checked) data[key] = inp.value;
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLSelectElement) {
      if (inp.multiple) {
        data[key] = Array.from(inp.selectedOptions).map((o) => o.value);
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLTextAreaElement) {
      data[key] = inp.value;
    }
  });
  return data;
}

// -----------------------
// Canvas-Komponente
// -----------------------
export default function Canvas({ palette = DefaultComponents, initialNodes = [] }: CanvasProps) {
  const paletteMap = useMemo(() => {
    const map: Record<string, PaletteEntry> = {};
    palette.forEach((p) => (map[p.type] = p));
    return map;
  }, [palette]);

  const [tree, setTree] = useState<TreeNode[]>(() =>
    initialNodes.length ? initialNodes : []
  );
  const [exportJson, setExportJson] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Unique Context ID für diesen Canvas (verhindert Cross-Canvas Drops)
  const uniqueContextId = useMemo(() => Symbol('canvas-context'), []);

  const createNodeFromType = useCallback(
    (type: string): TreeNode | null => {
      const meta = paletteMap[type];
      if (!meta) return null;
      return {
        id: genId(),
        type: meta.type,
        canHaveChildren: !!meta.canHaveChildren,
        codeGen: meta.codeGen ?? { component: meta.type },
        props: {},
        children: [],
      };
    },
    [paletteMap]
  );

  const performDrop = useCallback(
    ({ dropTargetId, zone, payload }: PerformDropParams) => {
      console.log('🎯 performDrop called:', { dropTargetId, zone, payload });
      if (!payload) return;
      let next = cloneDeep(tree);

      if (payload.kind === "NEW") {
        const newNode = createNodeFromType(payload.type);
        if (!newNode) return;

        if (!dropTargetId) {
          next.push(newNode);
          setTree(next);
          return;
        }

        const found = findNodeAndParent(next, dropTargetId);
        if (!found) return;

        console.log('📦 Target node:', {
          nodeId: found.node.id,
          type: found.node.type,
          canHaveChildren: found.node.canHaveChildren,
          zone: zone
        });

        if (zone === "inside" && found.node.canHaveChildren) {
          console.log('✅ Inserting as child!');
          found.node.children = found.node.children || [];
          found.node.children.push(newNode);
        } else {
          console.log('❌ Inserting as sibling because:', {
            zoneIsInside: zone === "inside",
            canHaveChildren: found.node.canHaveChildren
          });
          const parent = found.parent;
          if (!parent) {
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            next.splice(insertIndex, 0, newNode);
          } else {
            const list = parent.children || [];
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            list.splice(insertIndex, 0, newNode);
            parent.children = list;
          }
        }
        setTree(next);
      } else if (payload.kind === "MOVE") {
        const movingId = payload.nodeId;
        if (movingId === dropTargetId) return;
        if (dropTargetId && isDescendant(next, dropTargetId, movingId)) return;

        const movingNode = removeNode(next, movingId);
        if (!movingNode) return;

        if (!dropTargetId) {
          next.push(movingNode);
          setTree(next);
          return;
        }

        const found = findNodeAndParent(next, dropTargetId);
        if (!found) return;

        if (zone === "inside" && found.node.canHaveChildren) {
          found.node.children = found.node.children || [];
          found.node.children.push(movingNode);
        } else {
          const parent = found.parent;
          if (!parent) {
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            next.splice(insertIndex, 0, movingNode);
          } else {
            const list = parent.children || [];
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            list.splice(insertIndex, 0, movingNode);
            parent.children = list;
          }
        }
        setTree(next);
      }
    },
    [tree, createNodeFromType]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = cloneDeep(tree);
      removeNode(next, id);
      setTree(next);
    },
    [tree]
  );

  const renderNode = useCallback(
    (node: TreeNode): ReactNode => {
      const meta = paletteMap[node.type];
      if (!meta) {
        return (
          <div key={node.id} style={{ ...STYLES.nodeWrapper, borderColor: "#ef4444" }}>
            Unbekannte Komponente: {node.type}
          </div>
        );
      }
      return (
        <NodeWrapper
          key={node.id}
          node={node}
          meta={meta}
          onDelete={handleDelete}
          uniqueContextId={uniqueContextId}
        >
          {node.children?.map((child) => renderNode(child))}
        </NodeWrapper>
      );
    },
    [paletteMap, handleDelete, uniqueContextId]
  );

  const serializeTreeFromDOM = useCallback(() => {
    const root = formRef.current;
    if (!root) return [];

    const visit = (node: TreeNode) => {
      const wrapperEl = root.querySelector(`[data-node-id="${node.id}"]`);
      let codeGenRaw = wrapperEl?.getAttribute("data-codegen");
      let codeGen: unknown = null;
      if (codeGenRaw) {
        try {
          codeGen = JSON.parse(codeGenRaw);
        } catch {
          codeGen = codeGenRaw;
        }
      }
      const inputs = wrapperEl ? extractInputsFromElement(wrapperEl as HTMLElement) : {};

      return {
        id: node.id,
        type: node.type,
        codeGen,
        inputs,
        children: (node.children || []).map(visit),
      };
    };

    return tree.map(visit);
  }, [tree]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = serializeTreeFromDOM();
    const json = JSON.stringify(data, null, 2);
    setExportJson(json);
    console.log("Canvas JSON:", data);
  };

  const addViaClick = (type: string) => {
    const node = createNodeFromType(type);
    if (!node) return;
    setTree((prev) => [...prev, node]);
  };

  // Globaler Monitor: Fängt alle Drop-Events ab und verarbeitet sie zentral
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.contextId === uniqueContextId,
      onDrop: ({ location, source }) => {
        const { dropTargets } = location.current;

        // Kein Drop-Target gefunden
        if (dropTargets.length === 0) {
          console.log('❌ No drop targets found');
          return;
        }

        // Nimm das INNERSTE Drop-Target (Index 0 ist das tiefste/innerste)
        const [innermostTarget] = dropTargets;
        const dropTargetId = innermostTarget.data.nodeId;
        const zone = innermostTarget.data.zone;

        console.log('🎯 Monitor: Drop detected', {
          sourceData: source.data,
          innermostTarget: dropTargetId,
          zone,
          totalTargets: dropTargets.length,
        });

        // Verarbeite den Drop einmalig über die zentrale Funktion
        performDrop({
          dropTargetId: dropTargetId ?? null,
          zone,
          payload: source.data,
        });
      },
    });
  }, [uniqueContextId, performDrop]);

  return (
    <div style={STYLES.layout}>
      <div style={STYLES.canvasArea}>
        <form ref={formRef} onSubmit={onSubmit} style={STYLES.form}>
          <div style={STYLES.addHint}>
            Ziehe Komponenten aus der rechten Palette auf die Fläche. Drop-Indikatoren zeigen dir: oben, unten oder innen.
          </div>

          <RootDropArea tree={tree} renderNode={renderNode} uniqueContextId={uniqueContextId} />

          <div style={STYLES.toolbar}>
            <button type="submit" style={STYLES.primaryBtn}>
              JSON exportieren
            </button>
            <button
              type="button"
              style={STYLES.secondaryBtn}
              onClick={() => {
                setTree([]);
                setExportJson("");
              }}
            >
              Canvas leeren
            </button>
          </div>

          <div style={STYLES.previewBox}>
            <div style={STYLES.previewHeader}>Vorschau (wird beim Export ignoriert, id="preview")</div>
            <textarea
              id="preview"
              readOnly
              style={STYLES.previewArea}
              value={exportJson}
              placeholder="Exportiere, um die JSON-Struktur hier zu sehen…"
            />
          </div>
        </form>
      </div>

      <Sidebar palette={palette} onAddClick={addViaClick} uniqueContextId={uniqueContextId} />
    </div>
  );
}

// -----------------------
// RootDropArea
// -----------------------
function RootDropArea({ tree, renderNode, uniqueContextId }: RootDropAreaProps) {
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
      style={{
        ...STYLES.rootDropArea,
        outline: isDraggedOver ? "2px dashed #4f46e5" : "none",
        outlineOffset: -2,
      }}
    >
      {tree.length === 0 && (
        <div style={{ color: "#9ca3af", fontSize: 13 }}>
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
function Sidebar({ palette, onAddClick, uniqueContextId }: SidebarProps) {
  return (
    <aside style={STYLES.sidebar}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Palette</div>
      {palette.map((p) => (
        <PaletteButton key={p.type} entry={p} onAddClick={onAddClick} uniqueContextId={uniqueContextId} />
      ))}
      <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
        Tipp: Du kannst deine eigenen .tsx-Komponenten mit Metadaten via Prop
        palette an Canvas übergeben.
      </div>
    </aside>
  );
}

// -----------------------
// PaletteButton (draggable)
// -----------------------
function PaletteButton({ entry, onAddClick, uniqueContextId }: PaletteButtonProps) {
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
      style={STYLES.paletteButton}
      onClick={() => onAddClick(entry.type)}
      title="Ziehen zum Platzieren, Klick fügt unten ein"
    >
      {entry.label}
    </button>
  );
}

// -----------------------
// NodeWrapper
// -----------------------
function NodeWrapper({ node, meta, onDelete, uniqueContextId, children }: NodeWrapperProps) {
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

    console.log('👶 Registering children drop target for', node.id);

    return dropTargetForElements({
      element: el,
      canDrop: ({ source }) => source.data.contextId === uniqueContextId,
      getData: () => {
        console.log('👶 Children area getData - forcing "inside" zone for node:', node.id);
        return { nodeId: node.id, zone: "inside" };
      },
      onDragEnter: () => {
        console.log('👶 onDragEnter - children area');
        setDropIndicator("inside");
      },
      onDrag: () => {
        setDropIndicator("inside");
      },
      onDragLeave: () => {
        console.log('👶 onDragLeave - children area');
        setDropIndicator(null);
      },
      onDrop: () => {
        // Entfernt: Drop-Verarbeitung erfolgt jetzt zentral im Monitor
        console.log('👶 Children drop triggered - Monitor wird verarbeiten');
        setDropIndicator(null);
      },
    });
  }, [node.id, node.canHaveChildren, uniqueContextId]);

  const Comp = meta.Component;

  return (
    <div
      ref={wrapperRef}
      style={STYLES.nodeWrapper}
      data-node-id={node.id}
      data-codegen={JSON.stringify(node.codeGen ?? { component: node.type })}
    >
      {/* Drop-Indikatoren */}
      {dropIndicator === "above" && (
        <div style={{ ...STYLES.dropIndicator, ...STYLES.dropIndicatorTop }} />
      )}
      {dropIndicator === "below" && (
        <div style={{ ...STYLES.dropIndicator, ...STYLES.dropIndicatorBottom }} />
      )}
      {dropIndicator === "inside" && node.canHaveChildren && (
        <div style={STYLES.dropIndicatorInside} />
      )}

      {/* Delete-Button */}
      <button
        type="button"
        onClick={() => onDelete(node.id)}
        style={STYLES.deleteBtn}
        title="Löschen"
      >
        <TrashIcon />
      </button>

      {/* Eigentliche Komponente - Drop-Target für above/below */}
      <div ref={contentRef}>
        <Comp />
      </div>

      {/* Kinder-Spalte - Separates Drop-Target nur für "inside" */}
      {node.canHaveChildren && (
        <div
          ref={childrenRef}
          style={{
            ...STYLES.childrenColumn,
            minHeight: children?.length > 0 ? 'auto' : 40,
            border: dropIndicator === 'inside' ? '2px dashed #4f46e5' : '1px dashed #e5e7eb',
            borderRadius: 6,
            padding: 8,
            background: dropIndicator === 'inside' ? 'rgba(79,70,229,0.06)' : 'transparent'
          }}
        >
          {children?.length > 0 ? (
            children
          ) : (
            <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: 8 }}>
              Drop hier hinein...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// -----------------------
// Icon
// -----------------------
function TrashIcon() {
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
