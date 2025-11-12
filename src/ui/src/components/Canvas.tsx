import { useCallback, useMemo, useRef, useState, useEffect, ReactNode } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type {
  CanvasProps,
  TreeNode,
  PerformDropParams,
  DropPayload,
  SerializedNode,
  SerializedTab,
  AstroMetaData,
} from '../utils/types/canvas';
import type { PaletteEntry } from '../utils/types/palette';
import { extractInputsFromElement } from '../utils/extractInputs';
import { NamedElementsProvider } from '../contexts/NamedElementsContext';
import { TabState, initTabState, addTab, deleteTab, updateTabTree, updateTabName, updateTabIndex, switchTab } from '../utils/tabState';
import { genId, cloneDeep, removeNode, isDescendant, insertNode } from './canvas/tree-utils';
import { Sidebar } from './canvas/components';
import { NodeWrapper } from './canvas/NodeWrapper';
import TabNavigation from './canvas/tab-system/TabNavigation';
import CanvasForm from './canvas/canvas-form/CanvasForm';
import { downloadJSON } from '../utils/downloadJSON';
import { downloadAstro } from '../utils/downloadAstro';
import { logger } from '../utils/logger';

// -----------------------
// Canvas-Komponente
// -----------------------
export default function Canvas({ palette = [], initialNodes = [] }: CanvasProps) {
  const paletteMap = useMemo(() => {
    const map: Record<string, PaletteEntry> = {};
    palette.forEach((p) => (map[p.type] = p));
    return map;
  }, [palette]);

  const [tabState, setTabState] = useState<TabState>(() =>
    initTabState(initialNodes.length ? initialNodes : [])
  );

  const activeTab = useMemo(() => {
    const tab = tabState.tabs.find(t => t.id === tabState.activeTabId);
    if (!tab) {
      logger.error(`Active tab not found: ${tabState.activeTabId}. Falling back to first tab.`);
      return tabState.tabs[0];
    }
    return tab;
  }, [tabState.tabs, tabState.activeTabId]);

  const tree = activeTab.tree;

  const [exportJson, setExportJson] = useState("");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [showMetaForm, setShowMetaForm] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const metaFormRef = useRef<HTMLFormElement>(null);

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

      // Normalize zone to the exact union type expected by insertNode
      const normalizedZone = zone as 'above' | 'below' | 'inside';

      if (payload.kind === "NEW") {
        const newNode = createNodeFromType(payload.type);
        if (!newNode) return;

        insertNode(next, dropTargetId, normalizedZone, newNode);
        setTabState(prev => updateTabTree(prev, tabState.activeTabId, next));
      } else if (payload.kind === "MOVE") {
        const movingId = payload.nodeId;
        if (movingId === dropTargetId) return;
        if (dropTargetId && isDescendant(next, dropTargetId, movingId)) return;

        const movingNode = removeNode(next, movingId);
        if (!movingNode) return;

        insertNode(next, dropTargetId, normalizedZone, movingNode);
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

  const serializeCurrentTabFromDOM = useCallback((): SerializedNode[] => {
    const root = formRef.current;
    if (!root) return [];

    const visit = (node: TreeNode): SerializedNode => {
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
    const results: SerializedTab[] = [];

    // Overlay erstellen um User-Interaktion während des Lesens zu verhindern
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;cursor:wait;background:rgba(0,0,0,0.2);';
    document.body.appendChild(overlay);

    try {
      // Durchlaufe ALLE Tabs und lese Inputs aus
      for (const tab of sortedTabs) {
        // Tab aktivieren (um Inputs aus DOM zu lesen)
        setTabState(prev => switchTab(prev, tab.id));

        // Use requestAnimationFrame + setTimeout für zuverlässigeres Render-Wait
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            setTimeout(resolve, 100); // Erhöht von 50ms für mehr Stabilität
          });
        });

        // Jetzt Inputs vom aktiven Tab auslesen
        const root = formRef.current;
        if (root) {
          const visit = (node: TreeNode): SerializedNode => {
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
    } finally {
      // Immer Overlay entfernen und ursprünglichen Tab wiederherstellen
      document.body.removeChild(overlay);
      setTabState(prev => switchTab(prev, originalActiveTabId));
    }

    // Dialog öffnen mit gesammelten Daten
    const json = JSON.stringify(results, null, 2);
    setExportJson(json);
    setIsDetailsOpen(true);
  }, [tabState.tabs, tabState.activeTabId]);

  const handleLoadCanvas = useCallback(() => {
    logger.warn('Canvas load feature not yet implemented');
    // TODO: Implement canvas loading functionality
  }, []);

  const handleGenerateAstroCode = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!metaFormRef.current) return;

    const formData = new FormData(metaFormRef.current);
    const metadata: AstroMetaData = {
      campaignNr: formData.get('campaignNr') as string,
      campaignTitle: formData.get('campaignTitle') as string,
      headerTitle: formData.get('headerTitle') as string,
      headerImg: formData.get('headerImg') as string,
    };

    // JSON-Daten parsen
    const jsonData: SerializedTab[] = JSON.parse(exportJson);

    try {
      // Standard static import - bundler handles this correctly
      const { mergeAstro } = await import('../../../generator/AstroMerger');
      const astroCode = mergeAstro(jsonData, metadata);

      // Astro-Datei direkt herunterladen
      downloadAstro(astroCode, 'index.astro');

      logger.info('Astro file downloaded successfully');
    } catch (error) {
      logger.error('Failed to generate Astro file', error);
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
    setTabState(prev => {
      // Zähle nur dynamische Tabs (nicht fixiert)
      const dynamicTabCount = prev.tabs.filter(t => !t.isFixed).length;
      const name = `Tab ${dynamicTabCount + 1}`;
      return addTab(prev, name);
    });
  }, []); // Keine Dependencies benötigt

  const handleClearTab = useCallback(() => {
    setTabState(prev => updateTabTree(prev, prev.activeTabId, []));
    setExportJson("");
  }, []);

  // Ref für performDrop um useEffect Dependency zu stabilisieren
  const performDropRef = useRef(performDrop);

  // Update ref wenn performDrop sich ändert
  useEffect(() => {
    performDropRef.current = performDrop;
  }, [performDrop]);

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
        const dropTargetId = innermostTarget.data.nodeId as string | undefined;
        const zone = innermostTarget.data.zone as string;

        // Verarbeite den Drop einmalig über die zentrale Funktion (via Ref)
        performDropRef.current({
          dropTargetId: dropTargetId ?? null,
          zone,
          payload: source.data as DropPayload,
        });
      },
    });
  }, [uniqueContextId]); // Nur uniqueContextId als Dependency

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
                      logger.info('JSON copied to clipboard');
                      setNotification({ message: 'JSON in Zwischenablage kopiert', type: 'success' });
                      setTimeout(() => setNotification(null), 3000);
                    } catch (err) {
                      logger.error('Failed to copy JSON to clipboard', err);
                      setNotification({ message: 'Kopieren fehlgeschlagen', type: 'error' });
                      setTimeout(() => setNotification(null), 3000);
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

      {/* Notification Toast */}
      {notification && (
        <div
          className={`notification notification--${notification.type}`}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '4px',
            backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 10000,
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          {notification.message}
        </div>
      )}
    </NamedElementsProvider>
  );
}