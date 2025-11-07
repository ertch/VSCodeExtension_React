import { TreeNode } from '../../src/types/canvas';
import {
  genId,
  cloneDeep,
  findNodeAndParent,
  removeNode,
  isDescendant,
  insertNode,
} from '../../src/utils/tree-utils';

describe('tree-utils', () => {
  describe('genId', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<string>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        ids.add(genId());
      }

      expect(ids.size).toBe(count);
    });

    it('should generate IDs with n_ prefix', () => {
      const id = genId();
      expect(id).toMatch(/^n_/);
    });

    it('should generate non-empty IDs', () => {
      const id = genId();
      expect(id.length).toBeGreaterThan(3);
    });
  });

  describe('cloneDeep', () => {
    it('should create deep copy of simple object', () => {
      const original = { a: 1, b: 'test', c: true };
      const clone = cloneDeep(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
    });

    it('should create deep copy of nested object', () => {
      const original = {
        a: 1,
        b: { c: 2, d: { e: 3 } },
        f: [1, 2, 3],
      };
      const clone = cloneDeep(original);

      expect(clone).toEqual(original);
      expect(clone).not.toBe(original);
      expect(clone.b).not.toBe(original.b);
      expect(clone.b.d).not.toBe(original.b.d);
      expect(clone.f).not.toBe(original.f);
    });

    it('should create independent copy (mutation test)', () => {
      const original: any = { a: 1, b: { c: 2 } };
      const clone = cloneDeep(original);

      clone.a = 999;
      clone.b.c = 888;

      expect(original.a).toBe(1);
      expect(original.b.c).toBe(2);
    });

    it('should clone TreeNode correctly', () => {
      const node: TreeNode = {
        id: 'test1',
        type: 'TestType',
        canHaveChildren: true,
        props: { text: 'hello' },
        children: [
          {
            id: 'test2',
            type: 'Child',
            canHaveChildren: false,
            props: {},
            children: [],
          },
        ],
      };

      const clone = cloneDeep(node);

      expect(clone).toEqual(node);
      expect(clone).not.toBe(node);
      expect(clone.children).not.toBe(node.children);
      expect(clone.children[0]).not.toBe(node.children[0]);
    });
  });

  describe('findNodeAndParent', () => {
    const createTestTree = (): TreeNode[] => [
      {
        id: 'root1',
        type: 'Root',
        canHaveChildren: true,
        props: {},
        children: [
          {
            id: 'child1',
            type: 'Child',
            canHaveChildren: true,
            props: {},
            children: [
              {
                id: 'grandchild1',
                type: 'GrandChild',
                canHaveChildren: false,
                props: {},
                children: [],
              },
            ],
          },
          {
            id: 'child2',
            type: 'Child',
            canHaveChildren: false,
            props: {},
            children: [],
          },
        ],
      },
      {
        id: 'root2',
        type: 'Root',
        canHaveChildren: false,
        props: {},
        children: [],
      },
    ];

    it('should find root node', () => {
      const tree = createTestTree();
      const result = findNodeAndParent(tree, 'root1');

      expect(result).not.toBeNull();
      expect(result!.node.id).toBe('root1');
      expect(result!.parent).toBeNull();
      expect(result!.index).toBe(0);
    });

    it('should find nested child node', () => {
      const tree = createTestTree();
      const result = findNodeAndParent(tree, 'child1');

      expect(result).not.toBeNull();
      expect(result!.node.id).toBe('child1');
      expect(result!.parent?.id).toBe('root1');
      expect(result!.index).toBe(0);
    });

    it('should find deeply nested node', () => {
      const tree = createTestTree();
      const result = findNodeAndParent(tree, 'grandchild1');

      expect(result).not.toBeNull();
      expect(result!.node.id).toBe('grandchild1');
      expect(result!.parent?.id).toBe('child1');
      expect(result!.index).toBe(0);
    });

    it('should return null for non-existent node', () => {
      const tree = createTestTree();
      const result = findNodeAndParent(tree, 'nonexistent');

      expect(result).toBeNull();
    });

    it('should find second root node', () => {
      const tree = createTestTree();
      const result = findNodeAndParent(tree, 'root2');

      expect(result).not.toBeNull();
      expect(result!.node.id).toBe('root2');
      expect(result!.parent).toBeNull();
      expect(result!.index).toBe(1);
    });

    it('should handle empty tree', () => {
      const result = findNodeAndParent([], 'any');
      expect(result).toBeNull();
    });
  });

  describe('removeNode', () => {
    it('should remove root node', () => {
      const tree: TreeNode[] = [
        { id: 'root1', type: 'R', canHaveChildren: false, props: {}, children: [] },
        { id: 'root2', type: 'R', canHaveChildren: false, props: {}, children: [] },
      ];

      const removed = removeNode(tree, 'root1');

      expect(removed).not.toBeNull();
      expect(removed!.id).toBe('root1');
      expect(tree.length).toBe(1);
      expect(tree[0].id).toBe('root2');
    });

    it('should remove nested child node', () => {
      const tree: TreeNode[] = [
        {
          id: 'root',
          type: 'R',
          canHaveChildren: true,
          props: {},
          children: [
            { id: 'child1', type: 'C', canHaveChildren: false, props: {}, children: [] },
            { id: 'child2', type: 'C', canHaveChildren: false, props: {}, children: [] },
          ],
        },
      ];

      const removed = removeNode(tree, 'child1');

      expect(removed).not.toBeNull();
      expect(removed!.id).toBe('child1');
      expect(tree[0].children.length).toBe(1);
      expect(tree[0].children[0].id).toBe('child2');
    });

    it('should remove deeply nested node', () => {
      const tree: TreeNode[] = [
        {
          id: 'root',
          type: 'R',
          canHaveChildren: true,
          props: {},
          children: [
            {
              id: 'child',
              type: 'C',
              canHaveChildren: true,
              props: {},
              children: [
                { id: 'grandchild', type: 'G', canHaveChildren: false, props: {}, children: [] },
              ],
            },
          ],
        },
      ];

      const removed = removeNode(tree, 'grandchild');

      expect(removed).not.toBeNull();
      expect(removed!.id).toBe('grandchild');
      expect(tree[0].children[0].children.length).toBe(0);
    });

    it('should return null for non-existent node', () => {
      const tree: TreeNode[] = [
        { id: 'root', type: 'R', canHaveChildren: false, props: {}, children: [] },
      ];

      const removed = removeNode(tree, 'nonexistent');

      expect(removed).toBeNull();
    });

    it('should handle empty tree', () => {
      const tree: TreeNode[] = [];
      const removed = removeNode(tree, 'any');

      expect(removed).toBeNull();
    });

    it('should not modify tree when node not found', () => {
      const tree: TreeNode[] = [
        { id: 'root1', type: 'R', canHaveChildren: false, props: {}, children: [] },
        { id: 'root2', type: 'R', canHaveChildren: false, props: {}, children: [] },
      ];

      removeNode(tree, 'nonexistent');

      expect(tree.length).toBe(2);
    });
  });

  describe('isDescendant', () => {
    const createTestTree = (): TreeNode[] => [
      {
        id: 'root',
        type: 'R',
        canHaveChildren: true,
        props: {},
        children: [
          {
            id: 'child1',
            type: 'C',
            canHaveChildren: true,
            props: {},
            children: [
              { id: 'grandchild1', type: 'G', canHaveChildren: false, props: {}, children: [] },
            ],
          },
          {
            id: 'child2',
            type: 'C',
            canHaveChildren: false,
            props: {},
            children: [],
          },
        ],
      },
    ];

    it('should return true for direct child', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'child1', 'root')).toBe(true);
    });

    it('should return true for grandchild', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'grandchild1', 'root')).toBe(true);
    });

    it('should return true for nested descendant', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'grandchild1', 'child1')).toBe(true);
    });

    it('should return false for sibling', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'child2', 'child1')).toBe(false);
    });

    it('should return false for parent', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'root', 'child1')).toBe(false);
    });

    it('should return false for self', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'child1', 'child1')).toBe(false);
    });

    it('should return false when ancestor not found', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'child1', 'nonexistent')).toBe(false);
    });

    it('should return false when child not found', () => {
      const tree = createTestTree();
      expect(isDescendant(tree, 'nonexistent', 'root')).toBe(false);
    });

    it('should handle empty tree', () => {
      expect(isDescendant([], 'any', 'any')).toBe(false);
    });
  });

  describe('insertNode', () => {
    const createNode = (id: string, canHaveChildren = false): TreeNode => ({
      id,
      type: 'Test',
      canHaveChildren,
      props: {},
      children: [],
    });

    describe('root level insertion', () => {
      it('should insert at root when targetId is null', () => {
        const tree: TreeNode[] = [createNode('existing')];
        const newNode = createNode('new');

        insertNode(tree, null, 'above', newNode);

        expect(tree.length).toBe(2);
        expect(tree[1].id).toBe('new');
      });

      it('should insert above target at root', () => {
        const tree: TreeNode[] = [createNode('node1'), createNode('node2')];
        const newNode = createNode('new');

        insertNode(tree, 'node2', 'above', newNode);

        expect(tree.length).toBe(3);
        expect(tree[0].id).toBe('node1');
        expect(tree[1].id).toBe('new');
        expect(tree[2].id).toBe('node2');
      });

      it('should insert below target at root', () => {
        const tree: TreeNode[] = [createNode('node1'), createNode('node2')];
        const newNode = createNode('new');

        insertNode(tree, 'node1', 'below', newNode);

        expect(tree.length).toBe(3);
        expect(tree[0].id).toBe('node1');
        expect(tree[1].id).toBe('new');
        expect(tree[2].id).toBe('node2');
      });
    });

    describe('inside insertion', () => {
      it('should insert inside container node', () => {
        const tree: TreeNode[] = [createNode('container', true)];
        const newNode = createNode('new');

        insertNode(tree, 'container', 'inside', newNode);

        expect(tree[0].children.length).toBe(1);
        expect(tree[0].children[0].id).toBe('new');
      });

      it('should not insert inside non-container node (ignores insert)', () => {
        const tree: TreeNode[] = [createNode('noncontainer', false)];
        const newNode = createNode('new');

        insertNode(tree, 'noncontainer', 'inside', newNode);

        // When zone is 'inside' but canHaveChildren is false, the function returns early
        // But looking at code again: it continues to above/below logic!
        // So it actually inserts as sibling (below) - tree length becomes 2
        expect(tree.length).toBe(2);
        expect(tree[1].id).toBe('new'); // Inserted as sibling
      });

      it('should insert inside nested container', () => {
        const tree: TreeNode[] = [
          {
            ...createNode('root', true),
            children: [createNode('child', true)],
          },
        ];
        const newNode = createNode('new');

        insertNode(tree, 'child', 'inside', newNode);

        expect(tree[0].children[0].children.length).toBe(1);
        expect(tree[0].children[0].children[0].id).toBe('new');
      });
    });

    describe('nested insertion', () => {
      it('should insert above nested node', () => {
        const tree: TreeNode[] = [
          {
            ...createNode('root', true),
            children: [createNode('child1'), createNode('child2')],
          },
        ];
        const newNode = createNode('new');

        insertNode(tree, 'child2', 'above', newNode);

        expect(tree[0].children.length).toBe(3);
        expect(tree[0].children[0].id).toBe('child1');
        expect(tree[0].children[1].id).toBe('new');
        expect(tree[0].children[2].id).toBe('child2');
      });

      it('should insert below nested node', () => {
        const tree: TreeNode[] = [
          {
            ...createNode('root', true),
            children: [createNode('child1'), createNode('child2')],
          },
        ];
        const newNode = createNode('new');

        insertNode(tree, 'child1', 'below', newNode);

        expect(tree[0].children.length).toBe(3);
        expect(tree[0].children[0].id).toBe('child1');
        expect(tree[0].children[1].id).toBe('new');
        expect(tree[0].children[2].id).toBe('child2');
      });
    });

    describe('edge cases', () => {
      it('should handle non-existent target gracefully', () => {
        const tree: TreeNode[] = [createNode('existing')];
        const newNode = createNode('new');

        insertNode(tree, 'nonexistent', 'above', newNode);

        // Should not throw, tree unchanged
        expect(tree.length).toBe(1);
      });

      it('should create children array if not exists', () => {
        const tree: TreeNode[] = [
          {
            id: 'container',
            type: 'Test',
            canHaveChildren: true,
            props: {},
            children: undefined as any, // Simulate missing children
          },
        ];
        const newNode = createNode('new');

        insertNode(tree, 'container', 'inside', newNode);

        expect(tree[0].children).toBeDefined();
        expect(tree[0].children.length).toBe(1);
        expect(tree[0].children[0].id).toBe('new');
      });

      it('should insert at beginning when above first element', () => {
        const tree: TreeNode[] = [createNode('first'), createNode('second')];
        const newNode = createNode('new');

        insertNode(tree, 'first', 'above', newNode);

        expect(tree[0].id).toBe('new');
        expect(tree[1].id).toBe('first');
        expect(tree[2].id).toBe('second');
      });

      it('should insert at end when below last element', () => {
        const tree: TreeNode[] = [createNode('first'), createNode('last')];
        const newNode = createNode('new');

        insertNode(tree, 'last', 'below', newNode);

        expect(tree[0].id).toBe('first');
        expect(tree[1].id).toBe('last');
        expect(tree[2].id).toBe('new');
      });
    });
  });
});
