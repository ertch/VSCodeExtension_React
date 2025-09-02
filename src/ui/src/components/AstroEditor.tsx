import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { 
  Component, 
  DropIndicator, 
  moveNode, 
  updateAttribute 
} from '../utils/treeOperations'
import { 
  createDragDropHandlers, 
  getDropIndicatorStyles, 
  getRootDropIndicatorStyles 
} from '../utils/dragDropUtils'
import { extractAttributes } from '../utils/attributeExtraction'
import { generateAstroCode } from '../utils/astroCodeGenerator'
import { getDefinition, createComponent } from '../utils/componentManagement'

export default function AstroEditor() {
  const [components, setComponents] = useState<Component[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null)
  const componentsRef = useRef<Component[]>(components)
  const listRef = useRef<HTMLDivElement | null>(null)

  const dragDropState = { draggedId, dropIndicator }

  useEffect(() => {
    componentsRef.current = components
  }, [components])

  // Message handling
  const addComponent = (type: string, overrides: Record<string, any> = {}) => {
    const newComponent = createComponent(type, overrides)
    setComponents(prev => [...prev, newComponent])
  }

  // Einmaliger Message-Listener (keine Abhängigkeit zu components)
  useEffect(() => {
    const handleMessage = (event: MessageEvent<any>) => {
      const { command, tool, content, components: incomingComponents } = event.data || {}
      switch (command) {
        case 'insertSnippet':
          addComponent(tool, extractAttributes(content))
          break
        case 'loadComponents':
          setComponents(Array.isArray(incomingComponents) ? incomingComponents : [])
          break
        case 'loadComponentHierarchy':
          // New: Load complete hierarchy with nesting
          setComponents(Array.isArray(incomingComponents) ? incomingComponents : [])
          break
        case 'addComponent':
          addComponent(tool)
          break
        case 'generateCode': {
          const code = generateAstroCode(componentsRef.current)
          navigator.clipboard?.writeText(code).catch(() => {})
          window.parent.postMessage({ command: 'codeGenerated', code }, '*')
          break
        }
        case 'clearAll':
          setComponents([])
          break
        default:
          break
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Create drag and drop handlers
  const handleDrop = (draggedId: string, dropIndicator: DropIndicator) => {
    setComponents(prev => moveNode(prev, draggedId, dropIndicator, prev.length))
  }

  const dragDropHandlers = createDragDropHandlers(
    dragDropState,
    setDraggedId,
    setDropIndicator,
    handleDrop,
    components
  )

  // Attribute update handler
  const handleUpdateAttribute = (id: string, key: string, value: any) => {
    setComponents(prev => updateAttribute(prev, id, key, value))
  }



  // ---- Render ----
  const renderNode = (comp: Component, depth = 0) => {
    const definition = getDefinition(comp.type)
    const canBeParent = !!definition?.canBeParent
    const dropStyles = getDropIndicatorStyles(comp, dropIndicator, draggedId)

    return (
      <div
        key={comp.id}
        draggable
        onDragStart={e => dragDropHandlers.handleDragStart(e, comp.id)}
        onDragOver={e => dragDropHandlers.handleNodeDragOver(e, comp, canBeParent)}
        onDrop={dragDropHandlers.handleDrop}
        onDragEnd={dragDropHandlers.handleDragEnd}
        style={{
          position: 'relative',
          marginLeft: depth * 20,
          padding: '12px',
          margin: '8px 0',
          border: '1px solid #ddd',
          borderRadius: '6px',
          cursor: 'move',
          ...dropStyles,
        }}
      >
        <h4 style={{ margin: '0 0 8px 0' }}>{comp.type}</h4>

        {definition?.attributes && (
          <details style={{ marginBottom: '8px' }}>
            <summary
              style={{
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 'bold',
                marginBottom: '8px',
                userSelect: 'none',
              }}
            >
              Attributes ({Object.keys(definition.attributes).length})
            </summary>

            {Object.entries(definition.attributes).map(([key, config]) => {
              const attrConfig =
                typeof config === 'object' ? (config as any) : { type: 'text', value: '' }
              const currentValue = comp.attributes[key] ?? ''

              return (
                <div key={key} style={{ marginBottom: '8px', marginLeft: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>
                    {key}:
                  </label>

                  {attrConfig.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      checked={currentValue === true || currentValue === 'true'}
                      onChange={e => handleUpdateAttribute(comp.id, key, e.target.checked)}
                    />
                  ) : attrConfig.type === 'textarea' ? (
                    <textarea
                      value={currentValue}
                      onChange={e => handleUpdateAttribute(comp.id, key, e.target.value)}
                      rows={3}
                      style={{ width: '100%', fontSize: '12px' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={currentValue}
                      onChange={e => handleUpdateAttribute(comp.id, key, e.target.value)}
                      style={{ width: '100%', fontSize: '12px' }}
                    />
                  )}
                </div>
              )
            })}
          </details>
        )}

        {comp.children.map(child => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="mainCanvas">
      <div style={{ padding: '20px' }}>
        <h2 style={{ margin: '0 0 20px 0' }}>TT Editor</h2>

        <div
          ref={listRef}
          onDragOver={e => dragDropHandlers.handleRootDragOver(e, listRef, components.length)}
          onDrop={dragDropHandlers.handleDrop}
          onDragEnd={dragDropHandlers.handleDragEnd}
          style={{
            minHeight: 80,
            border: components.length === 0 ? '2px dashed #bbb' : undefined,
            padding: 8,
            ...getRootDropIndicatorStyles(dropIndicator, components.length),
          }}
        >
          <h3>Components ({components.length})</h3>

          {components.length === 0 ? (
            <p>Ziehe ein Element hierher oder füge eines über die Sidebar hinzu.</p>
          ) : (
            components.map(comp => renderNode(comp))
          )}
        </div>
      </div>
    </div>
  )
}