"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RootDropArea = RootDropArea;
exports.Sidebar = Sidebar;
exports.PaletteButton = PaletteButton;
exports.TrashIcon = TrashIcon;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
// RootDropArea
function RootDropArea({ tree, renderNode, uniqueContextId }) {
    const dropRef = (0, react_1.useRef)(null);
    const [isDraggedOver, setIsDraggedOver] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        const el = dropRef.current;
        if (!el)
            return;
        /**
         * Helper: Prüft ob die RootDropArea das innerste "inside" Target ist.
         * Verhindert dass die RootDropArea highlightet, wenn über verschachtelte Nodes gehovered wird.
         */
        const isInnermostInsideTarget = (targets) => {
            if (!targets || targets.length === 0) {
                return true;
            }
            const innermostTarget = targets[0];
            if (innermostTarget &&
                typeof innermostTarget === 'object' &&
                'data' in innermostTarget &&
                innermostTarget.data &&
                typeof innermostTarget.data === 'object' &&
                'nodeId' in innermostTarget.data) {
                // RootDropArea hat nodeId: null
                return innermostTarget.data.nodeId === null;
            }
            return true;
        };
        return (0, adapter_1.dropTargetForElements)({
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
    return ((0, jsx_runtime_1.jsxs)("div", { ref: dropRef, className: `canvas-root-drop ${isDraggedOver ? 'is-dragged-over' : ''}`, children: [tree.length === 0 && ((0, jsx_runtime_1.jsx)("div", { className: "canvas-empty-hint", children: "Leerer Canvas \u2013 ziehe eine Card aus der Seitenleiste hierher" })), tree.map((n) => renderNode(n))] }));
}
// -----------------------
// Sidebar mit Palette
// -----------------------
function Sidebar({ palette, onAddClick, uniqueContextId }) {
    return ((0, jsx_runtime_1.jsxs)("aside", { className: "canvas-sidebar", children: [(0, jsx_runtime_1.jsx)("div", { className: "canvas-sidebar__title", children: "Komponentenauswahl" }), palette.map((p) => ((0, jsx_runtime_1.jsx)(PaletteButton, { entry: p, onAddClick: onAddClick, uniqueContextId: uniqueContextId }, p.type)))] }));
}
// -----------------------
// PaletteButton (draggable)
// -----------------------
function PaletteButton({ entry, onAddClick, uniqueContextId }) {
    const buttonRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const el = buttonRef.current;
        if (!el)
            return;
        return (0, adapter_1.draggable)({
            element: el,
            getInitialData: () => ({
                kind: "NEW",
                type: entry.type,
                contextId: uniqueContextId,
            }),
        });
    }, [entry.type, uniqueContextId]);
    return ((0, jsx_runtime_1.jsx)("button", { ref: buttonRef, className: "canvas-palette-btn", onClick: () => onAddClick(entry.type), title: "Ziehen zum Platzieren, Klick f\u00FCgt unten ein", children: entry.label }));
}
// -----------------------
// TrashIcon
// -----------------------
function TrashIcon() {
    return ((0, jsx_runtime_1.jsxs)("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", "aria-hidden": true, xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("path", { d: "M9 3h6m-9 4h12M8 7l1 13h6l1-13", stroke: "#6b7280", strokeWidth: "2", strokeLinecap: "round" }), (0, jsx_runtime_1.jsx)("path", { d: "M10 11v6M14 11v6", stroke: "#6b7280", strokeWidth: "2", strokeLinecap: "round" })] }));
}
//# sourceMappingURL=components.js.map