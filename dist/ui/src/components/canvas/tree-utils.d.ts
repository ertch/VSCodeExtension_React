import { TreeNode } from '../../utils/types/canvas';
export declare const genId: () => string;
export declare function cloneDeep<T>(o: T): T;
export declare function findNodeAndParent(tree: TreeNode[], id: string, parent?: TreeNode | null): {
    node: TreeNode;
    parent: TreeNode | null;
    index: number;
} | null;
export declare function removeNode(tree: TreeNode[], id: string): TreeNode | null;
export declare function isDescendant(tree: TreeNode[], maybeChildId: string, ancestorId: string): boolean;
export declare function insertNode(tree: TreeNode[], targetId: string | null, zone: 'above' | 'below' | 'inside', nodeToInsert: TreeNode): void;
//# sourceMappingURL=tree-utils.d.ts.map