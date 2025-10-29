/**
 * Tree Operations Hook
 * Verwaltet CRUD-Operationen auf dem Tree
 */

import { useCallback } from 'react';
import { cloneDeep, removeNode, createNode } from '../utils/treeHelpers';
import { serializeTree } from '../utils/domSerializer';

export function useTreeOperations(tree, setTree, formRef, paletteMap) {
  /**
   * Löscht einen Node
   */
  const handleDelete = useCallback(
    (nodeId) => {
      const nextTree = cloneDeep(tree);
      removeNode(nextTree, nodeId);
      setTree(nextTree);
      console.log('Deleted node:', nodeId);
    },
    [tree, setTree]
  );

  /**
   * Fügt Node am Ende des Root hinzu
   */
  const addNodeAtRoot = useCallback(
    (type) => {
      const node = createNode(type, paletteMap);
      if (!node) {
        console.error('Failed to create node for type:', type);
        return;
      }

      setTree((prev) => [...prev, node]);
      console.log('Added node to root:', node);
    },
    [setTree, paletteMap]
  );

  /**
   * Leert den gesamten Canvas
   */
  const clearCanvas = useCallback(() => {
    if (confirm('Canvas wirklich leeren? Alle Änderungen gehen verloren.')) {
      setTree([]);
      console.log('Canvas cleared');
    }
  }, [setTree]);

  /**
   * Serialisiert Canvas zu JSON
   */
  const serializeCanvas = useCallback(() => {
    const root = formRef.current;
    if (!root) {
      console.warn('formRef not available, returning raw tree');
      return tree;
    }

    const serialized = serializeTree(tree, root);
    console.log('Serialized tree:', serialized);
    return serialized;
  }, [tree, formRef]);

  /**
   * Aktualisiert Node-Properties
   */
  const updateNodeProps = useCallback(
    (nodeId, newProps) => {
      setTree((prevTree) => {
        const nextTree = cloneDeep(prevTree);

        function updateNode(nodes) {
          for (const node of nodes) {
            if (node.id === nodeId) {
              node.props = { ...node.props, ...newProps };
              return true;
            }
            if (node.children?.length && updateNode(node.children)) {
              return true;
            }
          }
          return false;
        }

        updateNode(nextTree);
        return nextTree;
      });

      console.log('Updated node props:', nodeId, newProps);
    },
    [setTree]
  );

  return {
    handleDelete,
    addNodeAtRoot,
    clearCanvas,
    serializeCanvas,
    updateNodeProps,
  };
}
