/**
 * Tree Helper Functions
 * Pure functions for tree manipulation (CRUD operations)
 */

// ============================================================================
// ID GENERATION
// ============================================================================

/**
 * Generiert eine unique ID für Nodes
 */
export function genId() {
  return 'node_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================================================
// TREE TRAVERSAL
// ============================================================================

/**
 * Findet einen Node und seinen Parent im Tree
 * @returns {object|null} { node, parent, index } oder null
 */
export function findNodeAndParent(tree, id, parent = null) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      return { node, parent, index: i };
    }
    const found = findNodeAndParent(node.children || [], id, node);
    if (found) return found;
  }
  return null;
}

/**
 * Prüft ob childId ein Descendant von ancestorId ist
 */
export function isDescendant(tree, childId, ancestorId) {
  const found = findNodeAndParent(tree, ancestorId);
  if (!found) return false;

  const stack = [...(found.node.children || [])];
  while (stack.length) {
    const n = stack.pop();
    if (n.id === childId) return true;
    if (n.children?.length) stack.push(...n.children);
  }
  return false;
}

/**
 * Zählt die Nesting-Tiefe eines Nodes
 */
export function getDepth(tree, nodeId, currentDepth = 0) {
  for (const node of tree) {
    if (node.id === nodeId) {
      return currentDepth;
    }
    if (node.children?.length) {
      const depth = getDepth(node.children, nodeId, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
}

/**
 * Prüft ob Nesting-Limit erreicht ist
 */
export function exceedsMaxDepth(tree, nodeId, maxDepth = 5) {
  const depth = getDepth(tree, nodeId);
  return depth >= maxDepth;
}

// ============================================================================
// TREE MANIPULATION
// ============================================================================

/**
 * Deep Clone eines Objects (einfache JSON-Variante)
 */
export function cloneDeep(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Erstellt einen neuen Node
 */
export function createNode(type, paletteMap) {
  const meta = paletteMap.get ? paletteMap.get(type) : paletteMap[type];
  if (!meta) return null;

  return {
    id: genId(),
    type: meta.type,
    props: { ...(meta.defaultProps || {}) },
    children: meta.canBeParent ? [] : undefined,
    codeGen: meta.codeGen || { component: meta.type },
  };
}

/**
 * Entfernt einen Node aus dem Tree
 * @returns {object|null} Der entfernte Node oder null
 */
export function removeNode(tree, id) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      const [removed] = tree.splice(i, 1);
      return removed;
    }
    const removedChild = removeNode(node.children || [], id);
    if (removedChild) return removedChild;
  }
  return null;
}

/**
 * Fügt einen Node als Sibling ein
 */
export function insertSibling(tree, targetFound, newNode, zone) {
  const parent = targetFound.parent;
  const insertIndex = zone === 'above' ? targetFound.index : targetFound.index + 1;

  if (!parent) {
    // Insert at root level
    tree.splice(insertIndex, 0, newNode);
  } else {
    // Insert in parent's children
    const list = parent.children || [];
    list.splice(insertIndex, 0, newNode);
    parent.children = list;
  }
}

/**
 * Fügt einen Node als Child ein
 */
export function insertChild(node, newNode) {
  if (!node.children) {
    node.children = [];
  }
  node.children.push(newNode);
}

// ============================================================================
// TREE VALIDATION
// ============================================================================

/**
 * Validiert den gesamten Tree
 */
export function validateTree(tree) {
  if (!Array.isArray(tree)) return false;

  const seenIds = new Set();

  function validateNode(node) {
    // Check structure
    if (!node || typeof node !== 'object') return false;
    if (!node.id || !node.type) return false;

    // Check for duplicate IDs
    if (seenIds.has(node.id)) {
      console.error('Duplicate ID found:', node.id);
      return false;
    }
    seenIds.add(node.id);

    // Check children
    if (!Array.isArray(node.children)) return false;

    // Recursive validation
    return node.children.every(validateNode);
  }

  return tree.every(validateNode);
}
