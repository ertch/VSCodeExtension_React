import * as React from 'react'
import { useState, useEffect } from 'react'
import { snippetDefinitions } from '../../../snippetDefinitions'

interface Component {
    id: string
    type: string
    attributes: Record<string, any>
    children: Component[]
}

export default function AstroEditor() {
    const [components, setComponents] = useState<Component[]>([])
    const [draggedId, setDraggedId] = useState<string | null>(null)

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { command, tool, content } = event.data
            
            if (command === 'insertSnippet') {
                addComponentWithAttributes(tool, content)
            } else if (command === 'loadComponents') {
                const { components } = event.data
                setComponents(components || [])
            } else if (command === 'addComponent') {
                // Add empty component from sidebar
                addComponent(tool)
            } else if (command === 'generateCode') {
                // Generate and copy code
                const code = generateAstroCode()
                navigator.clipboard.writeText(code)
                // Send back to extension
                window.parent.postMessage({ command: 'codeGenerated', code }, '*')
            } else if (command === 'clearAll') {
                setComponents([])
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [components]) // Include components for generateAstroCode

    const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 11)

    // Extract attributes from HTML content (for insertSnippet)
    const extractAttributes = (content: string): Record<string, any> => {
        try {
            // Try to extract from JavaScript values object
            const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
            if (!scriptMatch) return {}
            
            const scriptContent = scriptMatch[1]
            const valuesMatch = scriptContent.match(/let values = ({[\s\S]*?});/)
            
            if (valuesMatch) {
                // Parse the JavaScript object
                const valuesStr = valuesMatch[1]
                const parsed = eval(`(${valuesStr})`) // Safe since we control the content
                
                const cleaned: Record<string, any> = {}
                Object.entries(parsed).forEach(([key, value]) => {
                    if (value && value !== '') {
                        cleaned[key] = value === 'true' ? true : value === 'false' ? false : value
                    }
                })
                
                return cleaned
            }
            
            return {}
        } catch {
            return {}
        }
    }

    // Add component with attributes from content (for insertSnippet)
    const addComponentWithAttributes = (type: string, content: string) => {
        const extractedAttrs = extractAttributes(content)
        const definition = snippetDefinitions[type as keyof typeof snippetDefinitions]
        const attributes: Record<string, any> = {}
        
        // Fill with template values first
        if (definition?.attributes) {
            Object.entries(definition.attributes).forEach(([key, config]) => {
                if (typeof config === 'object' && 'value' in config) {
                    attributes[key] = config.value || ''
                } else {
                    attributes[key] = ''
                }
            })
        }
        
        // Override with extracted values
        Object.entries(extractedAttrs).forEach(([key, value]) => {
            attributes[key] = value
        })
        
        const newComponent: Component = {
            id: generateId(),
            type,
            attributes,
            children: []
        }
        setComponents(prev => [...prev, newComponent])
    }

    // Add new empty component (for manual add buttons)
    const addComponent = (type: string) => {
        const definition = snippetDefinitions[type as keyof typeof snippetDefinitions]
        const attributes: Record<string, any> = {}
        
        // Fill with empty values from definition
        if (definition?.attributes) {
            Object.entries(definition.attributes).forEach(([key, config]) => {
                if (typeof config === 'object' && 'value' in config) {
                    attributes[key] = config.value || ''
                } else {
                    attributes[key] = ''
                }
            })
        }
        
        const newComponent: Component = {
            id: generateId(),
            type,
            attributes,
            children: []
        }
        setComponents(prev => [...prev, newComponent])
    }

    // Update component attribute
    const updateAttribute = (id: string, key: string, value: any) => {
        const update = (comps: Component[]): Component[] =>
            comps.map(comp => 
                comp.id === id 
                    ? { ...comp, attributes: { ...comp.attributes, [key]: value } }
                    : { ...comp, children: update(comp.children) }
            )
        setComponents(update)
    }

    // Generate Astro code
    const generateAstroCode = () => {
        const renderComponent = (comp: Component, depth = 0): string => {
            const indent = '  '.repeat(depth)
            const attrs = Object.entries(comp.attributes)
                .filter(([_, value]) => value !== '' && value !== false)
                .map(([key, value]) => `${key}="${value}"`)
                .join(' ')
            
            const opening = `${indent}<${comp.type}${attrs ? ' ' + attrs : ''}>`
            
            if (comp.children.length === 0) {
                return `${opening}</${comp.type}>`
            }
            
            const children = comp.children.map(child => renderComponent(child, depth + 1)).join('\\n')
            return `${opening}\\n${children}\\n${indent}</${comp.type}>`
        }

        return components.map(comp => renderComponent(comp)).join('\\n\\n')
    }

    // Drag & Drop
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedId(id)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    const handleDrop = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        e.stopPropagation()
        if (!draggedId || draggedId === targetId) return

        // Check if target can be parent
        const findComponent = (comps: Component[], id: string): Component | null => {
            for (const comp of comps) {
                if (comp.id === id) return comp
                const found = findComponent(comp.children, id)
                if (found) return found
            }
            return null
        }
        
        const targetComp = findComponent(components, targetId)
        const targetDefinition = targetComp ? snippetDefinitions[targetComp.type as keyof typeof snippetDefinitions] : null
        
        if (!targetDefinition?.canBeParent) {
            return
        }

        // Move component
        const moveComponent = (comps: Component[]): Component[] => {
            let draggedComp: Component | null = null
            
            // Remove dragged component
            const removeFromComponents = (list: Component[]): Component[] =>
                list.filter(comp => {
                    if (comp.id === draggedId) {
                        draggedComp = comp
                        return false
                    }
                    comp.children = removeFromComponents(comp.children)
                    return true
                })
            
            const result = removeFromComponents(comps)
            
            // Add to target
            if (draggedComp) {
                const addToTarget = (list: Component[]): Component[] =>
                    list.map(comp => 
                        comp.id === targetId
                            ? { ...comp, children: [...comp.children, draggedComp!] }
                            : { ...comp, children: addToTarget(comp.children) }
                    )
                return addToTarget(result)
            }
            
            return result
        }

        setComponents(moveComponent)
        setDraggedId(null)
    }

    // Render component recursively
    const renderComponent = (comp: Component, depth = 0) => {
        const definition = snippetDefinitions[comp.type as keyof typeof snippetDefinitions]
        const canBeParent = definition?.canBeParent || false
        const isDragTarget = draggedId && canBeParent && draggedId !== comp.id
        
        return (
            <div
                key={comp.id}
                draggable
                onDragStart={e => handleDragStart(e, comp.id)}
                onDragOver={canBeParent ? handleDragOver : undefined}
                onDrop={canBeParent ? (e => handleDrop(e, comp.id)) : undefined}
                style={{
                    marginLeft: depth * 20,
                    padding: '12px',
                    margin: '8px 0',
                    border: isDragTarget ? '2px dashed #007bff' : '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: isDragTarget ? '#e3f2fd' : '#f8f9fa',
                    opacity: draggedId === comp.id ? 0.5 : 1,
                    cursor: 'move'
                }}
            >
                <h4 style={{ margin: '0 0 8px 0' }}>{comp.type}</h4>
                
                {definition?.attributes && (
                    <details style={{ marginBottom: '8px' }}>
                        <summary style={{ 
                            cursor: 'pointer', 
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            userSelect: 'none'
                        }}>
                            Attributes ({Object.keys(definition.attributes).length})
                        </summary>
                        
                        {Object.entries(definition.attributes).map(([key, config]) => {
                            const attrConfig = typeof config === 'object' ? config : { type: 'text', value: '' }
                            const currentValue = comp.attributes[key] || ''
                            
                            return (
                                <div key={key} style={{ marginBottom: '8px', marginLeft: '16px' }}>
                                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                                        {key}:
                                    </label>
                                    {attrConfig.type === 'checkbox' ? (
                                        <input
                                            type="checkbox"
                                            checked={currentValue === true || currentValue === 'true'}
                                            onChange={e => updateAttribute(comp.id, key, e.target.checked)}
                                        />
                                    ) : attrConfig.type === 'textarea' ? (
                                        <textarea
                                            value={currentValue}
                                            onChange={e => updateAttribute(comp.id, key, e.target.value)}
                                            rows={3}
                                            style={{ width: '100%', fontSize: '12px' }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={currentValue}
                                            onChange={e => updateAttribute(comp.id, key, e.target.value)}
                                            style={{ width: '100%', fontSize: '12px' }}
                                        />
                                    )}
                                </div>
                            )
                        })}
                    </details>
                )}
                
                {comp.children.map(child => renderComponent(child, depth + 1))}
            </div>
        )
    }

    return (
        <div className="mainCanvas">
            <div style={{ padding: '20px' }}>
                <h2 style={{ margin: '0 0 20px 0' }}>Astro Editor</h2>
                
                <div>
                    <h3>Components ({components.length})</h3>
                    {components.length === 0 ? (
                        <p>No components loaded. Add components from sidebar or load from extension.</p>
                    ) : (
                        components.map(comp => renderComponent(comp))
                    )}
                </div>
            </div>
        </div>
    )
}