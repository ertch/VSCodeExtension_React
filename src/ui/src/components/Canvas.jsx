import { useCallback, useMemo, useRef, useState, useEffect } from "react";
import Card from './Card';
// -----------------------
// Beispiel-Palette (Fallback)
// Du kannst eigene .tsx-Komponenten samt Metadaten über das Canvas-Prop "palette" übergeben.
// Jede Komponente: { type, label, canHaveChildren, Component, codeGen }
// -----------------------
const DefaultComponents = [
  Card,
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
        {/* Beispiel-Inputs, die beim Export gelesen werden */}
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
// Styles (inline, damit die Datei autark ist)
// -----------------------
const STYLES = {
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
  dropLineTop: {
    position: "absolute",
    top: -2,
    left: 8,
    right: 8,
    height: 4,
    background: "#4f46e5",
    borderRadius: 2,
    boxShadow: "0 0 0 2px rgba(79,70,229,0.25)",
  },
  dropLineBottom: {
    position: "absolute",
    bottom: -2,
    left: 8,
    right: 8,
    height: 4,
    background: "#4f46e5",
    borderRadius: 2,
    boxShadow: "0 0 0 2px rgba(79,70,229,0.25)",
  },
  dropInside: {
    position: "absolute",
    inset: 0,
    border: "2px dashed #4f46e5",
    borderRadius: 8,
    background: "rgba(79,70,229,0.06)",
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

function cloneDeep(o) {
  return JSON.parse(JSON.stringify(o));
}

function findNodeAndParent(tree, id, parent = null) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) return { node, parent, index: i };
    const found = findNodeAndParent(node.children || [], id, node);
    if (found) return found;
  }
  return null;
}

function removeNode(tree, id) {
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

function isDescendant(tree, maybeChildId, ancestorId) {
  const found = findNodeAndParent(tree, ancestorId, null);
  if (!found) return false;
  const stack = [...(found.node.children || [])];
  while (stack.length) {
    const n = stack.pop();
    if (n.id === maybeChildId) return true;
    if (n.children?.length) stack.push(...n.children);
  }
  return false;
}

function extractInputsFromElement(el) {
  const inputs = el.querySelectorAll("input, select, textarea");
  const data = {};
  inputs.forEach((inp) => {
    if (inp.id === "preview") return; // explizit ignorieren
    if (inp.disabled) return;

    let key = inp.name || inp.id;
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
export default function Canvas({ palette = DefaultComponents, initialNodes = [] }) {
  const paletteMap = useMemo(() => {
    const map = {};
    palette.forEach((p) => (map[p.type] = p));
    return map;
  }, [palette]);

  const [tree, setTree] = useState(() =>
    initialNodes.length ? initialNodes : []
  );
  const [hover, setHover] = useState({ targetId: null, zone: null }); // zone: 'above' | 'inside' | 'below'
  const [dragging, setDragging] = useState(null); // { kind: 'NEW', type } | { kind: 'MOVE', nodeId }
  const [exportJson, setExportJson] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    // Vorsichtige Bereinigung von Hover bei Mausverlassen
    const onLeave = () => setHover({ targetId: null, zone: null });
    window.addEventListener("dragend", onLeave);
    window.addEventListener("drop", onLeave);
    return () => {
      window.removeEventListener("dragend", onLeave);
      window.removeEventListener("drop", onLeave);
    };
  }, []);

  const createNodeFromType = useCallback(
    (type) => {
      const meta = paletteMap[type];
      if (!meta) return null;
      return {
        id: genId(),
        type: meta.type,
        canHaveChildren: !!meta.canHaveChildren,
        codeGen: meta.codeGen ?? { component: meta.type },
        props: {}, // Platz für spätere erweiterte Props
        children: [],
      };
    },
    [paletteMap]
  );

  const handlePaletteDragStart = (e, type) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData(
      "application/x-canvas",
      JSON.stringify({ kind: "NEW", type })
    );
    setDragging({ kind: "NEW", type });
  };

  const handleNodeDragStart = (e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData(
      "application/x-canvas",
      JSON.stringify({ kind: "MOVE", nodeId })
    );
    setDragging({ kind: "MOVE", nodeId });
  };

  const computeZone = (e, targetNode) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height || 1;
    const topBand = h * 0.3;
    const bottomBand = h * 0.3;

    let zone = null;
    if (y <= topBand) zone = "above";
    else if (y >= h - bottomBand) zone = "below";
    else zone = targetNode?.canHaveChildren ? "inside" : y < h / 2 ? "above" : "below";
    return zone;
  };

  const performDrop = useCallback(
    ({ dropTargetId, zone, payload }) => {
      if (!payload) return;
      let next = cloneDeep(tree);

      if (payload.kind === "NEW") {
        const newNode = createNodeFromType(payload.type);
        if (!newNode) return;

        if (!dropTargetId) {
          // ins Root am Ende
          next.push(newNode);
          setTree(next);
          return;
        }

        const found = findNodeAndParent(next, dropTargetId);
        if (!found) return;

        if (zone === "inside" && found.node.canHaveChildren) {
          found.node.children = found.node.children || [];
          found.node.children.push(newNode);
        } else {
          // Als Geschwister über/unter dem target
          const parent = found.parent;
          if (!parent) {
            // target liegt im Root
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
        if (movingId === dropTargetId) return; // auf sich selbst droppen -> noop
        if (dropTargetId && isDescendant(next, dropTargetId, movingId)) return; // nicht in eigenes Kind droppen

        // Node extrahieren
        const movingNode = removeNode(next, movingId);
        if (!movingNode) return;

        if (!dropTargetId) {
          // ans Root anhängen
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
          // Als Geschwister über/unter dem target
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

  const handleRootDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = dragging?.kind === "NEW" ? "copy" : "move";
    setHover((h) =>
      h.targetId ? h : { targetId: null, zone: "inside" } // Root als inside markiert
    );
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    let payload = dragging;
    try {
      const raw = e.dataTransfer.getData("application/x-canvas");
      if (raw) payload = JSON.parse(raw);
    } catch {}
    performDrop({ dropTargetId: null, zone: "inside", payload });
    setHover({ targetId: null, zone: null });
    setDragging(null);
  };

  const handleDelete = useCallback(
    (id) => {
      const next = cloneDeep(tree);
      removeNode(next, id);
      setTree(next);
    },
    [tree]
  );

  const renderNode = useCallback(
    (node) => {
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
          onDragStart={handleNodeDragStart}
          onDragOver={computeZone}
          onDrop={performDrop}
          isHovering={hover.targetId === node.id ? hover.zone : null}
          setHover={setHover}
        >
          {node.children?.map((child) => renderNode(child))}
        </NodeWrapper>
      );
    },
    [paletteMap, handleDelete, handleNodeDragStart, computeZone, performDrop, hover]
  );

  const serializeTreeFromDOM = useCallback(() => {
    // Baut die Struktur anhand der State-Baumform auf
    // und liest pro Node DOM: data-codegen + Inputs (ausser id="preview")
    const root = formRef.current;
    if (!root) return [];

    const visit = (node) => {
      const wrapperEl = root.querySelector(`[data-node-id="${node.id}"]`);
      let codeGenRaw = wrapperEl?.getAttribute("data-codegen");
      let codeGen = null;
      if (codeGenRaw) {
        try {
          codeGen = JSON.parse(codeGenRaw);
        } catch {
          codeGen = codeGenRaw; // falls kein JSON
        }
      }
      const inputs = wrapperEl ? extractInputsFromElement(wrapperEl) : {};

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

  const onSubmit = (e) => {
    e.preventDefault();
    const data = serializeTreeFromDOM();
    const json = JSON.stringify(data, null, 2);
    setExportJson(json);
    // Hier könntest du statt setExportJson auch ein fetch/emit machen
    // z.B. window.dispatchEvent(new CustomEvent('canvas-export', { detail: data }));
    console.log("Canvas JSON:", data);
  };

  const addViaClick = (type) => {
    const node = createNodeFromType(type);
    if (!node) return;
    setTree((prev) => [...prev, node]);
  };

  return (
    <div style={STYLES.layout}>
      <div style={STYLES.canvasArea}>
        <form ref={formRef} onSubmit={onSubmit} style={STYLES.form}>
          <div style={STYLES.addHint}>
            Ziehe Komponenten aus der rechten Palette auf die Fläche. Drop-Indikatoren zeigen dir: oben, unten oder innen.
          </div>

          <div
            style={{
              ...STYLES.rootDropArea,
              outline:
                hover.targetId === null && hover.zone === "inside"
                  ? "2px dashed #4f46e5"
                  : "none",
              outlineOffset: -2,
            }}
            onDragOver={handleRootDragOver}
            onDrop={handleRootDrop}
            onDragLeave={() => {
              if (!dragging) setHover({ targetId: null, zone: null });
            }}
          >
            {tree.length === 0 && (
              <div style={{ color: "#9ca3af", fontSize: 13 }}>
                Leerer Canvas – droppe etwas hier hinein…
              </div>
            )}
            {tree.map((n) => renderNode(n))}
          </div>

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

      <aside style={STYLES.sidebar}>
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Palette</div>
        {palette.map((p) => (
          <button
            key={p.type}
            style={STYLES.paletteButton}
            draggable
            onDragStart={(e) => handlePaletteDragStart(e, p.type)}
            onClick={() => addViaClick(p.type)}
            title="Ziehen zum Platzieren, Klick fügt unten ein"
          >
            {p.label}
          </button>
        ))}
        <div style={{ marginTop: 16, fontSize: 12, color: "#6b7280" }}>
          Tipp: Du kannst deine eigenen .tsx-Komponenten mit Metadaten via Prop
          palette an Canvas übergeben.
        </div>
      </aside>
    </div>
  );
}

// -----------------------
// NodeWrapper: einzelner Canvas-Knoten mit Wrapper, Del-Button & DnD-Zonen
// -----------------------
function NodeWrapper({
  node,
  meta,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  isHovering, // 'above' | 'inside' | 'below' | null
  setHover,
  children,
}) {
  const wrapperRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const zone = onDragOver(e, node);
    setHover({ targetId: node.id, zone });
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let payload = null;
    try {
      const raw = e.dataTransfer.getData("application/x-canvas");
      if (raw) payload = JSON.parse(raw);
    } catch {}

    // Zone nochmals berechnen (falls nötig)
    let zone = onDragOver(e, node);
    // Falls inside nicht erlaubt, automatisch auf above/below abbilden
    if (zone === "inside" && !node.canHaveChildren) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      zone = y < rect.height / 2 ? "above" : "below";
    }

    onDrop({ dropTargetId: node.id, zone, payload });
    setHover({ targetId: null, zone: null });
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    setHover((h) => (h.targetId === node.id ? { targetId: null, zone: null } : h));
  };

  const Comp = meta.Component;

  return (
    <div
      ref={wrapperRef}
      style={STYLES.nodeWrapper}
      draggable
      onDragStart={(e) => onDragStart(e, node.id)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={handleDragLeave}
      data-node-id={node.id}
      data-codegen={JSON.stringify(node.codeGen ?? { component: node.type })}
    >
      {/* Drop-Indikatoren */}
      {isHovering === "above" && <div style={STYLES.dropLineTop} />}
      {isHovering === "below" && <div style={STYLES.dropLineBottom} />}
      {isHovering === "inside" && node.canHaveChildren && <div style={STYLES.dropInside} />}

      {/* Delete-Button */}
      <button
        type="button"
        onClick={() => onDelete(node.id)}
        style={STYLES.deleteBtn}
        title="Löschen"
      >
        <TrashIcon />
      </button>

      {/* Eigentliche Komponente */}
      <Comp>
        {/* Kindslot ist nur visuell relevant, echtes Rendering passiert unten */}
      </Comp>

      {/* Kinder-Spalte (nur Darstellung – echte DnD-Logik sitzt auf wrapper) */}
      <div
        style={STYLES.childrenColumn}
        onDragOver={(e) => {
          // Leeres Kindgebiet soll "inside" ermöglichen
          e.preventDefault();
          e.stopPropagation();
          if (node.canHaveChildren) {
            setHover({ targetId: node.id, zone: "inside" });
          }
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          let payload = null;
          try {
            const raw = e.dataTransfer.getData("application/x-canvas");
            if (raw) payload = JSON.parse(raw);
          } catch {}
          onDrop({
            dropTargetId: node.id,
            zone: node.canHaveChildren ? "inside" : "below",
            payload,
          });
          setHover({ targetId: null, zone: null });
        }}
      >
        {children}
      </div>
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