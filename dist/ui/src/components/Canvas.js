"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const react_1 = require("react");
require("./index.css");
const Card_1 = require("./Card");
const prop_types_1 = require("prop-types");
const palette = {
    Card: Card_1.default
};
function Sidebar({ onAdd, onDragStart }) {
    const types = Object.keys(palette);
    return (React.createElement("aside", { className: "sidebar" },
        React.createElement("h2", null, "Komponenten"),
        React.createElement("div", { className: "palette" }, types.map((type) => (React.createElement("button", { key: type, className: "palette-btn", draggable: true, onDragStart: (e) => onDragStart(e, type), onClick: () => onAdd(type), title: "Klicken zum Hinzuf\u00FCgen, ziehen zum Platzieren" },
            "+ ",
            type)))),
        React.createElement("div", { className: "hint" },
            "- Klicken: f\u00FCgt links hinzu",
            React.createElement("br", null),
            "- Ziehen: positioniert beim Drop",
            React.createElement("br", null),
            "- Pfeiltasten: Feintuning (Shift = schneller)",
            React.createElement("br", null),
            "- Entf/Backspace: l\u00F6scht Auswahl")));
}
Sidebar.propTypes = {
    onAdd: prop_types_1.default.func.isRequired,
    onDragStart: prop_types_1.default.func.isRequired,
};
function DraggableItem({ item, selected, onSelect, onMove, children }) {
    DraggableItem.propTypes = {
        item: prop_types_1.default.shape({
            id: prop_types_1.default.string.isRequired,
            x: prop_types_1.default.number.isRequired,
            y: prop_types_1.default.number.isRequired,
        }).isRequired,
        selected: prop_types_1.default.bool.isRequired,
        onSelect: prop_types_1.default.func.isRequired,
        onMove: prop_types_1.default.func.isRequired,
        children: prop_types_1.default.node,
    };
    const ref = (0, react_1.useRef)(null);
    const start = (0, react_1.useRef)({ x: 0, y: 0, itemX: 0, itemY: 0, dragging: false });
    (0, react_1.useEffect)(() => {
        const el = ref.current;
        if (!el)
            return;
        const onPointerDown = (e) => {
            var _a;
            if (e.button !== 0)
                return; // nur linke Maustaste
            e.stopPropagation();
            onSelect(item.id);
            start.current = {
                x: e.clientX,
                y: e.clientY,
                itemX: item.x,
                itemY: item.y,
                dragging: true,
            };
            (_a = el.setPointerCapture) === null || _a === void 0 ? void 0 : _a.call(el, e.pointerId);
        };
        const onPointerMove = (e) => {
            if (!start.current.dragging)
                return;
            const dx = e.clientX - start.current.x;
            const dy = e.clientY - start.current.y;
            onMove(item.id, start.current.itemX + dx, start.current.itemY + dy);
        };
        const end = (e) => {
            var _a;
            if (!start.current.dragging)
                return;
            start.current.dragging = false;
            try {
                (_a = el.releasePointerCapture) === null || _a === void 0 ? void 0 : _a.call(el, e.pointerId);
            }
            catch (_b) {
                // Intentionally ignored
            }
        };
        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', end);
        return () => {
            el.removeEventListener('pointerdown', onPointerDown);
            el.removeEventListener('pointermove', onPointerMove);
            el.removeEventListener('pointerup', end);
            el.removeEventListener('pointercancel', end);
        };
    }, [item.id, item.x, item.y, onMove, onSelect]);
    return (React.createElement("div", { ref: ref, className: `item ${selected ? 'selected' : ''}`, style: { left: item.x, top: item.y }, onClick: (e) => { e.stopPropagation(); onSelect(item.id); } }, children));
}
function Canvas({ items, setItems, selectedId, setSelectedId, snap = 8 }) {
    const ref = (0, react_1.useRef)(null);
    const snapXY = (x, y) => {
        if (!snap)
            return { x, y };
        return {
            x: Math.round(x / snap) * snap,
            y: Math.round(y / snap) * snap,
        };
    };
    const getCanvasPos = (e) => {
        const rect = ref.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onDragOver = (e) => {
        e.preventDefault(); // nötig, um Drop zu erlauben
        e.dataTransfer.dropEffect = 'copy';
    };
    const onDrop = (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/x-component');
        if (!type)
            return;
        const p = getCanvasPos(e);
        // kleiner Offset, damit das Element nicht unter dem Cursor „klebt“
        const { x, y } = snapXY(p.x - 50, p.y - 20);
        setItems((prev) => {
            var _a;
            return [
                ...prev,
                {
                    id: ((_a = crypto.randomUUID) === null || _a === void 0 ? void 0 : _a.call(crypto)) || String(Date.now() + Math.random()),
                    type,
                    x,
                    y,
                    props: {},
                },
            ];
        });
    };
    const moveItem = (0, react_1.useCallback)((id, x, y) => {
        const p = snapXY(x, y);
        setItems((prev) => prev.map((it) => (it.id === id ? Object.assign(Object.assign({}, it), p) : it)));
    }, [setItems]);
    (0, react_1.useEffect)(() => {
        const onKey = (e) => {
            if (!selectedId)
                return;
            if (e.key === 'Delete' || e.key === 'Backspace') {
                setItems((prev) => prev.filter((it) => it.id !== selectedId));
                setSelectedId(null);
                return;
            }
            const step = e.shiftKey ? 10 : 1;
            const map = {
                ArrowLeft: [-step, 0],
                ArrowRight: [step, 0],
                ArrowUp: [0, -step],
                ArrowDown: [0, step],
            };
            if (map[e.key]) {
                e.preventDefault();
                const [dx, dy] = map[e.key];
                setItems((prev) => prev.map((it) => (it.id === selectedId ? Object.assign(Object.assign({}, it), { x: it.x + dx, y: it.y + dy }) : it)));
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [selectedId, setItems, setSelectedId]);
    return (React.createElement("main", { ref: ref, className: "canvas mainCanvas", onDragOver: onDragOver, onDrop: onDrop, onClick: () => setSelectedId(null) },
        React.createElement("div", { className: "grid-overlay" }),
        items.map((it) => {
            const Comp = palette[it.type];
            if (!Comp)
                return null;
            return (React.createElement(DraggableItem, { key: it.id, item: it, selected: selectedId === it.id, onSelect: setSelectedId, onMove: moveItem },
                React.createElement(Comp, Object.assign({}, it.props))));
        })));
}
Canvas.propTypes = {
    items: prop_types_1.default.arrayOf(prop_types_1.default.shape({
        id: prop_types_1.default.string.isRequired,
        type: prop_types_1.default.string.isRequired,
        x: prop_types_1.default.number.isRequired,
        y: prop_types_1.default.number.isRequired,
        props: prop_types_1.default.object,
    })).isRequired,
    setItems: prop_types_1.default.func.isRequired,
    selectedId: prop_types_1.default.string,
    setSelectedId: prop_types_1.default.func.isRequired,
    snap: prop_types_1.default.number,
};
function App() {
    const [items, setItems] = (0, react_1.useState)(() => {
        try {
            return JSON.parse(localStorage.getItem('canvas-items') || '[]');
        }
        catch (_a) {
            return [];
        }
    });
    const [selectedId, setSelectedId] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        localStorage.setItem('canvas-items', JSON.stringify(items));
    }, [items]);
    const handleAdd = (type) => {
        const x = 24 + (items.length % 6) * 24;
        const y = 24 + (items.length % 4) * 24;
        setItems((prev) => {
            var _a;
            return [
                ...prev,
                {
                    id: ((_a = crypto.randomUUID) === null || _a === void 0 ? void 0 : _a.call(crypto)) || String(Date.now() + Math.random()),
                    type,
                    x,
                    y,
                    props: {},
                },
            ];
        });
    };
    const handleDragStart = (e, type) => {
        e.dataTransfer.setData('application/x-component', type);
        e.dataTransfer.effectAllowed = 'copy';
    };
    return (React.createElement("div", { className: "app" },
        React.createElement(Canvas, { items: items, setItems: setItems, selectedId: selectedId, setSelectedId: setSelectedId, snap: 8 }),
        React.createElement(Sidebar, { onAdd: handleAdd, onDragStart: handleDragStart })));
}
