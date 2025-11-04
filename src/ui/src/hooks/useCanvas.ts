// src/ui/src/hooks/useCanvas.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  ComponentNode,
  ProjectConfig,
  ExtensionToCanvasMessage,
  CanvasToExtensionMessage,
} from '../../../shared/messageProtocol';
import {
  MAX_NESTING_LEVEL,
  DND_ZONE_TOP_PERCENT,
  DND_ZONE_BOTTOM_PERCENT,
  AUTOSAVE_DELAY_MS,
  CONFIG_VERSION,
} from '../../../shared/constants';
import {
  findNodeAndParent,
  isDescendant,
  getDepth,
  exceedsMaxDepth,
  removeNode,
  insertSibling,
  insertChild,
  cloneDeep,
  genId,
} from '../utils/treeHelpers';
import { serializeTree } from '../utils/domSerializer';
import { createPaletteMap } from '../utils/componentPalette';
import type { ComponentPaletteEntry } from '../utils/componentPalette';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Drag-State-Typ fuer Drag & Drop
 *
 * TYPES (DEUTSCH):
 * - NEW: Drag from Palette (neue Node erstellen)
 * - MOVE: Drag existing node (bestehende Node verschieben)
 */
type DragState = {
  kind: 'NEW' | 'MOVE';
  type?: string; // Nur bei NEW: Component-Type
  nodeId?: string; // Nur bei MOVE: ID der verschobenen Node
};

/**
 * Hover-State-Typ fuer Drop-Zonen
 *
 * ZONES (DEUTSCH):
 * - above: Drop BEFORE target
 * - below: Drop AFTER target
 * - inside: Drop AS CHILD of target
 */
type HoverState = {
  targetId: string | null;
  zone: 'above' | 'below' | 'inside' | null;
};

/**
 * Return-Type des useCanvas Hook
 */
export interface UseCanvasReturn {
  // ========== Extension Bridge ==========
  config: ProjectConfig | null;
  projectName: string;
  isReady: boolean;
  isValidProject: boolean;
  saveToExtension: (tree: ComponentNode[]) => void;
  loadFromExtension: () => void;

  // ========== Tree Operations ==========
  tree: ComponentNode[];
  setTree: React.Dispatch<React.SetStateAction<ComponentNode[]>>;
  handleDelete: (nodeId: string) => void;
  addNodeAtRoot: (type: string) => void;
  clearCanvas: () => void;
  serializeCanvas: () => ComponentNode[];
  updateNodeProps: (nodeId: string, newProps: Record<string, any>) => void;

  // ========== Drag & Drop ==========
  dragging: DragState | null;
  hover: HoverState;
  setHover: React.Dispatch<React.SetStateAction<HoverState>>;
  handlePaletteDragStart: (e: React.DragEvent, type: string) => void;
  handleNodeDragStart: (e: React.DragEvent, nodeId: string) => void;
  computeZone: (
    e: React.DragEvent,
    targetNode: ComponentNode
  ) => 'above' | 'below' | 'inside';
  performDrop: (params: {
    dropTargetId: string | null;
    zone: 'above' | 'below' | 'inside';
    payload: DragState | null;
  }) => void;

  // ========== Refs & Palette ==========
  formRef: React.RefObject<HTMLFormElement>;
  paletteMap: Map<string, ComponentPaletteEntry>;
}

// ============================================================================
// MAIN HOOK: useCanvas
// ============================================================================

/**
 * MEGA-HOOK: Consolidates Extension Bridge, Tree Operations, and Drag & Drop
 *
 * RESPONSIBILITIES (DEUTSCH):
 * 1. Extension Bridge: Message-Handling mit VSCode Extension
 * 2. Tree Operations: CRUD auf Component-Tree
 * 3. Drag & Drop: Vollstaendige DnD-Logik mit Validierung
 * 4. Auto-Save: Automatisches Speichern nach Aenderungen (debounced)
 *
 * ARCHITECTURE (DEUTSCH):
 * - State: config, projectName, isReady, isValidProject (Extension Bridge)
 * - State: tree (Component Tree)
 * - State: dragging, hover (Drag & Drop)
 * - Ref: formRef (fuer DOM-Serialization)
 * - Const: paletteMap (Component Palette Lookup)
 *
 * @returns UseCanvasReturn - Alle State-Variablen und Funktionen
 */
export function useCanvas(): UseCanvasReturn {
  // ==========================================================================
  // PART 1: EXTENSION BRIDGE STATE
  // ==========================================================================

  const [config, setConfig] = useState<ProjectConfig | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isValidProject, setIsValidProject] = useState<boolean>(false);

  // ==========================================================================
  // PART 2: TREE STATE
  // ==========================================================================

  const [tree, setTree] = useState<ComponentNode[]>([]);

  // ==========================================================================
  // PART 3: DRAG & DROP STATE
  // ==========================================================================

  const [dragging, setDragging] = useState<DragState | null>(null);
  const [hover, setHover] = useState<HoverState>({
    targetId: null,
    zone: null,
  });

  // ==========================================================================
  // REFS & CONSTANTS
  // ==========================================================================

  const formRef = useRef<HTMLFormElement>(null);
  const paletteMap = useRef(createPaletteMap()).current;
  const autoSaveTimerRef = useRef<number | null>(null);

  // ==========================================================================
  // PART 1: EXTENSION BRIDGE - MESSAGE HANDLING
  // ==========================================================================

  /**
   * Effect: Listen for messages from extension host
   *
   * MESSAGES (DEUTSCH):
   * - INIT: Initiale Projekt-Info und Config
   * - LOAD_RESPONSE: Response auf LOAD_REQUEST
   * - SAVE_SUCCESS: Bestaetigung nach erfolgreichem Save
   * - ERROR: Fehler-Nachricht
   */
  useEffect(() => {
    const handler = (event: MessageEvent<ExtensionToCanvasMessage>) => {
      const msg = event.data;

      switch (msg.type) {
        case 'INIT':
          setProjectName(msg.payload.projectName);
          setIsValidProject(msg.payload.isValidProject || false);
          if (msg.payload.config) {
            setConfig(msg.payload.config);
            setTree(msg.payload.config.tree || []);
          }
          setIsReady(true);
          console.log('useCanvas: INIT received', msg.payload);
          break;

        case 'LOAD_RESPONSE':
          setConfig(msg.payload);
          setTree(msg.payload.tree || []);
          console.log('useCanvas: Config loaded');
          break;

        case 'SAVE_SUCCESS':
          console.log('useCanvas: Save successful', msg.filePath);
          break;

        case 'ERROR':
          console.error('useCanvas: Error', msg.message);
          alert(`Fehler: ${msg.message}`);
          break;

        default:
          console.warn('useCanvas: Unknown message type', msg);
      }
    };

    window.addEventListener('message', handler);

    // Send initial READY signal
    if (window.vscodeApi) {
      window.vscodeApi.postMessage({ type: 'READY' } as CanvasToExtensionMessage);
      console.log('useCanvas: READY signal sent');
    } else {
      console.error('useCanvas: vscodeApi not available!');
    }

    return () => window.removeEventListener('message', handler);
  }, []);

  /**
   * Save to extension
   *
   * FLOW (DEUTSCH):
   * 1. Serialisiere Tree mit DOM-Input-Werten
   * 2. Erstelle ProjectConfig
   * 3. Sende SAVE-Message an Extension
   */
  const saveToExtension = useCallback(
    (treeToSave: ComponentNode[]) => {
      if (!window.vscodeApi) {
        console.error('useCanvas: vscodeApi not available!');
        return;
      }

      const payload: ProjectConfig = {
        version: CONFIG_VERSION,
        projectName,
        lastModified: new Date().toISOString(),
        tree: treeToSave,
        metadata: {},
      };

      window.vscodeApi.postMessage({
        type: 'SAVE',
        payload,
      } as CanvasToExtensionMessage);

      console.log('useCanvas: SAVE message sent');
    },
    [projectName]
  );

  /**
   * Load from extension
   *
   * FLOW (DEUTSCH):
   * 1. Sende LOAD_REQUEST-Message
   * 2. Extension antwortet mit LOAD_RESPONSE
   * 3. LOAD_RESPONSE wird vom Message-Handler verarbeitet
   */
  const loadFromExtension = useCallback(() => {
    if (!window.vscodeApi) {
      console.error('useCanvas: vscodeApi not available!');
      return;
    }

    window.vscodeApi.postMessage({ type: 'LOAD_REQUEST' } as CanvasToExtensionMessage);
    console.log('useCanvas: LOAD_REQUEST sent');
  }, []);

  // ==========================================================================
  // AUTO-SAVE: Save tree after changes (debounced)
  // ==========================================================================

  useEffect(() => {
    // Don't auto-save before initialization
    if (!isReady) return;

    // Don't auto-save empty tree on initial load
    if (tree.length === 0 && !config) return;

    // Clear existing timer
    if (autoSaveTimerRef.current !== null) {
      window.clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = window.setTimeout(() => {
      const serialized = serializeTree(tree, formRef.current);
      saveToExtension(serialized);
    }, AUTOSAVE_DELAY_MS);

    return () => {
      if (autoSaveTimerRef.current !== null) {
        window.clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [tree, isReady, config, saveToExtension]);

  // ==========================================================================
  // PART 2: TREE OPERATIONS
  // ==========================================================================

  /**
   * Delete node from tree
   *
   * FLOW (DEUTSCH):
   * 1. Clone Tree (Immutability)
   * 2. Remove Node via removeNode()
   * 3. Update State
   */
  const handleDelete = useCallback(
    (nodeId: string) => {
      const nextTree = cloneDeep(tree);
      removeNode(nextTree, nodeId);
      setTree(nextTree);
      console.log('useCanvas: Node deleted', nodeId);
    },
    [tree]
  );

  /**
   * Add new node at root level
   *
   * FLOW (DEUTSCH):
   * 1. Hole Palette-Entry
   * 2. Erstelle neue Node mit genId()
   * 3. Append an Tree
   */
  const addNodeAtRoot = useCallback(
    (type: string) => {
      const entry = paletteMap.get(type);
      if (!entry) {
        console.error('useCanvas: Unknown type', type);
        return;
      }

      const node: ComponentNode = {
        id: genId(),
        type: entry.type,
        props: { ...entry.defaultProps },
        children: entry.canBeParent ? [] : undefined,
        compName: entry.compName,
      };

      setTree((prev) => [...prev, node]);
      console.log('useCanvas: Node added at root', node);
    },
    [paletteMap]
  );

  /**
   * Clear entire canvas
   *
   * SIMPLE: Set tree to empty array
   */
  const clearCanvas = useCallback(() => {
    setTree([]);
    console.log('useCanvas: Canvas cleared');
  }, []);

  /**
   * Serialize canvas with DOM input values
   *
   * RETURN (DEUTSCH):
   * - Serialisierter Tree mit aktuellen Input-Werten
   * - Falls formRef nicht verfuegbar: Tree as-is
   */
  const serializeCanvas = useCallback((): ComponentNode[] => {
    const root = formRef.current;
    if (!root) {
      console.warn('useCanvas: formRef not available, returning tree as-is');
      return tree;
    }
    const serialized = serializeTree(tree, root);
    console.log('useCanvas: Canvas serialized');
    return serialized;
  }, [tree]);

  /**
   * Update node props
   *
   * FLOW (DEUTSCH):
   * 1. Clone Tree
   * 2. Finde Node rekursiv
   * 3. Merge Props
   * 4. Update State
   */
  const updateNodeProps = useCallback(
    (nodeId: string, newProps: Record<string, any>) => {
      setTree((prevTree) => {
        const nextTree = cloneDeep(prevTree);

        function updateNode(nodes: ComponentNode[]): boolean {
          for (const node of nodes) {
            if (node.id === nodeId) {
              node.props = { ...node.props, ...newProps }; // Merge
              return true;
            }
            if (node.children?.length && updateNode(node.children)) {
              return true;
            }
          }
          return false;
        }

        updateNode(nextTree);
        console.log('useCanvas: Props updated for node', nodeId, newProps);
        return nextTree;
      });
    },
    []
  );

  // ==========================================================================
  // PART 3: DRAG & DROP
  // ==========================================================================

  /**
   * Handle drag start from palette (NEW node)
   *
   * FLOW (DEUTSCH):
   * 1. Set effectAllowed = 'copy'
   * 2. Set dataTransfer mit { kind: 'NEW', type }
   * 3. Update dragging state
   */
  const handlePaletteDragStart = useCallback((e: React.DragEvent, type: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData(
      'application/x-canvas',
      JSON.stringify({ kind: 'NEW', type })
    );
    setDragging({ kind: 'NEW', type });
    console.log('useCanvas: Palette drag started', type);
  }, []);

  /**
   * Handle drag start from canvas node (MOVE existing node)
   *
   * FLOW (DEUTSCH):
   * 1. Stop Propagation (verhindert Parent-Drag)
   * 2. Set effectAllowed = 'move'
   * 3. Set dataTransfer mit { kind: 'MOVE', nodeId }
   * 4. Update dragging state
   */
  const handleNodeDragStart = useCallback((e: React.DragEvent, nodeId: string) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(
      'application/x-canvas',
      JSON.stringify({ kind: 'MOVE', nodeId })
    );
    setDragging({ kind: 'MOVE', nodeId });
    console.log('useCanvas: Node drag started', nodeId);
  }, []);

  /**
   * Compute drop zone based on mouse position
   *
   * ZONES (DEUTSCH):
   * - Top 25% (DND_ZONE_TOP_PERCENT): 'above' (drop BEFORE target)
   * - Bottom 25% (DND_ZONE_BOTTOM_PERCENT): 'below' (drop AFTER target)
   * - Middle 50%: 'inside' (drop AS CHILD - only if canBeParent)
   *
   * @param e - Drag Event
   * @param targetNode - Target ComponentNode
   * @returns Drop-Zone ('above', 'below', oder 'inside')
   */
  const computeZone = useCallback(
    (e: React.DragEvent, targetNode: ComponentNode): 'above' | 'below' | 'inside' => {
      const cardElement =
        (e.target as HTMLElement)?.closest('[data-node-id]') || e.currentTarget;
      const rect = (cardElement as HTMLElement).getBoundingClientRect();
      const y = e.clientY - rect.top;
      const h = rect.height || 1;
      const bandTop = h * DND_ZONE_TOP_PERCENT;
      const bandBottom = h * DND_ZONE_BOTTOM_PERCENT;

      // Top 25%: above
      if (y <= bandTop) return 'above';

      // Bottom 25%: below
      if (y >= h - bandBottom) return 'below';

      // Middle 50%: inside (if canBeParent), otherwise closest edge
      if (targetNode.children !== undefined) {
        return 'inside';
      } else {
        return y < h / 2 ? 'above' : 'below';
      }
    },
    []
  );

  /**
   * Perform drop operation
   *
   * VALIDATION (DEUTSCH):
   * - Max Depth Check (exceedsMaxDepth)
   * - Circular Dependency Check (isDescendant)
   * - Component Type Check (paletteMap.get)
   * - Self-Drop Check (nodeId === dropTargetId)
   *
   * FLOW (DEUTSCH):
   * 1. Validate payload
   * 2. Clone Tree
   * 3. Handle NEW: Create node from palette
   * 4. Handle MOVE: Remove + Reinsert node
   * 5. Insert at calculated position (above/below/inside)
   * 6. Update State
   */
  const performDrop = useCallback(
    ({
      dropTargetId,
      zone,
      payload,
    }: {
      dropTargetId: string | null;
      zone: 'above' | 'below' | 'inside';
      payload: DragState | null;
    }) => {
      if (!payload) {
        console.error('useCanvas: No payload for drop');
        return;
      }

      const nextTree = cloneDeep(tree);

      // Helper: Drop at root level
      const dropAtRoot = (node: ComponentNode) => {
        nextTree.push(node);
        setTree(nextTree);
        console.log('useCanvas: Dropped at root', node);
      };

      // Helper: Insert node at calculated position
      const insertNode = (node: ComponentNode) => {
        if (!dropTargetId) return dropAtRoot(node);

        const found = findNodeAndParent(nextTree, dropTargetId);
        if (!found) {
          console.error('useCanvas: Target not found', dropTargetId);
          return;
        }

        // Validation: Max depth check (only for 'inside' drops)
        if (zone === 'inside') {
          if (exceedsMaxDepth(nextTree, dropTargetId, MAX_NESTING_LEVEL + 1)) {
            alert('Maximale Verschachtelungstiefe erreicht (5 Ebenen)!');
            return;
          }
        }

        // Insert based on zone
        if (zone === 'inside' && found.node.children !== undefined) {
          insertChild(found.node, node);
        } else {
          insertSibling(nextTree, found, node, zone);
        }

        setTree(nextTree);
        console.log('useCanvas: Node inserted', { zone, targetId: dropTargetId });
      };

      // ========== Handle NEW drop (from palette) ==========
      if (payload.kind === 'NEW') {
        const entry = paletteMap.get(payload.type || '');
        if (!entry) {
          alert(`Fehler: Komponente "${payload.type}" konnte nicht erstellt werden.`);
          return;
        }

        const newNode: ComponentNode = {
          id: genId(),
          type: entry.type,
          props: { ...entry.defaultProps },
          children: entry.canBeParent ? [] : undefined,
          compName: entry.compName,
        };

        insertNode(newNode);
      }
      // ========== Handle MOVE drop (existing node) ==========
      else if (payload.kind === 'MOVE') {
        const movingId = payload.nodeId;
        if (!movingId) {
          console.error('useCanvas: Missing nodeId in MOVE payload');
          return;
        }

        // Validation: Cannot drop on itself
        if (movingId === dropTargetId) {
          console.warn('useCanvas: Cannot drop node on itself');
          return;
        }

        // Validation: Circular dependency check
        if (dropTargetId && isDescendant(nextTree, dropTargetId, movingId)) {
          alert('Parent-Komponente kann nicht in eigenes Child verschoben werden!');
          return;
        }

        // Remove from current position
        const movingNode = removeNode(nextTree, movingId);
        if (!movingNode) {
          console.error('useCanvas: Moving node not found', movingId);
          return;
        }

        // Insert at new position
        insertNode(movingNode);
      }
    },
    [tree, paletteMap]
  );

  // ==========================================================================
  // CLEANUP: Clear hover state on dragend/drop
  // ==========================================================================

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

  // ==========================================================================
  // RETURN: All state and functions
  // ==========================================================================

  return {
    // Extension Bridge
    config,
    projectName,
    isReady,
    isValidProject,
    saveToExtension,
    loadFromExtension,

    // Tree Operations
    tree,
    setTree,
    handleDelete,
    addNodeAtRoot,
    clearCanvas,
    serializeCanvas,
    updateNodeProps,

    // Drag & Drop
    dragging,
    hover,
    setHover,
    handlePaletteDragStart,
    handleNodeDragStart,
    computeZone,
    performDrop,

    // Refs & Palette
    formRef,
    paletteMap,
  };
}
