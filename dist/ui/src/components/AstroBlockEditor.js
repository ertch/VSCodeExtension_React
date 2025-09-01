"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AstroBlockEditor;
const React = require("react");
const react_1 = require("react");
const snippetDefinitions_1 = require("../../../snippetDefinitions");
function AstroBlockEditor() {
    const [project, setProject] = (0, react_1.useState)({ components: [] });
    const [draggedId, setDraggedId] = (0, react_1.useState)(null);
    const [componentQueue, setComponentQueue] = (0, react_1.useState)([]); // Queue for building nested structure
    (0, react_1.useEffect)(() => {
        const handleMessage = (event) => {
            const message = event.data;
            console.log('Received message:', message.tool || message.command);
            if (message.command === 'insertSnippet') {
                // Simple: Extract component data and add to queue
                const componentData = extractComponentData(message.content, message.tool);
                if (componentData) {
                    const newComponent = {
                        id: generateId(),
                        type: componentData.type,
                        attributes: componentData.attributes,
                        children: []
                    };
                    console.log(`Added ${componentData.type}:`, componentData.attributes);
                    setComponentQueue(prev => [...prev, newComponent]);
                }
            }
            else if (message.command === 'buildStructure') {
                // Build the nested structure from queue
                buildNestedStructure();
            }
            else if (message.command === 'createBlock') {
                // Manual block creation from toolbar
                if (message.blockType) {
                    addComponent(message.blockType);
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11);
    // Simple extractor - just get attributes from script values
    const extractComponentData = (htmlContent, tool) => {
        if (!snippetDefinitions_1.snippetDefinitions[tool])
            return null;
        // Extract values from script tag
        const scriptMatch = htmlContent.match(/let values = ({[\s\S]*?});/);
        if (!scriptMatch)
            return { type: tool, attributes: {} };
        try {
            const attributes = JSON.parse(scriptMatch[1]);
            // Convert string booleans and filter empty values
            const cleanAttributes = {};
            Object.entries(attributes).forEach(([key, value]) => {
                if (value && value !== '') {
                    cleanAttributes[key] = value === 'true' ? true : value === 'false' ? false : value;
                }
            });
            return { type: tool, attributes: cleanAttributes };
        }
        catch (_a) {
            return { type: tool, attributes: {} };
        }
    };
    // Build nested structure from queue based on Astro component hierarchy
    const buildNestedStructure = () => {
        if (componentQueue.length === 0)
            return;
        console.log('Building structure from', componentQueue.length, 'components');
        // Simple rule-based nesting based on common Astro patterns
        const organized = organizeComponents(componentQueue);
        setProject({ components: organized });
        setComponentQueue([]); // Clear queue after building
        console.log('Built structure:', organized);
    };
    // Organize components into proper hierarchy
    const organizeComponents = (components) => {
        const result = [];
        // Find Layout (should be root)
        const layout = components.find(c => c.type === 'Layout');
        if (layout) {
            // Add NavTabs and TabWrapper as children of Layout
            const navTabs = components.find(c => c.type === 'NavTabs');
            const tabWrapper = components.find(c => c.type === 'TabWrapper');
            if (navTabs)
                layout.children.push(navTabs);
            if (tabWrapper) {
                // Add TabPages as children of TabWrapper
                const tabPages = components.filter(c => c.type === 'TabPage');
                tabWrapper.children.push(...tabPages);
                // Add Fields to first TabPage or directly to TabWrapper
                const firstTabPage = tabPages[0] || tabWrapper;
                const fields = components.filter(c => c.type === 'Field');
                fields.forEach(field => {
                    // Add form elements to each field
                    const inputs = components.filter(c => ['Input', 'Select', 'Gatekeeper', 'SQL_Select', 'Suggestion', 'textField'].includes(c.type));
                    field.children.push(...inputs);
                    firstTabPage.children.push(field);
                });
                // Add Gates and ConBlocks
                const gates = components.filter(c => ['Gate', 'GateGroup'].includes(c.type));
                const conBlocks = components.filter(c => c.type === 'ConBlock');
                const buttons = components.filter(c => ['RecordBtn', 'FinishBtn', 'NextPageBtn'].includes(c.type));
                // Add these to appropriate parents
                conBlocks.forEach(block => {
                    block.children.push(...buttons);
                    firstTabPage.children.push(block);
                });
                gates.forEach(gate => firstTabPage.children.push(gate));
                layout.children.push(tabWrapper);
            }
            result.push(layout);
        }
        else {
            // No layout found - just add components as flat structure
            result.push(...components);
        }
        return result;
    };
    // Add new component
    const addComponent = (type, parentId) => {
        const def = snippetDefinitions_1.snippetDefinitions[type];
        if (!def)
            return;
        const newComponent = {
            id: generateId(),
            type,
            attributes: getDefaultAttributes(type),
            children: []
        };
        if (parentId) {
            setProject(prev => (Object.assign(Object.assign({}, prev), { components: addToParent(prev.components, parentId, newComponent) })));
        }
        else {
            setProject(prev => (Object.assign(Object.assign({}, prev), { components: [...prev.components, newComponent] })));
        }
    };
    // Get default attributes from snippet definition
    const getDefaultAttributes = (type) => {
        const def = snippetDefinitions_1.snippetDefinitions[type];
        if (!(def === null || def === void 0 ? void 0 : def.attributes))
            return {};
        const attrs = {};
        const defAttrs = def.attributes;
        // Handle different attribute structures
        if (typeof defAttrs === 'object' && defAttrs !== null) {
            // Check if it's a single attribute config (like NavTabs)
            if ('type' in defAttrs && 'value' in defAttrs) {
                attrs.value = defAttrs.value;
            }
            else {
                // Multiple attributes object
                Object.keys(defAttrs).forEach(key => {
                    const config = defAttrs[key];
                    if (typeof config === 'object' && config !== null && 'value' in config) {
                        attrs[key] = config.value;
                    }
                });
            }
        }
        return attrs;
    };
    // Update component attribute
    const updateAttribute = (componentId, attrName, value) => {
        const updateInTree = (components) => {
            return components.map(comp => {
                if (comp.id === componentId) {
                    return Object.assign(Object.assign({}, comp), { attributes: Object.assign(Object.assign({}, comp.attributes), { [attrName]: value }) });
                }
                if (comp.children.length > 0) {
                    return Object.assign(Object.assign({}, comp), { children: updateInTree(comp.children) });
                }
                return comp;
            });
        };
        setProject(prev => (Object.assign(Object.assign({}, prev), { components: updateInTree(prev.components) })));
    };
    // Helper functions for tree manipulation
    const addToParent = (components, parentId, newComp) => {
        return components.map(comp => {
            if (comp.id === parentId) {
                const def = snippetDefinitions_1.snippetDefinitions[comp.type];
                if (def === null || def === void 0 ? void 0 : def.canBeParent) {
                    console.log(`Adding ${newComp.type} to ${comp.type} (canBeParent: true)`);
                    return Object.assign(Object.assign({}, comp), { children: [...comp.children, newComp] });
                }
                else {
                    console.log(`Cannot add to ${comp.type} (canBeParent: false)`);
                    return comp;
                }
            }
            if (comp.children.length > 0) {
                return Object.assign(Object.assign({}, comp), { children: addToParent(comp.children, parentId, newComp) });
            }
            return comp;
        });
    };
    const removeComponent = (componentId) => {
        const removeFromTree = (components) => {
            return components
                .filter(comp => comp.id !== componentId)
                .map(comp => (Object.assign(Object.assign({}, comp), { children: comp.children.length > 0 ? removeFromTree(comp.children) : [] })));
        };
        setProject(prev => (Object.assign(Object.assign({}, prev), { components: removeFromTree(prev.components) })));
    };
    // Drag & Drop functions
    const onDropOnto = (parentId) => {
        console.log('Drop attempt:', { draggedId, parentId }); // Debug
        if (!draggedId || draggedId === parentId) {
            console.log('Drop cancelled: invalid drag/drop combination');
            return;
        }
        let moveComponent = null;
        const without = removeFromTree(project.components, draggedId, comp => {
            moveComponent = comp;
            console.log('Found component to move:', comp);
        });
        if (moveComponent) {
            console.log('Moving component to parent:', parentId);
            const newComponents = addToParent(without, parentId, moveComponent);
            setProject(Object.assign(Object.assign({}, project), { components: newComponents }));
            console.log('Drop successful, new structure:', newComponents);
        }
        else {
            console.log('No component found to move');
        }
        setDraggedId(null);
    };
    const removeFromTree = (components, id, cb) => {
        return components
            .map(comp => {
            if (comp.id === id) {
                cb(comp);
                return null;
            }
            if (comp.children.length > 0) {
                return Object.assign(Object.assign({}, comp), { children: removeFromTree(comp.children, id, cb) });
            }
            return comp;
        })
            .filter(Boolean);
    };
    // Export current structure (for code generation later)
    const exportToCode = () => {
        console.log('Exporting project structure:', project);
        // Send back to extension for code generation
        window.postMessage({
            command: 'exportToAstroCode',
            project: project
        }, '*');
        return project;
    };
    return (React.createElement("div", { style: { padding: '20px', maxWidth: '1200px', margin: '0 auto' } },
        React.createElement("div", { style: { marginBottom: '24px' } },
            React.createElement("h1", { style: {
                    fontSize: '28px',
                    fontWeight: '600',
                    color: '#1a202c',
                    margin: '0 0 8px 0'
                } }, "Astro Component Editor"),
            React.createElement("p", { style: {
                    color: '#6b7280',
                    margin: '0 0 8px 0',
                    fontSize: '16px'
                } }, "Create and edit Astro components visually"),
            React.createElement("div", { style: {
                    backgroundColor: '#fef3c7',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#92400e',
                    border: '1px solid #fcd34d'
                } },
                "Debug: ",
                project.components.length,
                " components loaded | Queue: ",
                componentQueue.length,
                " waiting | Dragged: ",
                draggedId || 'none')),
        React.createElement("div", { style: {
                backgroundColor: '#f8fafc',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
            } },
            React.createElement("h3", { style: {
                    margin: '0 0 16px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#374151'
                } }, "Add Components"),
            React.createElement("div", { style: {
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                } }, Object.keys(snippetDefinitions_1.snippetDefinitions).map(type => (React.createElement("button", { key: type, onClick: () => addComponent(type), style: {
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#3b82f6';
                } },
                "+ ",
                type))))),
        React.createElement("div", { style: {
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            } },
            React.createElement("div", { style: {
                    padding: '20px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                } },
                React.createElement("h3", { style: {
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: '#374151'
                    } }, "Component Structure"),
                project.components.length > 0 && (React.createElement("p", { style: {
                        margin: '8px 0 0 0',
                        color: '#6b7280',
                        fontSize: '14px'
                    } },
                    project.components.length,
                    " root component",
                    project.components.length !== 1 ? 's' : ''))),
            React.createElement("div", { style: {
                    padding: project.components.length > 0 ? '20px' : '40px 20px',
                    minHeight: '200px'
                } }, project.components.length === 0 ? (React.createElement("div", { style: {
                    textAlign: 'center',
                    color: '#9ca3af',
                    fontSize: '16px'
                } },
                React.createElement("div", { style: { marginBottom: '8px', fontSize: '48px' } }, "\uD83D\uDCE6"),
                React.createElement("div", { style: { marginBottom: '4px' } }, "No components yet"),
                React.createElement("div", { style: { fontSize: '14px' } }, "Add components above or load an Astro file"))) : (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: '12px' } }, project.components.map(comp => (React.createElement(ComponentEditor, { key: comp.id, component: comp, onUpdateAttribute: updateAttribute, onRemove: removeComponent, onAddChild: (type) => addComponent(type, comp.id), setDraggedId: setDraggedId, draggedId: draggedId, onDropOnto: onDropOnto, level: 0 }))))))),
        project.components.length > 0 && (React.createElement("div", { style: {
                marginTop: '24px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center'
            } },
            React.createElement("button", { onClick: exportToCode, style: {
                    padding: '12px 24px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#047857';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#059669';
                } }, "Export to Astro Code"),
            React.createElement("button", { onClick: () => {
                    // Test loading functionality
                    const testData = {
                        command: 'loadAstroFile',
                        components: [
                            {
                                type: 'Layout',
                                attributes: {
                                    campaignNr: 'TEST123',
                                    campaignTitle: 'Test Campaign'
                                },
                                children: [
                                    {
                                        type: 'Input',
                                        attributes: {
                                            id: 'test_input',
                                            label: 'Test Input',
                                            type: 'text',
                                            required: true
                                        },
                                        children: []
                                    }
                                ]
                            }
                        ]
                    };
                    window.postMessage(testData, '*');
                }, style: {
                    padding: '12px 24px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#7c3aed';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#8b5cf6';
                } }, "Test Load"),
            componentQueue.length > 0 && (React.createElement("button", { onClick: buildNestedStructure, style: {
                    padding: '12px 24px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#d97706';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#f59e0b';
                } },
                "Build Structure (",
                componentQueue.length,
                ")")),
            React.createElement("button", { onClick: () => setProject({ components: [] }), style: {
                    padding: '12px 24px',
                    backgroundColor: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: '500',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#b91c1c';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = '#dc2626';
                } }, "Clear All"),
            React.createElement("div", { style: {
                    marginLeft: 'auto',
                    fontSize: '14px',
                    color: '#6b7280'
                } },
                getTotalComponentCount(project.components),
                " total components")))));
}
// Helper function to count total components
function getTotalComponentCount(components) {
    return components.reduce((count, comp) => {
        return count + 1 + getTotalComponentCount(comp.children);
    }, 0);
}
// Component Editor with proper attribute handling
function ComponentEditor({ component, onUpdateAttribute, onRemove, onAddChild, setDraggedId, draggedId, onDropOnto, level }) {
    const [expanded, setExpanded] = (0, react_1.useState)(level === 0); // Auto-expand root components
    const def = snippetDefinitions_1.snippetDefinitions[component.type];
    const canHaveChildren = (def === null || def === void 0 ? void 0 : def.canBeParent) || false;
    const isBeingDragged = draggedId === component.id;
    const canAcceptDrop = canHaveChildren && draggedId && draggedId !== component.id;
    const renderAttributeInputs = () => {
        if (!(def === null || def === void 0 ? void 0 : def.attributes))
            return null;
        const attrs = def.attributes;
        // Handle single attribute case (like NavTabs)
        if (typeof attrs === 'object' && attrs !== null && 'type' in attrs && 'value' in attrs) {
            return (React.createElement("div", { style: {
                    padding: '16px',
                    backgroundColor: '#f8fafc',
                    borderTop: '1px solid #e5e7eb'
                } },
                React.createElement("label", { style: {
                        display: 'block',
                        fontWeight: '500',
                        marginBottom: '8px',
                        fontSize: '14px',
                        color: attrs.requierd ? '#dc2626' : '#374151'
                    } },
                    "Content ",
                    attrs.requierd ? '*' : '',
                    ":"),
                attrs.type === 'textarea' ? (React.createElement("textarea", { value: component.attributes.value || '', onChange: (e) => onUpdateAttribute(component.id, 'value', e.target.value), required: attrs.requierd, rows: 4, style: {
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        resize: 'vertical',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                    } })) : (React.createElement("input", { type: attrs.type, value: component.attributes.value || '', onChange: (e) => onUpdateAttribute(component.id, 'value', e.target.value), required: attrs.requierd, style: {
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontFamily: 'inherit'
                    } }))));
        }
        // Handle multiple attributes
        return (React.createElement("div", { style: {
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e5e7eb'
            } },
            React.createElement("div", { style: { display: 'grid', gap: '16px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' } }, Object.entries(attrs).map(([attrName, config]) => {
                if (typeof config !== 'object' || config === null || !('type' in config))
                    return null;
                return (React.createElement("div", { key: attrName },
                    React.createElement("label", { style: {
                            display: 'block',
                            fontWeight: '500',
                            marginBottom: '6px',
                            fontSize: '14px',
                            color: config.requierd ? '#dc2626' : '#374151'
                        } },
                        attrName,
                        " ",
                        config.requierd ? '*' : '',
                        ":"),
                    config.type === 'textarea' ? (React.createElement("textarea", { value: component.attributes[attrName] || '', onChange: (e) => onUpdateAttribute(component.id, attrName, e.target.value), required: config.requierd, rows: 3, style: {
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            resize: 'vertical',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                        } })) : config.type === 'checkbox' ? (React.createElement("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginTop: '4px'
                        } },
                        React.createElement("input", { type: "checkbox", checked: component.attributes[attrName] === true || component.attributes[attrName] === 'true', onChange: (e) => onUpdateAttribute(component.id, attrName, e.target.checked), style: {
                                width: '16px',
                                height: '16px',
                                cursor: 'pointer'
                            } }),
                        React.createElement("span", { style: { fontSize: '14px', color: '#6b7280' } }, component.attributes[attrName] === true || component.attributes[attrName] === 'true' ? 'Enabled' : 'Disabled'))) : (React.createElement("input", { type: config.type, value: component.attributes[attrName] || '', onChange: (e) => onUpdateAttribute(component.id, attrName, e.target.value), required: config.requierd, style: {
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontFamily: 'inherit'
                        } }))));
            }))));
    };
    return (React.createElement("div", { style: {
            border: `2px solid ${isBeingDragged ? '#6c757d' : canAcceptDrop ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '8px',
            marginBottom: '8px',
            marginLeft: level * 24,
            backgroundColor: isBeingDragged ? '#f8f9fa' : canAcceptDrop ? '#eff6ff' : '#ffffff',
            overflow: 'hidden',
            opacity: isBeingDragged ? 0.5 : 1,
            transition: 'all 0.2s ease'
        } },
        React.createElement("div", { draggable: true, onDragStart: (e) => {
                console.log('Drag started:', component.id, component.type);
                e.stopPropagation();
                setDraggedId(component.id);
                e.dataTransfer.effectAllowed = 'move';
            }, onDragEnd: (e) => {
                console.log('Drag ended');
                e.stopPropagation();
                setDraggedId(null);
            }, onDragOver: (e) => {
                if (canAcceptDrop) {
                    console.log('Drag over valid target:', component.type, 'canBeParent:', canHaveChildren);
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                }
                else {
                    console.log('Drag over invalid target:', component.type, 'canBeParent:', canHaveChildren);
                }
            }, onDrop: (e) => {
                console.log('Drop event triggered on:', component.id, component.type);
                if (canAcceptDrop) {
                    console.log('Drop accepted, calling onDropOnto');
                    onDropOnto(component.id);
                    e.preventDefault();
                    e.stopPropagation();
                }
                else {
                    console.log('Drop rejected - not a valid drop target');
                }
            }, style: {
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderBottom: expanded && (def === null || def === void 0 ? void 0 : def.attributes) ? '1px solid #e5e7eb' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'move'
            } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                React.createElement("span", { style: {
                        backgroundColor: getComponentColor(component.type),
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    } }, component.type),
                React.createElement("span", { style: {
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '500'
                    } }, getComponentLabel(component)),
                (def === null || def === void 0 ? void 0 : def.attributes) && Object.keys(def.attributes).length > 0 && (React.createElement("button", { onClick: () => setExpanded(!expanded), style: {
                        background: 'none',
                        border: '1px solid #d1d5db',
                        cursor: 'pointer',
                        fontSize: '12px',
                        color: '#374151',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: '500',
                        transition: 'all 0.2s'
                    }, onMouseEnter: (e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }, onMouseLeave: (e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    } }, expanded ? '▼ Collapse' : '▶ Edit')),
                canHaveChildren && (React.createElement("span", { style: {
                        fontSize: '12px',
                        color: '#059669',
                        backgroundColor: '#d1fae5',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontWeight: '500'
                    } }, "Container"))),
            React.createElement("button", { onClick: () => onRemove(component.id), style: {
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#dc2626',
                    fontSize: '18px',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s'
                }, onMouseEnter: (e) => {
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                }, onMouseLeave: (e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                }, title: "Remove component" }, "\u2715")),
        expanded && renderAttributeInputs(),
        component.children.length > 0 && (React.createElement("div", { style: { padding: '12px' } },
            React.createElement("div", { style: {
                    marginBottom: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                } },
                "Children (",
                component.children.length,
                ")"),
            component.children.map(child => (React.createElement(ComponentEditor, { key: child.id, component: child, onUpdateAttribute: onUpdateAttribute, onRemove: onRemove, onAddChild: onAddChild, setDraggedId: setDraggedId, draggedId: draggedId, onDropOnto: onDropOnto, level: level + 1 }))))),
        canHaveChildren && (React.createElement("div", { style: {
                padding: '12px',
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
            } },
            React.createElement("select", { onChange: (e) => {
                    if (e.target.value) {
                        onAddChild(e.target.value);
                        e.target.value = '';
                    }
                }, defaultValue: "", style: {
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer'
                } },
                React.createElement("option", { value: "" }, "+ Add child component..."),
                Object.keys(snippetDefinitions_1.snippetDefinitions).map(type => (React.createElement("option", { key: type, value: type }, type))))))));
}
// Helper functions
function getComponentColor(type) {
    const colors = {
        Layout: '#8b5cf6',
        NavTabs: '#f59e0b',
        TabWrapper: '#10b981',
        TabPage: '#06b6d4',
        Field: '#059669',
        Input: '#3b82f6',
        Select: '#8b5cf6',
        Gatekeeper: '#ec4899',
        Gate: '#f59e0b',
        GateGroup: '#ef4444',
        SQL_Select: '#374151',
        Suggestion: '#6b7280',
        textField: '#f59e0b',
        ConBlock: '#10b981',
        RecordBtn: '#06b6d4',
        FinishBtn: '#059669',
        NextPageBtn: '#3b82f6'
    };
    return colors[type] || '#6b7280';
}
function getComponentLabel(component) {
    if (component.attributes.label)
        return component.attributes.label;
    if (component.attributes.id)
        return `#${component.attributes.id}`;
    if (component.attributes.title)
        return component.attributes.title;
    return 'Unnamed';
}
