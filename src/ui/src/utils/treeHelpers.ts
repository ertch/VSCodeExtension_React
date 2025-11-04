// src/ui/src/utils/treeHelpers.ts

import type { ComponentNode } from '../../../shared/messageProtocol';
import type { ComponentPaletteEntry } from './componentPalette';
import { MAX_NESTING_LEVEL } from '../../../shared/constants';

// ============================================================================
// ID GENERATION
// ============================================================================

/**
 * Generiert eine eindeutige Node-ID
 *
 * FORMAT (DEUTSCH):
 * - Prefix: 'node_'
 * - Random String (base36) + Timestamp (base36)
 * - Beispiel: 'node_k7j2x3z1abc'
 *
 * @returns Eindeutige Node-ID als String
 */
export function genId(): string {
  return 'node_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ============================================================================
// TREE TRAVERSAL
// ============================================================================

/**
 * Findet eine Node und deren Parent im Tree
 *
 * RETURN (DEUTSCH):
 * - { node, parent, index } wenn gefunden
 * - null wenn nicht gefunden
 * - parent ist null fuer Root-Level-Nodes
 * - index ist die Position im Parent's children Array
 *
 * @param tree - Array von Root-Level ComponentNodes
 * @param id - ID der zu suchenden Node
 * @param parent - Interner Parameter fuer Rekursion (optional)
 * @returns NodeInfo-Objekt oder null
 */
export function findNodeAndParent(
  tree: ComponentNode[],
  id: string,
  parent: ComponentNode | null = null
): { node: ComponentNode; parent: ComponentNode | null; index: number } | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      return { node, parent, index: i };
    }
    if (node.children) {
      const found = findNodeAndParent(node.children, id, node);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Findet eine einzelne Node (ohne Parent-Info)
 *
 * USAGE (DEUTSCH): Schnellere Alternative wenn Parent nicht benötigt
 *
 * @param tree - Array von Root-Level ComponentNodes
 * @param id - ID der zu suchenden Node
 * @returns ComponentNode oder null
 */
export function findNode(tree: ComponentNode[], id: string): ComponentNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

// ============================================================================
// DEPTH CALCULATION
// ============================================================================

/**
 * Berechnet die Tiefe einer Node im Tree
 *
 * RETURN (DEUTSCH):
 * - 0 fuer Root-Level
 * - 1 fuer erste Ebene Children
 * - -1 wenn Node nicht gefunden
 *
 * @param tree - Array von Root-Level ComponentNodes
 * @param nodeId - ID der Node
 * @param currentDepth - Interner Parameter fuer Rekursion (default: 0)
 * @returns Tiefe als Number oder -1
 */
export function getDepth(tree: ComponentNode[], nodeId: string, currentDepth: number = 0): number {
  for (const node of tree) {
    if (node.id === nodeId) return currentDepth;
    if (node.children?.length) {
      const depth = getDepth(node.children, nodeId, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
}

/**
 * Prueft ob das Hinzufuegen eines Child die Max-Tiefe ueberschreiten wuerde
 *
 * USAGE (DEUTSCH):
 * - Wird vor Drop-Operation aufgerufen
 * - maxDepth = 5 bedeutet: 0, 1, 2, 3, 4 (5 Ebenen)
 *
 * @param tree - Array von Root-Level ComponentNodes
 * @param nodeId - ID der Parent-Node
 * @param maxDepth - Maximale Tiefe (default: MAX_NESTING_LEVEL + 1)
 * @returns true wenn Max-Tiefe ueberschritten wuerde
 */
export function exceedsMaxDepth(
  tree: ComponentNode[],
  nodeId: string,
  maxDepth: number = MAX_NESTING_LEVEL + 1
): boolean {
  return getDepth(tree, nodeId) >= maxDepth - 1;
}

// ============================================================================
// CIRCULAR DEPENDENCY CHECK
// ============================================================================

/**
 * Prueft ob childId ein Nachkomme (Descendant) von ancestorId ist
 *
 * PURPOSE (DEUTSCH):
 * - Verhindert zirkulaere Abhaengigkeiten beim Drag & Drop
 * - Beispiel: Parent kann nicht in eigenes Child verschoben werden
 *
 * @param tree - Array von Root-Level ComponentNodes
 * @param childId - ID des potentiellen Nachkommens
 * @param ancestorId - ID des potentiellen Vorfahren
 * @returns true wenn childId ein Nachkomme von ancestorId ist
 */
export function isDescendant(tree: ComponentNode[], childId: string, ancestorId: string): boolean {
  const found = findNodeAndParent(tree, ancestorId);
  if (!found) return false;

  const stack = [...(found.node.children || [])];
  while (stack.length) {
    const n = stack.pop()!;
    if (n.id === childId) return true;
    if (n.children?.length) stack.push(...n.children);
  }
  return false;
}

// ============================================================================
// CLONING
// ============================================================================

/**
 * Deep-Clone eines Objekts via JSON
 *
 * LIMITATION (DEUTSCH):
 * - Verliert Functions, Dates, undefined, Symbols
 * - Ausreichend fuer reine Daten-Strukturen (ComponentNode)
 *
 * @param obj - Zu klonendes Objekt
 * @returns Deep-Copy des Objekts
 */
export function cloneDeep<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ============================================================================
// NODE CREATION
// ============================================================================

/**
 * Erstellt eine neue Node aus einem Palette-Entry
 *
 * WICHTIG (DEUTSCH):
 * - Generiert neue ID
 * - Kopiert defaultProps (nicht direkt referenzieren!)
 * - Initialisiert children nur wenn canBeParent
 *
 * @param type - Component-Type aus Palette
 * @param paletteMap - Map von Component-Type zu Palette-Entry
 * @returns Neue ComponentNode oder null wenn Type unbekannt
 */
export function createNode(
  type: string,
  paletteMap: Map<string, ComponentPaletteEntry>
): ComponentNode | null {
  const entry = paletteMap.get(type);
  if (!entry) {
    console.error('createNode: Unknown type', type);
    return null;
  }

  return {
    id: genId(),
    type: entry.type,
    props: { ...entry.defaultProps }, // Shallow copy is sufficient
    children: entry.canBeParent ? [] : undefined,
    compName: entry.compName,
  };
}

// ============================================================================
// TREE MUTATION (IN-PLACE) - CALLER MUST CLONE FIRST!
// ============================================================================

/**
 * Entfernt eine Node aus dem Tree
 *
 * RETURN (DEUTSCH):
 * - Die entfernte Node (oder null)
 * - Tree wird IN-PLACE modifiziert (mutiert!)
 *
 * WICHTIG: Caller muss Tree vorher mit cloneDeep() klonen!
 *
 * @param tree - Array von Root-Level ComponentNodes (wird mutiert!)
 * @param id - ID der zu entfernenden Node
 * @returns Entfernte ComponentNode oder null
 */
export function removeNode(tree: ComponentNode[], id: string): ComponentNode | null {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.id === id) {
      const [removed] = tree.splice(i, 1);
      return removed;
    }
    if (node.children) {
      const removedChild = removeNode(node.children, id);
      if (removedChild) return removedChild;
    }
  }
  return null;
}

/**
 * Fuegt eine Node als Sibling ein (vor/nach Target)
 *
 * ZONES (DEUTSCH):
 * - 'above': Insert BEFORE target
 * - 'below': Insert AFTER target
 *
 * WICHTIG: Tree wird IN-PLACE modifiziert! Caller muss vorher clonen!
 *
 * @param tree - Array von Root-Level ComponentNodes (wird mutiert!)
 * @param found - NodeInfo-Objekt von findNodeAndParent()
 * @param newNode - Einzufuegende Node
 * @param zone - Drop-Zone ('above' oder 'below')
 */
export function insertSibling(
  tree: ComponentNode[],
  found: { node: ComponentNode; parent: ComponentNode | null; index: number },
  newNode: ComponentNode,
  zone: 'above' | 'below'
): void {
  const { parent, index } = found;
  const siblings = parent ? parent.children! : tree;
  const insertIndex = zone === 'above' ? index : index + 1;
  siblings.splice(insertIndex, 0, newNode);
}

/**
 * Fuegt eine Node als Child ein (innerhalb Target)
 *
 * WICHTIG (DEUTSCH):
 * - Nur aufrufen wenn target.children !== undefined!
 * - Fuegt am Ende der Children-Liste ein
 * - Tree wird IN-PLACE modifiziert! Caller muss vorher clonen!
 *
 * @param target - Parent-Node (muss children-Array haben!)
 * @param newNode - Einzufuegende Node
 */
export function insertChild(target: ComponentNode, newNode: ComponentNode): void {
  if (!target.children) {
    console.error('insertChild: Target has no children array', target);
    return;
  }
  target.children.push(newNode);
}
