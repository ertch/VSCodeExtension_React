import { useCallback, useMemo, useRef, useState, useEffect, ReactNode } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type {
  CanvasProps,
  TreeNode,
  PerformDropParams,
} from '../utils/types/canvas';
import type { PaletteEntry } from '../utils/types/palette';
import { extractInputsFromElement } from '../utils/extractInputs';
import { NamedElementsProvider } from '../contexts/NamedElementsContext';
import { TabState, initTabState, addTab, deleteTab, updateTabTree, updateTabName, updateTabIndex, switchTab } from '../utils/tabState';
import { genId, cloneDeep, findNodeAndParent, removeNode, isDescendant } from './canvas/tree-utils';
import { DefaultComponents, Sidebar } from './canvas/components';
import { NodeWrapper } from './canvas/NodeWrapper';
import TabNavigation from './canvas/tab-system/TabNavigation';
import CanvasForm from './canvas/canvas-form/CanvasForm';

// -----------------------
// Canvas-Komponente
// -----------------------
export default function Canvas({ palette = DefaultComponents, initialNodes = [] }: CanvasProps) {
  const paletteMap = useMemo(() => {
    const map: Record<string, PaletteEntry> = {};
    palette.forEach((p) => (map[p.type] = p));
    return map;
  }, [palette]);

  const [tabState, setTabState] = useState<TabState>(() =>
    initTabState(initialNodes.length ? initialNodes : [])
  );
  const activeTab = tabState.tabs.find(t => t.id === tabState.activeTabId)!;
  const tree = activeTab.tree;

  const [exportJson, setExportJson] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Unique Context ID für diesen Canvas (verhindert Cross-Canvas Drops)
  const uniqueContextId = useMemo(() => Symbol('canvas-context'), []);

  const createNodeFromType = useCallback(
    (type: string): TreeNode | null => {
      const meta = paletteMap[type];
      if (!meta) return null;
      return {
        id: genId(),
        type: meta.type,
        canHaveChildren: !!meta.canHaveChildren,
        props: {},
        children: [],
      };
    },
    [paletteMap]
  );

  const performDrop = useCallback(
    ({ dropTargetId, zone, payload }: PerformDropParams) => {
      if (!payload) return;
      let next = cloneDeep(tree);

      if (payload.kind === "NEW") {
        const newNode = createNodeFromType(payload.type);
        if (!newNode) return;

        if (!dropTargetId) {
          next.push(newNode);
          setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
          return;
        }

        const found = findNodeAndParent(next, dropTargetId);
        if (!found) return;

        if (zone === "inside" && found.node.canHaveChildren) {
          found.node.children = found.node.children || [];
          found.node.children.push(newNode);
        } else {
          const parent = found.parent;
          if (!parent) {
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            next.splice(insertIndex, 0, newNode);
          } else {
            const list = parent.children || [];
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            list.splice(insertIndex, 0, newNode);
            parent.children = list;
          }
        }
        setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
      } else if (payload.kind === "MOVE") {
        const movingId = payload.nodeId;
        if (movingId === dropTargetId) return;
        if (dropTargetId && isDescendant(next, dropTargetId, movingId)) return;

        const movingNode = removeNode(next, movingId);
        if (!movingNode) return;

        if (!dropTargetId) {
          next.push(movingNode);
          setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
          return;
        }

        const found = findNodeAndParent(next, dropTargetId);
        if (!found) return;

        if (zone === "inside" && found.node.canHaveChildren) {
          found.node.children = found.node.children || [];
          found.node.children.push(movingNode);
        } else {
          const parent = found.parent;
          if (!parent) {
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            next.splice(insertIndex, 0, movingNode);
          } else {
            const list = parent.children || [];
            const insertIndex = zone === "above" ? found.index : found.index + 1;
            list.splice(insertIndex, 0, movingNode);
            parent.children = list;
          }
        }
        setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
      }
    },
    [tree, createNodeFromType, tabState.activeTabId]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const next = cloneDeep(tree);
      removeNode(next, id);
      setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
    },
    [tree, tabState.activeTabId]
  );

  const renderNode = useCallback(
    (node: TreeNode): ReactNode => {
      const meta = paletteMap[node.type];
      if (!meta) {
        return (
          <div key={node.id} className="canvas-node-wrapper" style={{ borderColor: "#ef4444" }}>
            Unbekannte Komponente: {node.type}
          </div>
        );
      }
      return (
        <NodeWrapper
          key={node.id}
          node={node}
          meta={meta}
          onDelete={handleDelete}
          uniqueContextId={uniqueContextId}
        >
          {node.children?.map((child) => renderNode(child))}
        </NodeWrapper>
      );
    },
    [paletteMap, handleDelete, uniqueContextId]
  );

  const serializeTreeFromDOM = useCallback(() => {
    const root = formRef.current;
    if (!root) return [];

    const visit = (node: TreeNode): any => {
      const wrapperEl = root.querySelector(`[data-node-id="${node.id}"]`);
      const inputs = wrapperEl ? extractInputsFromElement(wrapperEl as HTMLElement) : {};

      return {
        id: node.id,
        type: node.type,
        inputs,
        children: (node.children || []).map(visit),
      };
    };

    return tree.map(visit);
  }, [tree]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = serializeTreeFromDOM();
    const json = JSON.stringify(data, null, 2);
    setExportJson(json);
  };

  const addViaClick = (type: string) => {
    const node = createNodeFromType(type);
    if (!node) return;
    setTabState((prev) => updateTabTree(prev, prev.activeTabId, [...tree, node]));
  };

  const handleAddTab = useCallback(() => {
    const name = `Tab ${tabState.tabs.length - 1}`;
    setTabState(prev => addTab(prev, name));
  }, [tabState.tabs.length]);

  const handleClearTab = useCallback(() => {
    setTabState(prev => updateTabTree(prev, prev.activeTabId, []));
    setExportJson("");
  }, [tabState.activeTabId]);

  // Globaler Monitor: Fängt alle Drop-Events ab und verarbeitet sie zentral
  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => source.data.contextId === uniqueContextId,
      onDrop: ({ location, source }) => {
        const { dropTargets } = location.current;

        if (dropTargets.length === 0) {
          return;
        }

        // Nimm das INNERSTE Drop-Target (Index 0 ist das tiefste/innerste)
        const [innermostTarget] = dropTargets;
        const dropTargetId = innermostTarget.data.nodeId;
        const zone = innermostTarget.data.zone;

        // Verarbeite den Drop einmalig über die zentrale Funktion
        performDrop({
          dropTargetId: dropTargetId ?? null,
          zone,
          payload: source.data,
        });
      },
    });
  }, [uniqueContextId, performDrop]);

  return (
    <NamedElementsProvider>
      <div className="canvas-layout">
        <div className="canvas-area">
          <TabNavigation
            tabState={tabState}
            onTabSwitch={(tabId) => setTabState(prev => switchTab(prev, tabId))}
            onTabDelete={(tabId) => setTabState(prev => deleteTab(prev, tabId))}
            onTabAdd={handleAddTab}
          />

          <CanvasForm
            formRef={formRef}
            onSubmit={onSubmit}
            tabState={tabState}
            renderNode={renderNode}
            uniqueContextId={uniqueContextId}
            onClear={handleClearTab}
            exportJson={exportJson}
            onTabNameChange={(tabId, newName) =>
              setTabState(prev => updateTabName(prev, tabId, newName))
            }
            onTabIndexChange={(tabId, newIndex) =>
              setTabState(prev => updateTabIndex(prev, tabId, newIndex))
            }
          />
        </div>

        <Sidebar palette={palette} onAddClick={addViaClick} uniqueContextId={uniqueContextId} />
      </div>
    </NamedElementsProvider>
  );
}


