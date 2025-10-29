/**
 * Drag and Drop Hook
 * Verwaltet DnD State und Logik
 */

import { useState, useCallback, useEffect } from 'react';
import {
  cloneDeep,
  createNode,
  removeNode,
  findNodeAndParent,
  isDescendant,
  insertSibling,
  insertChild,
  exceedsMaxDepth,
} from '../utils/treeHelpers';

export function useDragAndDrop(tree, setTree, paletteMap) {
  const [dragging, setDragging] = useState(null);
  // dragging: { kind: 'NEW', type } | { kind: 'MOVE', nodeId }

  const [hover, setHover] = useState({ targetId: null, zone: null });
  // zone: 'above' | 'inside' | 'below'

  // Cleanup hover on drag end
  useEffect(() => {
    const clearHover = () => {
      setHover({ targetId: null, zone: null });
      setDragging(null);
    };

    window.addEventListener('dragend', clearHover);
    window.addEventListener('drop', clearHover);

    return () => {
      window.removeEventListener('dragend', clearHover);
      window.removeEventListener('drop', clearHover);
    };
  }, []);

  /**
   * Start: Neue Komponente aus Palette ziehen
   */
  const handlePaletteDragStart = useCallback((e, type) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      'application/x-canvas',
      JSON.stringify({ kind: 'NEW', type })
    );
    setDragging({ kind: 'NEW', type });
    console.log('Palette drag start:', type);
  }, []);

  /**
   * Start: Bestehenden Node verschieben
   */
  const handleNodeDragStart = useCallback((e, nodeId) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/x-canvas',
      JSON.stringify({ kind: 'MOVE', nodeId })
    );
    setDragging({ kind: 'MOVE', nodeId });
    console.log('Node drag start:', nodeId);
  }, []);

  /**
   * Berechnet Drop-Zone (above/inside/below)
   */
  const computeZone = useCallback((e, targetNode) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const h = rect.height || 1;

    const topBand = h * 0.3;
    const bottomBand = h * 0.3;

    if (y <= topBand) return 'above';
    if (y >= h - bottomBand) return 'below';

    // Middle area: inside if canBeParent, else above/below
    if (targetNode?.children !== undefined) {
      return 'inside';
    }
    return y < h / 2 ? 'above' : 'below';
  }, []);

  /**
   * Führt Drop-Operation aus
   */
  const performDrop = useCallback(
    ({ dropTargetId, zone, payload }) => {
      if (!payload) {
        console.warn('performDrop: no payload');
        return;
      }

      let nextTree = cloneDeep(tree);

      // ===== NEW COMPONENT =====
      if (payload.kind === 'NEW') {
        const newNode = createNode(payload.type, paletteMap);
        if (!newNode) {
          console.error('Failed to create node:', payload.type);
          alert(`Fehler: Komponente "${payload.type}" konnte nicht erstellt werden.`);
          return;
        }

        // Drop at root
        if (!dropTargetId) {
          nextTree.push(newNode);
          setTree(nextTree);
          console.log('Dropped new node at root:', newNode);
          return;
        }

        // Find target
        const found = findNodeAndParent(nextTree, dropTargetId);
        if (!found) {
          console.error('Target not found:', dropTargetId);
          return;
        }

        // Check max depth
        if (exceedsMaxDepth(nextTree, dropTargetId, 4)) {
          alert('Maximale Verschachtelungstiefe erreicht (5 Ebenen)!');
          return;
        }

        // Insert
        if (zone === 'inside' && found.node.children !== undefined) {
          insertChild(found.node, newNode);
        } else {
          insertSibling(nextTree, found, newNode, zone);
        }

        setTree(nextTree);
        console.log('Dropped new node:', newNode);
      }
      // ===== MOVE EXISTING =====
      else if (payload.kind === 'MOVE') {
        const movingId = payload.nodeId;

        // Validation: Can't drop on self
        if (movingId === dropTargetId) {
          console.warn('Cannot drop node on itself');
          return;
        }

        // Validation: Can't drop on descendant (circular)
        if (dropTargetId && isDescendant(nextTree, dropTargetId, movingId)) {
          console.warn('Cannot drop parent into child (circular dependency)');
          alert('Parent-Komponente kann nicht in eigenes Child verschoben werden!');
          return;
        }

        // Remove from old position
        const movingNode = removeNode(nextTree, movingId);
        if (!movingNode) {
          console.error('Moving node not found:', movingId);
          return;
        }

        // Drop at root
        if (!dropTargetId) {
          nextTree.push(movingNode);
          setTree(nextTree);
          console.log('Moved node to root:', movingNode);
          return;
        }

        // Find target
        const found = findNodeAndParent(nextTree, dropTargetId);
        if (!found) {
          console.error('Target not found:', dropTargetId);
          return;
        }

        // Check max depth
        if (exceedsMaxDepth(nextTree, dropTargetId, 4)) {
          alert('Maximale Verschachtelungstiefe erreicht (5 Ebenen)!');
          return;
        }

        // Insert
        if (zone === 'inside' && found.node.children !== undefined) {
          insertChild(found.node, movingNode);
        } else {
          insertSibling(nextTree, found, movingNode, zone);
        }

        setTree(nextTree);
        console.log('Moved node:', movingNode);
      }
    },
    [tree, setTree, paletteMap]
  );

  return {
    dragging,
    hover,
    setHover,
    handlePaletteDragStart,
    handleNodeDragStart,
    computeZone,
    performDrop,
  };
}
