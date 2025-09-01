"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AstroEditor;
const React = require("react");
const react_1 = require("react");
const snippetDefinitions_1 = require("../../../snippetDefinitions");
function AstroEditor() {
    const [components, setComponents] = (0, react_1.useState)([]);
    const [draggedId, setDraggedId] = (0, react_1.useState)(null);
    const [dropIndicator, setDropIndicator] = (0, react_1.useState)(null);
    const componentsRef = (0, react_1.useRef)(components);
    const listRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        componentsRef.current = components;
    }, [components]);
    // Einmaliger Message-Listener (keine Abhängigkeit zu components)
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            var _a;
            const { command, tool, content, components: incomingComponents } = event.data || {};
            switch (command) {
                case 'insertSnippet':
                    addComponent(tool, extractAttributes(content));
                    break;
                case 'loadComponents':
                    setComponents(Array.isArray(incomingComponents) ? incomingComponents : []);
                    break;
                case 'addComponent':
                    addComponent(tool);
                    break;
                case 'generateCode': {
                    const code = generateAstroCode(componentsRef.current);
                    (_a = navigator.clipboard) === null || _a === void 0 ? void 0 : _a.writeText(code).catch(() => { });
                    window.parent.postMessage({ command: 'codeGenerated', code }, '*');
                    break;
                }
                case 'clearAll':
                    setComponents([]);
                    break;
                default:
                    break;
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    // ---- snippet defs helpers ----
    const getDefinition = (type) => snippetDefinitions_1.snippetDefinitions[type];
    const defaultsForType = (type) => {
        var _a;
        const def = getDefinition(type);
        const out = {};
        if (def === null || def === void 0 ? void 0 : def.attributes) {
            for (const [key, config] of Object.entries(def.attributes)) {
                if (config && typeof config === 'object' && 'value' in config) {
                    out[key] = (_a = config.value) !== null && _a !== void 0 ? _a : '';
                }
                else {
                    out[key] = '';
                }
            }
        }
        return out;
    };
    const addComponent = (type, overrides = {}) => {
        const attributes = Object.assign(Object.assign({}, defaultsForType(type)), overrides);
        const newComponent = {
            id: generateId(),
            type,
            attributes,
            children: [],
        };
        setComponents(prev => [...prev, newComponent]);
    };
    // ---- util: ids, parsing, tree ops ----
    const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11);
    // Sichere Extraktion aus <script>let values={...};</script>
    const extractAttributes = (content) => {
        try {
            if (!content)
                return {};
            const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
            if (!scriptMatch)
                return {};
            const scriptContent = scriptMatch[1];
            const valuesMatch = scriptContent.match(/let\s+values\s*=\s*({[\s\S]*?});/);
            if (!valuesMatch)
                return {};
            const valuesStr = valuesMatch[1];
            const parsed = new Function(`"use strict"; return (${valuesStr});`)();
            const cleaned = {};
            for (const [k, v] of Object.entries(parsed)) {
                if (v !== '' && v !== undefined && v !== null) {
                    cleaned[k] = v === 'true' ? true : v === 'false' ? false : v;
                }
            }
            return cleaned;
        }
        catch (_a) {
            return {};
        }
    };
    const findById = (nodes, id) => {
        for (const n of nodes) {
            if (n.id === id)
                return n;
            const found = findById(n.children, id);
            if (found)
                return found;
        }
        return null;
    };
    const containsId = (node, targetId) => {
        if (node.id === targetId)
            return true;
        for (const c of node.children) {
            if (containsId(c, targetId))
                return true;
        }
        return false;
    };
    // Liefert parentId (null = Root) + Index eines Knotens
    const findParentAndIndex = (nodes, id, parentId = null) => {
        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            if (n.id === id)
                return { parentId, index: i };
            const sub = findParentAndIndex(n.children, id, n.id);
            if (sub)
                return sub;
        }
        return null;
    };
    // Entfernt Knoten; gibt neuen Baum + entfernten Knoten
    const removeById = (nodes, id) => {
        const next = [];
        let removed = null;
        for (const n of nodes) {
            if (n.id === id) {
                removed = n;
                continue;
            }
            const res = removeById(n.children, id);
            if (res.removed && !removed)
                removed = res.removed;
            next.push(Object.assign(Object.assign({}, n), { children: res.nodes }));
        }
        return { nodes: next, removed };
    };
    // Fügt child bei parentId an Index ein (parentId null -> Root)
    const insertAt = (nodes, parentId, index, child) => {
        if (parentId === null) {
            const i = Math.max(0, Math.min(index, nodes.length));
            return [...nodes.slice(0, i), child, ...nodes.slice(i)];
        }
        return nodes.map(n => n.id === parentId
            ? Object.assign(Object.assign({}, n), { children: [
                    ...n.children.slice(0, Math.max(0, Math.min(index, n.children.length))),
                    child,
                    ...n.children.slice(Math.max(0, Math.min(index, n.children.length))),
                ] }) : Object.assign(Object.assign({}, n), { children: insertAt(n.children, parentId, index, child) }));
    };
    // Ist Ziel im eigenen Subtree? -> verbieten (verhindert Zyklen/Löschung)
    const wouldCreateCycle = (nodes, sourceId, targetId) => {
        if (targetId === 'ROOT')
            return false;
        const sourceNode = findById(nodes, sourceId);
        if (!sourceNode)
            return false;
        return containsId(sourceNode, targetId);
    };
    // Atomares Move: Nur wenn Quelle + Ziel valide → anwenden, sonst unverändert lassen
    const moveNode = (nodes, sourceId, drop) => {
        if (!drop)
            return nodes;
        if (drop.targetId !== 'ROOT' && sourceId === drop.targetId)
            return nodes;
        if (wouldCreateCycle(nodes, sourceId, drop.targetId))
            return nodes;
        const srcInfo = findParentAndIndex(nodes, sourceId);
        if (!srcInfo)
            return nodes;
        let destParentId;
        let destIndex;
        if (drop.targetId === 'ROOT') {
            destParentId = null;
            destIndex = drop.position === 'before' ? 0 : componentsRef.current.length;
        }
        else {
            const target = findById(nodes, drop.targetId);
            if (!target)
                return nodes;
            if (drop.position === 'inside') {
                destParentId = target.id;
                destIndex = target.children.length;
            }
            else {
                const tInfo = findParentAndIndex(nodes, target.id);
                if (!tInfo)
                    return nodes;
                destParentId = tInfo.parentId;
                destIndex = tInfo.index + (drop.position === 'after' ? 1 : 0);
                // Reordering im selben Parent korrigieren (Index verschiebt sich nach Remove)
                if (destParentId === srcInfo.parentId && srcInfo.index < destIndex) {
                    destIndex -= 1;
                }
            }
        }
        // Entfernen + Einfügen (Rollback bei Problemen)
        const { nodes: without, removed } = removeById(nodes, sourceId);
        if (!removed)
            return nodes;
        // Extra-Schutz: nicht in eigenen (jetzt entfernten) Subtree einfügen
        if (drop.targetId !== 'ROOT') {
            // Wenn Ziel unterhalb der entfernten Quelle lag, existiert es nach removeById nicht mehr
            const targetStillExists = !!findById(drop.position === 'inside' ? without : without, // gleicher Baum
            drop.targetId);
            if (!targetStillExists && drop.targetId !== 'ROOT') {
                return nodes; // Rollback
            }
        }
        return insertAt(without, destParentId, destIndex, removed);
    };
    const updateAttribute = (id, key, value) => {
        const update = (nodes) => nodes.map(n => n.id === id
            ? Object.assign(Object.assign({}, n), { attributes: Object.assign(Object.assign({}, n.attributes), { [key]: value }) }) : Object.assign(Object.assign({}, n), { children: update(n.children) }));
        setComponents(update);
    };
    const generateAstroCode = (nodes) => {
        const render = (comp, depth = 0) => {
            const indent = '  '.repeat(depth);
            const attrs = Object.entries(comp.attributes)
                .filter(([, v]) => v !== '' && v !== false && v !== undefined && v !== null)
                .map(([k, v]) => `${k}="${v}"`)
                .join(' ');
            const opening = `${indent}<${comp.type}${attrs ? ' ' + attrs : ''}>`;
            if (!comp.children.length)
                return `${opening}</${comp.type}>`;
            const children = comp.children.map(c => render(c, depth + 1)).join('\n');
            return `${opening}\n${children}\n${indent}</${comp.type}>`;
        };
        return nodes.map(n => render(n)).join('\n\n');
    };
    // ---- Drag & Drop ----
    const handleDragStart = (e, id) => {
        setDraggedId(id);
        setDropIndicator(null);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: eigenes Drag-Image vermeiden, damit die Karte sichtbar bleibt
        // e.dataTransfer.setDragImage(new Image(), 0, 0)
    };
    const computeNodeDropPos = (e, comp, canBeParent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const third = rect.height / 3;
        if (offsetY < third)
            return 'before';
        if (offsetY > 2 * third)
            return 'after';
        return canBeParent ? 'inside' : offsetY < rect.height / 2 ? 'before' : 'after';
    };
    const handleNodeDragOver = (e, comp) => {
        var _a;
        if (!draggedId)
            return;
        e.preventDefault();
        e.stopPropagation();
        const canBeParent = !!((_a = getDefinition(comp.type)) === null || _a === void 0 ? void 0 : _a.canBeParent);
        const pos = computeNodeDropPos(e, comp, canBeParent);
        const invalid = draggedId === comp.id || wouldCreateCycle(componentsRef.current, draggedId, comp.id);
        e.dataTransfer.dropEffect = invalid ? 'none' : 'move';
        setDropIndicator({ targetId: comp.id, position: pos });
    };
    const handleRootDragOver = (e) => {
        if (!draggedId)
            return;
        if (!listRef.current)
            return;
        e.preventDefault();
        const rect = listRef.current.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const pos = offsetY < rect.height / 2 ? 'before' : 'after';
        e.dataTransfer.dropEffect = 'move';
        setDropIndicator({ targetId: 'ROOT', position: pos });
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedId || !dropIndicator) {
            setDraggedId(null);
            setDropIndicator(null);
            return;
        }
        setComponents(prev => moveNode(prev, draggedId, dropIndicator));
        setDraggedId(null);
        setDropIndicator(null);
    };
    const handleDragEnd = () => {
        setDraggedId(null);
        setDropIndicator(null);
    };
    // ---- Render ----
    const renderNode = (comp, depth = 0) => {
        const definition = getDefinition(comp.type);
        const canBeParent = !!(definition === null || definition === void 0 ? void 0 : definition.canBeParent);
        const isBefore = (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === comp.id && dropIndicator.position === 'before';
        const isInside = (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === comp.id && dropIndicator.position === 'inside';
        const isAfter = (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === comp.id && dropIndicator.position === 'after';
        return (React.createElement("div", { key: comp.id, draggable: true, onDragStart: e => handleDragStart(e, comp.id), onDragOver: e => handleNodeDragOver(e, comp), onDrop: handleDrop, onDragEnd: handleDragEnd, style: {
                position: 'relative',
                marginLeft: depth * 20,
                padding: '12px',
                margin: '8px 0',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: isInside ? '#e3f2fd' : '#f8f9fa',
                opacity: draggedId === comp.id ? 0.5 : 1,
                cursor: 'move',
                // Visuelle Drop-Bars
                boxShadow: [
                    isBefore ? 'inset 0 3px 0 0 #1976d2' : '',
                    isAfter ? 'inset 0 -3px 0 0 #1976d2' : '',
                ]
                    .filter(Boolean)
                    .join(', '),
            } },
            React.createElement("h4", { style: { margin: '0 0 8px 0' } }, comp.type),
            (definition === null || definition === void 0 ? void 0 : definition.attributes) && (React.createElement("details", { style: { marginBottom: '8px' } },
                React.createElement("summary", { style: {
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        userSelect: 'none',
                    } },
                    "Attributes (",
                    Object.keys(definition.attributes).length,
                    ")"),
                Object.entries(definition.attributes).map(([key, config]) => {
                    var _a;
                    const attrConfig = typeof config === 'object' ? config : { type: 'text', value: '' };
                    const currentValue = (_a = comp.attributes[key]) !== null && _a !== void 0 ? _a : '';
                    return (React.createElement("div", { key: key, style: { marginBottom: '8px', marginLeft: '16px' } },
                        React.createElement("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px' } },
                            key,
                            ":"),
                        attrConfig.type === 'checkbox' ? (React.createElement("input", { type: "checkbox", checked: currentValue === true || currentValue === 'true', onChange: e => updateAttribute(comp.id, key, e.target.checked) })) : attrConfig.type === 'textarea' ? (React.createElement("textarea", { value: currentValue, onChange: e => updateAttribute(comp.id, key, e.target.value), rows: 3, style: { width: '100%', fontSize: '12px' } })) : (React.createElement("input", { type: "text", value: currentValue, onChange: e => updateAttribute(comp.id, key, e.target.value), style: { width: '100%', fontSize: '12px' } }))));
                }))),
            comp.children.map(child => renderNode(child, depth + 1))));
    };
    return (React.createElement("div", { className: "mainCanvas" },
        React.createElement("div", { style: { padding: '20px' } },
            React.createElement("h2", { style: { margin: '0 0 20px 0' } }, "TT Editor"),
            React.createElement("div", { ref: listRef, onDragOver: handleRootDragOver, onDrop: handleDrop, onDragEnd: handleDragEnd, style: {
                    minHeight: 80,
                    border: components.length === 0 ? '2px dashed #bbb' : undefined,
                    padding: 8,
                    // Root-Drop-Indikator
                    boxShadow: (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === 'ROOT'
                        ? dropIndicator.position === 'before'
                            ? 'inset 0 3px 0 0 #1976d2'
                            : 'inset 0 -3px 0 0 #1976d2'
                        : undefined,
                } },
                React.createElement("h3", null,
                    "Components (",
                    components.length,
                    ")"),
                components.length === 0 ? (React.createElement("p", null, "Ziehe ein Element hierher oder f\u00FCge eines \u00FCber die Sidebar hinzu.")) : (components.map(comp => renderNode(comp)))))));
}
