import { TreeNode } from '../../utils/types/canvas';

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
