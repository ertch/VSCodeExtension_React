/// <reference path="../vscode.d.ts" />
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
import { genId, cloneDeep, findNodeAndParent, removeNode, isDescendant, insertNode } from './canvas/tree-utils';
import { Sidebar } from './canvas/components';
import { NodeWrapper } from './canvas/NodeWrapper';
import TabNavigation from './canvas/tab-system/TabNavigation';
import CanvasForm from './canvas/canvas-form/CanvasForm';
import { downloadJSON } from '../utils/downloadJSON';
import { downloadAstro } from '../utils/downloadAstro';

// -----------------------
// Canvas-Komponente
// -----------------------
export default function Canvas({ palette, initialNodes = [] }: CanvasProps) {
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showMetaForm, setShowMetaForm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const metaFormRef = useRef<HTMLFormElement>(null);

  // Unique Context ID für diesen Canvas (verhindert Cross-Canvas Drops)
  const uniqueContextId = useMemo(() => Symbol('canvas-context'), []);

  // Listen for messages from extension backend
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      switch (message.type) {
        case 'astroGenerated':
          downloadAstro(message.data.astroCode, message.data.filename);
          break;
        case 'astroError':
          console.error('Astro generation error:', message.data.error);
          alert(`Astro Generation fehlgeschlagen: ${message.data.error}`);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

        insertNode(next, dropTargetId, zone, newNode);
        setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
      } else if (payload.kind === "MOVE") {
        const movingId = payload.nodeId;
        if (movingId === dropTargetId) return;
        if (dropTargetId && isDescendant(next, dropTargetId, movingId)) return;

        const movingNode = removeNode(next, movingId);
        if (!movingNode) return;

        insertNode(next, dropTargetId, zone, movingNode);
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

  const serializeCurrentTabFromDOM = useCallback(() => {
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

  const handleReadCanvas = useCallback(async () => {
    // Sortiere Tabs nach tabIndex (wichtig für Reihenfolge!)
    const sortedTabs = [...tabState.tabs].sort((a, b) => a.tabIndex - b.tabIndex);
    const originalActiveTabId = tabState.activeTabId;
    const results: any[] = [];

    // Durchlaufe ALLE Tabs und lese Inputs aus
    for (const tab of sortedTabs) {
      // Tab aktivieren (um Inputs aus DOM zu lesen)
      setTabState(prev => switchTab(prev, tab.id));

      // Warten bis DOM gerendert ist (React Batch Update)
      await new Promise(resolve => setTimeout(resolve, 50));

      // Jetzt Inputs vom aktiven Tab auslesen
      const root = formRef.current;
      if (root) {
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

        results.push({
          type: "TabPage",
          name: tab.name,
          tabIndex: tab.tabIndex,
          children: tab.tree.map(visit)
        });
      }
    }

    // Zurück zum ursprünglichen Tab
    setTabState(prev => switchTab(prev, originalActiveTabId));

    // Dialog öffnen mit gesammelten Daten
    const json = JSON.stringify(results, null, 2);
    setExportJson(json);
    setIsDetailsOpen(true);
  }, [tabState.tabs, tabState.activeTabId]);

  const handleLoadCanvas = useCallback(() => {
  }, []);

  const handleGenerateAstroCode = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!metaFormRef.current) return;

    const formData = new FormData(metaFormRef.current);
    const metadata = {
      campaignNr: formData.get('campaignNr') as string,
      campaignTitle: formData.get('campaignTitle') as string,
      headerTitle: formData.get('headerTitle') as string,
      headerImg: formData.get('headerImg') as string,
    };

    // JSON-Daten parsen
    const jsonData = JSON.parse(exportJson);

    if (window.vscodeApi) {
      window.vscodeApi.postMessage({
        type: 'generateAstro',
        data: { jsonData, metadata }
      });
    } else {
      downloadJSON(jsonData, 'export.json');
    }

    // Formular schließen
    setShowMetaForm(false);
  }, [exportJson]);

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
  }, []);

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
            tabState={tabState}
            renderNode={renderNode}
            uniqueContextId={uniqueContextId}
            onRead={handleReadCanvas}
            onLoad={handleLoadCanvas}
            onClear={handleClearTab}
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

      {/* Canvas Details Dialog */}
      {isDetailsOpen && (
        <>
          <div className="confirm-dialog-backdrop" onClick={() => setIsDetailsOpen(false)} />
          <div className="confirm-dialog canvas-details" role="dialog" aria-modal="true" aria-labelledby="canvas-details-title">
            <div className="confirm-dialog__header">
              <h3 id="canvas-details-title">Canvas Details</h3>
              <button type="button" onClick={() => setIsDetailsOpen(false)} className="closedialog">
                <span className="glyph glyph-close"></span>
              </button>
            </div>
            <div className="canvas-details__content">
              <textarea
                readOnly
                value={exportJson}
                className="canvas-details__json"
                placeholder="Noch keine Daten exportiert..."
              />
              <div className="canvas-details__actions">
                <button
                  type="button"
                  className="canvas-btn canvas-btn--primary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(exportJson);
                    } catch (err) {
                      console.error('Kopieren fehlgeschlagen:', err);
                    }
                  }}
                >
                  JSON Text kopieren
                </button>
                <button
                  type="button"
                  className="canvas-btn canvas-btn--primary"
                  onClick={() => downloadJSON(exportJson)}
                >
                  JSON exportieren
                </button>
                <button
                  type="button"
                  className="canvas-btn canvas-btn--secondary"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    setShowMetaForm(true);
                  }}
                  disabled={!exportJson}
                >
                  Code generieren
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* Kampagnen-Informationen Dialog */}
      {showMetaForm && (
        <>
          <div className="confirm-dialog-backdrop" onClick={() => setShowMetaForm(false)} />
          <div className="confirm-dialog canvas-details" role="dialog" aria-modal="true" aria-labelledby="meta-form-title">
            <div className="confirm-dialog__header">
              <h3 id="meta-form-title">Kampagnen-Informationen</h3>
              <button type="button" onClick={() => setShowMetaForm(false)} className="closedialog">
                <span className="glyph glyph-close"></span>
              </button>
            </div>
            <div className="canvas-details__content">
              <form ref={metaFormRef} onSubmit={handleGenerateAstroCode}>
                <div className="form-group">
                  <label htmlFor="campaignNr">Campaign Number:</label>
                  <input
                    type="text"
                    id="campaignNr"
                    name="campaignNr"
                    required
                    placeholder="z.B. 001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="campaignTitle">Campaign Title:</label>
                  <input
                    type="text"
                    id="campaignTitle"
                    name="campaignTitle"
                    required
                    placeholder="z.B. Meine Kampagne"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="headerTitle">Header Title:</label>
                  <input
                    type="text"
                    id="headerTitle"
                    name="headerTitle"
                    required
                    placeholder="z.B. Willkommen"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="headerImg">Header Image:</label>
                  <input
                    type="text"
                    id="headerImg"
                    name="headerImg"
                    required
                    placeholder="z.B. header.png"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="canvas-btn canvas-btn--primary">
                    Astro-Datei generieren
                  </button>
                  <button
                    type="button"
                    className="canvas-btn canvas-btn--secondary"
                    onClick={() => setShowMetaForm(false)}
                  >
                    Abbrechen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </NamedElementsProvider>
  );
}


