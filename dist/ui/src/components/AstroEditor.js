"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AstroEditor;
const React = require("react");
const react_1 = require("react");
const snippetDefinitions_1 = require("../../../snippetDefinitions");
function AstroEditor() {
    const [components, setComponents] = (0, react_1.useState)([]);
    const [draggedId, setDraggedId] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            const { command, tool, content } = event.data;
            if (command === 'insertSnippet') {
                addComponentWithAttributes(tool, content);
            }
            else if (command === 'loadComponents') {
                const { components } = event.data;
                setComponents(components || []);
            }
            else if (command === 'addComponent') {
                // Add empty component from sidebar
                addComponent(tool);
            }
            else if (command === 'generateCode') {
                // Generate and copy code
                const code = generateAstroCode();
                navigator.clipboard.writeText(code);
                // Send back to extension
                window.parent.postMessage({ command: 'codeGenerated', code }, '*');
            }
            else if (command === 'clearAll') {
                setComponents([]);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [components]); // Include components for generateAstroCode
    const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11);
    // Extract attributes from HTML content (for insertSnippet)
    const extractAttributes = (content) => {
        try {
            // Try to extract from JavaScript values object
            const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
            if (!scriptMatch)
                return {};
            const scriptContent = scriptMatch[1];
            const valuesMatch = scriptContent.match(/let values = ({[\s\S]*?});/);
            if (valuesMatch) {
                // Parse the JavaScript object
                const valuesStr = valuesMatch[1];
                const parsed = eval(`(${valuesStr})`); // Safe since we control the content
                const cleaned = {};
                Object.entries(parsed).forEach(([key, value]) => {
                    if (value && value !== '') {
                        cleaned[key] = value === 'true' ? true : value === 'false' ? false : value;
                    }
                });
                return cleaned;
            }
            return {};
        }
        catch (_a) {
            return {};
        }
    };
    // Add component with attributes from content (for insertSnippet)
    const addComponentWithAttributes = (type, content) => {
        const extractedAttrs = extractAttributes(content);
        const definition = snippetDefinitions_1.snippetDefinitions[type];
        const attributes = {};
        // Fill with template values first
        if (definition === null || definition === void 0 ? void 0 : definition.attributes) {
            Object.entries(definition.attributes).forEach(([key, config]) => {
                if (typeof config === 'object' && 'value' in config) {
                    attributes[key] = config.value || '';
                }
                else {
                    attributes[key] = '';
                }
            });
        }
        // Override with extracted values
        Object.entries(extractedAttrs).forEach(([key, value]) => {
            attributes[key] = value;
        });
        const newComponent = {
            id: generateId(),
            type,
            attributes,
            children: []
        };
        setComponents(prev => [...prev, newComponent]);
    };
    // Add new empty component (for manual add buttons)
    const addComponent = (type) => {
        const definition = snippetDefinitions_1.snippetDefinitions[type];
        const attributes = {};
        // Fill with empty values from definition
        if (definition === null || definition === void 0 ? void 0 : definition.attributes) {
            Object.entries(definition.attributes).forEach(([key, config]) => {
                if (typeof config === 'object' && 'value' in config) {
                    attributes[key] = config.value || '';
                }
                else {
                    attributes[key] = '';
                }
            });
        }
        const newComponent = {
            id: generateId(),
            type,
            attributes,
            children: []
        };
        setComponents(prev => [...prev, newComponent]);
    };
    // Update component attribute
    const updateAttribute = (id, key, value) => {
        const update = (comps) => comps.map(comp => comp.id === id
            ? Object.assign(Object.assign({}, comp), { attributes: Object.assign(Object.assign({}, comp.attributes), { [key]: value }) }) : Object.assign(Object.assign({}, comp), { children: update(comp.children) }));
        setComponents(update);
    };
    // Generate Astro code
    const generateAstroCode = () => {
        const renderComponent = (comp, depth = 0) => {
            const indent = '  '.repeat(depth);
            const attrs = Object.entries(comp.attributes)
                .filter(([_, value]) => value !== '' && value !== false)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ');
            const opening = `${indent}<${comp.type}${attrs ? ' ' + attrs : ''}>`;
            if (comp.children.length === 0) {
                return `${opening}</${comp.type}>`;
            }
            const children = comp.children.map(child => renderComponent(child, depth + 1)).join('\\n');
            return `${opening}\\n${children}\\n${indent}</${comp.type}>`;
        };
        return components.map(comp => renderComponent(comp)).join('\\n\\n');
    };
    // Drag & Drop
    const handleDragStart = (e, id) => {
        setDraggedId(id);
        e.dataTransfer.effectAllowed = 'move';
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };
    const handleDrop = (e, targetId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!draggedId || draggedId === targetId)
            return;
        // Check if target can be parent
        const findComponent = (comps, id) => {
            for (const comp of comps) {
                if (comp.id === id)
                    return comp;
                const found = findComponent(comp.children, id);
                if (found)
                    return found;
            }
            return null;
        };
        const targetComp = findComponent(components, targetId);
        const targetDefinition = targetComp ? snippetDefinitions_1.snippetDefinitions[targetComp.type] : null;
        if (!(targetDefinition === null || targetDefinition === void 0 ? void 0 : targetDefinition.canBeParent)) {
            return;
        }
        // Move component
        const moveComponent = (comps) => {
            let draggedComp = null;
            // Remove dragged component
            const removeFromComponents = (list) => list.filter(comp => {
                if (comp.id === draggedId) {
                    draggedComp = comp;
                    return false;
                }
                comp.children = removeFromComponents(comp.children);
                return true;
            });
            const result = removeFromComponents(comps);
            // Add to target
            if (draggedComp) {
                const addToTarget = (list) => list.map(comp => comp.id === targetId
                    ? Object.assign(Object.assign({}, comp), { children: [...comp.children, draggedComp] }) : Object.assign(Object.assign({}, comp), { children: addToTarget(comp.children) }));
                return addToTarget(result);
            }
            return result;
        };
        setComponents(moveComponent);
        setDraggedId(null);
    };
    // Render component recursively
    const renderComponent = (comp, depth = 0) => {
        const definition = snippetDefinitions_1.snippetDefinitions[comp.type];
        const canBeParent = (definition === null || definition === void 0 ? void 0 : definition.canBeParent) || false;
        const isDragTarget = draggedId && canBeParent && draggedId !== comp.id;
        return (React.createElement("div", { key: comp.id, draggable: true, onDragStart: e => handleDragStart(e, comp.id), onDragOver: canBeParent ? handleDragOver : undefined, onDrop: canBeParent ? (e => handleDrop(e, comp.id)) : undefined, style: {
                marginLeft: depth * 20,
                padding: '12px',
                margin: '8px 0',
                border: isDragTarget ? '2px dashed #007bff' : '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: isDragTarget ? '#e3f2fd' : '#f8f9fa',
                opacity: draggedId === comp.id ? 0.5 : 1,
                cursor: 'move'
            } },
            React.createElement("h4", { style: { margin: '0 0 8px 0' } }, comp.type),
            (definition === null || definition === void 0 ? void 0 : definition.attributes) && (React.createElement("details", { style: { marginBottom: '8px' } },
                React.createElement("summary", { style: {
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        userSelect: 'none'
                    } },
                    "Attributes (",
                    Object.keys(definition.attributes).length,
                    ")"),
                Object.entries(definition.attributes).map(([key, config]) => {
                    const attrConfig = typeof config === 'object' ? config : { type: 'text', value: '' };
                    const currentValue = comp.attributes[key] || '';
                    return (React.createElement("div", { key: key, style: { marginBottom: '8px', marginLeft: '16px' } },
                        React.createElement("label", { style: { display: 'block', fontSize: '12px', marginBottom: '4px' } },
                            key,
                            ":"),
                        attrConfig.type === 'checkbox' ? (React.createElement("input", { type: "checkbox", checked: currentValue === true || currentValue === 'true', onChange: e => updateAttribute(comp.id, key, e.target.checked) })) : attrConfig.type === 'textarea' ? (React.createElement("textarea", { value: currentValue, onChange: e => updateAttribute(comp.id, key, e.target.value), rows: 3, style: { width: '100%', fontSize: '12px' } })) : (React.createElement("input", { type: "text", value: currentValue, onChange: e => updateAttribute(comp.id, key, e.target.value), style: { width: '100%', fontSize: '12px' } }))));
                }))),
            comp.children.map(child => renderComponent(child, depth + 1))));
    };
    return (React.createElement("div", { className: "mainCanvas" },
        React.createElement("div", { style: { padding: '20px' } },
            React.createElement("h2", { style: { margin: '0 0 20px 0' } }, "Astro Editor"),
            React.createElement("div", null,
                React.createElement("h3", null,
                    "Components (",
                    components.length,
                    ")"),
                components.length === 0 ? (React.createElement("p", null, "No components loaded. Add components from sidebar or load from extension.")) : (components.map(comp => renderComponent(comp)))))));
}
