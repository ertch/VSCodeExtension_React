import * as React from 'react'
import { useEffect, useRef, useState } from 'react'
import { snippetDefinitions } from '../../../snippetDefinitions'

interface Component {
  id: string
  type: string
  attributes: Record<string, any>
  children: Component[]
}

type DropPos = 'before' | 'inside' | 'after'
type DropTargetId = string | 'ROOT'
interface DropIndicator {
  targetId: DropTargetId
  position: DropPos
}

export default function AstroEditor() {
  const [components, setComponents] = useState<Component[]>([])
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dropIndicator, setDropIndicator] = useState<DropIndicator | null>(null)
  const componentsRef = useRef<Component[]>(components)
  const listRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    componentsRef.current = components
  }, [components])

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

  // ---- snippet defs helpers ----
  const getDefinition = (type: string) =>
    snippetDefinitions[type as keyof typeof snippetDefinitions] as any

  const defaultsForType = (type: string): Record<string, any> => {
    const def = getDefinition(type)
    const out: Record<string, any> = {}
    if (def?.attributes) {
      for (const [key, config] of Object.entries(def.attributes)) {
        if (config && typeof config === 'object' && 'value' in config) {
          out[key] = (config as any).value ?? ''
        } else {
          out[key] = ''
        }
      }
    }
    return out
  }

  const addComponent = (type: string, overrides: Record<string, any> = {}) => {
    const attributes = { ...defaultsForType(type), ...overrides }
    const newComponent: Component = {
      id: generateId(),
      type,
      attributes,
      children: [],
    }
    setComponents(prev => [...prev, newComponent])
  }

  // ---- util: ids, parsing, tree ops ----
  const generateId = () =>
    Date.now().toString() + Math.random().toString(36).substring(2, 11)

  // Sichere Extraktion aus <script>let values={...};</script>
  const extractAttributes = (content: string): Record<string, any> => {
    try {
      if (!content) return {}
      const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
      if (!scriptMatch) return {}
      const scriptContent = scriptMatch[1]
      const valuesMatch = scriptContent.match(/let\s+values\s*=\s*({[\s\S]*?});/)
      if (!valuesMatch) return {}

      const valuesStr = valuesMatch[1]
      const parsed = new Function(`"use strict"; return (${valuesStr});`)() as Record<string, any>

      const cleaned: Record<string, any> = {}
      for (const [k, v] of Object.entries(parsed)) {
        if (v !== '' && v !== undefined && v !== null) {
          cleaned[k] = v === 'true' ? true : v === 'false' ? false : v
        }
      }
      return cleaned
    } catch {
      return {}
    }
  }

  const findById = (nodes: Component[], id: string): Component | null => {
    for (const n of nodes) {
      if (n.id === id) return n
      const found = findById(n.children, id)
      if (found) return found
    }
    return null
  }

  const containsId = (node: Component, targetId: string): boolean => {
    if (node.id === targetId) return true
    for (const c of node.children) {
      if (containsId(c, targetId)) return true
    }
    return false
  }

  // Liefert parentId (null = Root) + Index eines Knotens
  const findParentAndIndex = (
    nodes: Component[],
    id: string,
    parentId: string | null = null
  ): { parentId: string | null; index: number } | null => {
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i]
      if (n.id === id) return { parentId, index: i }
      const sub = findParentAndIndex(n.children, id, n.id)
      if (sub) return sub
    }
    return null
  }

  // Entfernt Knoten; gibt neuen Baum + entfernten Knoten
  const removeById = (
    nodes: Component[],
    id: string
  ): { nodes: Component[]; removed: Component | null } => {
    const next: Component[] = []
    let removed: Component | null = null

    for (const n of nodes) {
      if (n.id === id) {
        removed = n
        continue
      }
      const res = removeById(n.children, id)
      if (res.removed && !removed) removed = res.removed
      next.push({ ...n, children: res.nodes })
    }
    return { nodes: next, removed }
  }

  // Fügt child bei parentId an Index ein (parentId null -> Root)
  const insertAt = (
    nodes: Component[],
    parentId: string | null,
    index: number,
    child: Component
  ): Component[] => {
    if (parentId === null) {
      const i = Math.max(0, Math.min(index, nodes.length))
      return [...nodes.slice(0, i), child, ...nodes.slice(i)]
    }
    return nodes.map(n =>
      n.id === parentId
        ? {
            ...n,
            children: [
              ...n.children.slice(0, Math.max(0, Math.min(index, n.children.length))),
              child,
              ...n.children.slice(Math.max(0, Math.min(index, n.children.length))),
            ],
          }
        : { ...n, children: insertAt(n.children, parentId, index, child) }
    )
  }

  // Ist Ziel im eigenen Subtree? -> verbieten (verhindert Zyklen/Löschung)
  const wouldCreateCycle = (nodes: Component[], sourceId: string, targetId: DropTargetId) => {
    if (targetId === 'ROOT') return false
    const sourceNode = findById(nodes, sourceId)
    if (!sourceNode) return false
    return containsId(sourceNode, targetId)
  }

  // Atomares Move: Nur wenn Quelle + Ziel valide → anwenden, sonst unverändert lassen
  const moveNode = (
    nodes: Component[],
    sourceId: string,
    drop: DropIndicator
  ): Component[] => {
    if (!drop) return nodes
    if (drop.targetId !== 'ROOT' && sourceId === drop.targetId) return nodes
    if (wouldCreateCycle(nodes, sourceId, drop.targetId)) return nodes

    const srcInfo = findParentAndIndex(nodes, sourceId)
    if (!srcInfo) return nodes

    let destParentId: string | null
    let destIndex: number

    if (drop.targetId === 'ROOT') {
      destParentId = null
      destIndex = drop.position === 'before' ? 0 : componentsRef.current.length
    } else {
      const target = findById(nodes, drop.targetId)
      if (!target) return nodes

      if (drop.position === 'inside') {
        destParentId = target.id
        destIndex = target.children.length
      } else {
        const tInfo = findParentAndIndex(nodes, target.id)
        if (!tInfo) return nodes
        destParentId = tInfo.parentId
        destIndex = tInfo.index + (drop.position === 'after' ? 1 : 0)

        // Reordering im selben Parent korrigieren (Index verschiebt sich nach Remove)
        if (destParentId === srcInfo.parentId && srcInfo.index < destIndex) {
          destIndex -= 1
        }
      }
    }

    // Entfernen + Einfügen (Rollback bei Problemen)
    const { nodes: without, removed } = removeById(nodes, sourceId)
    if (!removed) return nodes

    // Extra-Schutz: nicht in eigenen (jetzt entfernten) Subtree einfügen
    if (drop.targetId !== 'ROOT') {
      // Wenn Ziel unterhalb der entfernten Quelle lag, existiert es nach removeById nicht mehr
      const targetStillExists = !!findById(
        drop.position === 'inside' ? without : without, // gleicher Baum
        drop.targetId
      )
      if (!targetStillExists && drop.targetId !== 'ROOT') {
        return nodes // Rollback
      }
    }

    return insertAt(without, destParentId, destIndex, removed)
  }

  const updateAttribute = (id: string, key: string, value: any) => {
    const update = (nodes: Component[]): Component[] =>
      nodes.map(n =>
        n.id === id
          ? { ...n, attributes: { ...n.attributes, [key]: value } }
          : { ...n, children: update(n.children) }
      )
    setComponents(update)
  }

  const generateAstroCode = (nodes: Component[]) => {
    const render = (comp: Component, depth = 0): string => {
      const indent = '  '.repeat(depth)
      const attrs = Object.entries(comp.attributes)
        .filter(([, v]) => v !== '' && v !== false && v !== undefined && v !== null)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ')
      const opening = `${indent}<${comp.type}${attrs ? ' ' + attrs : ''}>`
      if (!comp.children.length) return `${opening}</${comp.type}>`
      const children = comp.children.map(c => render(c, depth + 1)).join('\n')
      return `${opening}\n${children}\n${indent}</${comp.type}>`
    }
    return nodes.map(n => render(n)).join('\n\n')
  }

  // ---- Drag & Drop ----
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    setDropIndicator(null)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: eigenes Drag-Image vermeiden, damit die Karte sichtbar bleibt
    // e.dataTransfer.setDragImage(new Image(), 0, 0)
  }

  const computeNodeDropPos = (
    e: React.DragEvent,
    comp: Component,
    canBeParent: boolean
  ): DropPos => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const third = rect.height / 3
    if (offsetY < third) return 'before'
    if (offsetY > 2 * third) return 'after'
    return canBeParent ? 'inside' : offsetY < rect.height / 2 ? 'before' : 'after'
  }

  const handleNodeDragOver = (e: React.DragEvent, comp: Component) => {
    if (!draggedId) return
    e.preventDefault()
    e.stopPropagation()

    const canBeParent = !!getDefinition(comp.type)?.canBeParent
    const pos = computeNodeDropPos(e, comp, canBeParent)

    const invalid =
      draggedId === comp.id || wouldCreateCycle(componentsRef.current, draggedId, comp.id)

    e.dataTransfer.dropEffect = invalid ? 'none' : 'move'
    setDropIndicator({ targetId: comp.id, position: pos })
  }

  const handleRootDragOver = (e: React.DragEvent) => {
    if (!draggedId) return
    if (!listRef.current) return
    e.preventDefault()

    const rect = listRef.current.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const pos: DropPos = offsetY < rect.height / 2 ? 'before' : 'after'
    e.dataTransfer.dropEffect = 'move'
    setDropIndicator({ targetId: 'ROOT', position: pos })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedId || !dropIndicator) {
      setDraggedId(null)
      setDropIndicator(null)
      return
    }
    setComponents(prev => moveNode(prev, draggedId, dropIndicator))
    setDraggedId(null)
    setDropIndicator(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDropIndicator(null)
  }

  // ---- Render ----
  const renderNode = (comp: Component, depth = 0) => {
    const definition = getDefinition(comp.type)
    const canBeParent = !!definition?.canBeParent

    const isBefore = dropIndicator?.targetId === comp.id && dropIndicator.position === 'before'
    const isInside = dropIndicator?.targetId === comp.id && dropIndicator.position === 'inside'
    const isAfter = dropIndicator?.targetId === comp.id && dropIndicator.position === 'after'

    return (
      <div
        key={comp.id}
        draggable
        onDragStart={e => handleDragStart(e, comp.id)}
        onDragOver={e => handleNodeDragOver(e, comp)}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        style={{
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
          onDragOver={handleRootDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          style={{
            minHeight: 80,
            border: components.length === 0 ? '2px dashed #bbb' : undefined,
            padding: 8,
            // Root-Drop-Indikator
            boxShadow:
              dropIndicator?.targetId === 'ROOT'
                ? dropIndicator.position === 'before'
                  ? 'inset 0 3px 0 0 #1976d2'
                  : 'inset 0 -3px 0 0 #1976d2'
                : undefined,
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