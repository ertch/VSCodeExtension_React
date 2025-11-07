import { TreeNode } from '../types/canvas';

// ID Generator
export const genId = () => "n_" + Math.random().toString(36).slice(2) + Date.now().toString(36);

// Deep Clone
export function cloneDeep<T>(o: T): T {
  return JSON.parse(JSON.stringify(o));
}

// Find Node and Parent in Tree
export function findNodeAndParent(
  tree: TreeNode[],
  id: string,
  parent: TreeNode | null = null
): { node: TreeNode; parent: TreeNode | null; index: number } | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) return { node, parent, index: i };
    const found = findNodeAndParent(node.children || [], id, node);
    if (found) return found;
  }
  return null;
}

// Remove Node from Tree
export function removeNode(tree: TreeNode[], id: string): TreeNode | null {
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

// Check if Node is Descendant
export function isDescendant(tree: TreeNode[], maybeChildId: string, ancestorId: string): boolean {
  const found = findNodeAndParent(tree, ancestorId, null);
  if (!found) return false;
  const stack = [...(found.node.children || [])];
  while (stack.length) {
    const n = stack.pop();
    if (n && n.id === maybeChildId) return true;
    if (n?.children?.length) stack.push(...n.children);
  }
  return false;
}

// Insert Node into Tree at Target Position
export function insertNode(
  tree: TreeNode[],
  targetId: string | null,
  zone: 'above' | 'below' | 'inside',
  nodeToInsert: TreeNode
): void {
  // Root-level insertion
  if (!targetId) {
    tree.push(nodeToInsert);
    return;
  }

  const found = findNodeAndParent(tree, targetId);
  if (!found) return;

  // Inside insertion (if target can have children)
  if (zone === 'inside' && found.node.canHaveChildren) {
    found.node.children = found.node.children || [];
    found.node.children.push(nodeToInsert);
    return;
  }

  // Above/Below insertion
  const parent = found.parent;
  const insertIndex = zone === 'above' ? found.index : found.index + 1;

  if (!parent) {
    // Insert at root level
    tree.splice(insertIndex, 0, nodeToInsert);
  } else {
    // Insert as sibling
    const list = parent.children || [];
    list.splice(insertIndex, 0, nodeToInsert);
    parent.children = list;
  }
}
