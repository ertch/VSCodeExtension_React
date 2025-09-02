"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AstroEditor;
const React = require("react");
const react_1 = require("react");
const treeOperations_1 = require("../utils/treeOperations");
const dragDropUtils_1 = require("../utils/dragDropUtils");
const attributeExtraction_1 = require("../utils/attributeExtraction");
const astroCodeGenerator_1 = require("../utils/astroCodeGenerator");
const componentManagement_1 = require("../utils/componentManagement");
function AstroEditor() {
    const [components, setComponents] = (0, react_1.useState)([]);
    const [draggedId, setDraggedId] = (0, react_1.useState)(null);
    const [dropIndicator, setDropIndicator] = (0, react_1.useState)(null);
    const componentsRef = (0, react_1.useRef)(components);
    const listRef = (0, react_1.useRef)(null);
    const dragDropState = { draggedId, dropIndicator };
    (0, react_1.useEffect)(() => {
        componentsRef.current = components;
    }, [components]);
    // Message handling
    const addComponent = (type, overrides = {}) => {
        const newComponent = (0, componentManagement_1.createComponent)(type, overrides);
        setComponents(prev => [...prev, newComponent]);
    };
    // Einmaliger Message-Listener (keine Abhängigkeit zu components)
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            var _a;
            const { command, tool, content, components: incomingComponents } = event.data || {};
            switch (command) {
                case 'insertSnippet':
                    addComponent(tool, (0, attributeExtraction_1.extractAttributes)(content));
                    break;
                case 'loadComponents':
                    setComponents(Array.isArray(incomingComponents) ? incomingComponents : []);
                    break;
                case 'loadComponentHierarchy':
                    // New: Load complete hierarchy with nesting
                    setComponents(Array.isArray(incomingComponents) ? incomingComponents : []);
                    break;
                case 'addComponent':
                    addComponent(tool);
                    break;
                case 'generateCode': {
                    const code = (0, astroCodeGenerator_1.generateAstroCode)(componentsRef.current);
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
    // Create drag and drop handlers
    const handleDrop = (draggedId, dropIndicator) => {
        setComponents(prev => (0, treeOperations_1.moveNode)(prev, draggedId, dropIndicator, prev.length));
    };
    const dragDropHandlers = (0, dragDropUtils_1.createDragDropHandlers)(dragDropState, setDraggedId, setDropIndicator, handleDrop, components);
    // Attribute update handler
    const handleUpdateAttribute = (id, key, value) => {
        setComponents(prev => (0, treeOperations_1.updateAttribute)(prev, id, key, value));
    };
    // ---- Render ----
    const renderNode = (comp, depth = 0) => {
        const definition = (0, componentManagement_1.getDefinition)(comp.type);
        const canBeParent = !!(definition === null || definition === void 0 ? void 0 : definition.canBeParent);
        const dropStyles = (0, dragDropUtils_1.getDropIndicatorStyles)(comp, dropIndicator, draggedId);
        return (React.createElement("div", { key: comp.id, draggable: true, onDragStart: e => dragDropHandlers.handleDragStart(e, comp.id), onDragOver: e => dragDropHandlers.handleNodeDragOver(e, comp, canBeParent), onDrop: dragDropHandlers.handleDrop, onDragEnd: dragDropHandlers.handleDragEnd, style: Object.assign({ position: 'relative', marginLeft: depth * 20, padding: '12px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '6px', cursor: 'move' }, dropStyles) },
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
                        attrConfig.type === 'checkbox' ? (React.createElement("input", { type: "checkbox", checked: currentValue === true || currentValue === 'true', onChange: e => handleUpdateAttribute(comp.id, key, e.target.checked) })) : attrConfig.type === 'textarea' ? (React.createElement("textarea", { value: currentValue, onChange: e => handleUpdateAttribute(comp.id, key, e.target.value), rows: 3, style: { width: '100%', fontSize: '12px' } })) : (React.createElement("input", { type: "text", value: currentValue, onChange: e => handleUpdateAttribute(comp.id, key, e.target.value), style: { width: '100%', fontSize: '12px' } }))));
                }))),
            comp.children.map(child => renderNode(child, depth + 1))));
    };
    return (React.createElement("div", { className: "mainCanvas" },
        React.createElement("div", { style: { padding: '20px' } },
            React.createElement("h2", { style: { margin: '0 0 20px 0' } }, "TT Editor"),
            React.createElement("div", { ref: listRef, onDragOver: e => dragDropHandlers.handleRootDragOver(e, listRef, components.length), onDrop: dragDropHandlers.handleDrop, onDragEnd: dragDropHandlers.handleDragEnd, style: Object.assign({ minHeight: 80, border: components.length === 0 ? '2px dashed #bbb' : undefined, padding: 8 }, (0, dragDropUtils_1.getRootDropIndicatorStyles)(dropIndicator, components.length)) },
                React.createElement("h3", null,
                    "Components (",
                    components.length,
                    ")"),
                components.length === 0 ? (React.createElement("p", null, "Ziehe ein Element hierher oder f\u00FCge eines \u00FCber die Sidebar hinzu.")) : (components.map(comp => renderNode(comp)))))));
}
