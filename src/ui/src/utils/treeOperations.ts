export interface Component {
  id: string
  type: string
  attributes: Record<string, any>
  children: Component[]
}

export type DropPos = 'before' | 'inside' | 'after'
export type DropTargetId = string | 'ROOT'

export interface DropIndicator {
  targetId: DropTargetId
  position: DropPos
}

/**
 * Finds a component by ID in the tree structure
 */
export const findById = (nodes: Component[], id: string): Component | null => {
  for (const n of nodes) {
    if (n.id === id) return n
    const found = findById(n.children, id)
    if (found) return found
  }
  return null
}

/**
 * Checks if a node contains a specific ID in its subtree
 */
export const containsId = (node: Component, targetId: string): boolean => {
  if (node.id === targetId) return true
  for (const c of node.children) {
    if (containsId(c, targetId)) return true
  }
  return false
}

/**
 * Finds the parent ID and index of a specific node
 * Returns parentId (null = Root) + Index of the node
 */
export const findParentAndIndex = (
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

/**
 * Removes a node by ID and returns the new tree + removed node
 */
export const removeById = (
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

/**
 * Inserts a child at a specific position
 * parentId null -> Root level
 */
export const insertAt = (
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

/**
 * Checks if moving a source to target would create a cycle
 */
export const wouldCreateCycle = (
  nodes: Component[], 
  sourceId: string, 
  targetId: DropTargetId
): boolean => {
  if (targetId === 'ROOT') return false
  const sourceNode = findById(nodes, sourceId)
  if (!sourceNode) return false
  return containsId(sourceNode, targetId)
}

/**
 * Atomic move operation: Only applies if source + target are valid
 */
export const moveNode = (
  nodes: Component[],
  sourceId: string,
  drop: DropIndicator,
  componentsLength: number
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
    destIndex = drop.position === 'before' ? 0 : componentsLength
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

/**
 * Updates an attribute for a specific component
 */
export const updateAttribute = (
  nodes: Component[], 
  id: string, 
  key: string, 
  value: any
): Component[] => {
  const update = (nodeList: Component[]): Component[] =>
    nodeList.map(n =>
      n.id === id
        ? { ...n, attributes: { ...n.attributes, [key]: value } }
        : { ...n, children: update(n.children) }
    )
  return update(nodes)
}