// Tab State Management für Multi-Tab Canvas
import { TreeNode } from '../types/canvas';

export interface TabData {
  id: string;
  name: string;
  tree: TreeNode[];
  isFixed: boolean;
  tabIndex: number;
}

export interface TabState {
  tabs: TabData[];
  activeTabId: string;
}

// Fixe Tabs (hart-codiert, nicht löschbar)
export const FIXED_TABS = {
  START: { id: 'tab_start', name: 'Start', isFixed: true },
  ABSCHLUSS: { id: 'tab_end', name: 'Abschluss', isFixed: true }
} as const;

// Counter for generating unique tab IDs
let tabIdCounter = 0;

/**
 * Initialisiert den Tab-State mit 2 fixen Tabs (Start & Abschluss)
 * @param initialNodes Nodes für den Start-Tab
 */
export function initTabState(initialNodes: TreeNode[] = []): TabState {
  return {
    tabs: [
      { ...FIXED_TABS.START, tree: initialNodes, tabIndex: 0 },
      { ...FIXED_TABS.ABSCHLUSS, tree: [], tabIndex: 1 }
    ],
    activeTabId: FIXED_TABS.START.id
  };
}

/**
 * Fügt einen neuen Tab zwischen Start und Abschluss ein
 * @param state Aktueller TabState
 * @param name Name des neuen Tabs
 */
export function addTab(state: TabState, name: string): TabState {
  // TabIndex = vorletzter Index (vor Abschluss)
  const newTabIndex = state.tabs.length - 1;

  const newTab: TabData = {
    id: `tab_${Date.now()}_${tabIdCounter++}`,
    name,
    tree: [],
    isFixed: false,
    tabIndex: newTabIndex
  };

  // Einfügen VOR Abschluss (letztes Element)
  const newTabs = [
    ...state.tabs.slice(0, -1),
    newTab,
    { ...state.tabs[state.tabs.length - 1], tabIndex: newTabIndex + 1 } // Abschluss neu nummerieren
  ];

  return {
    ...state,
    tabs: newTabs
  };
}

/**
 * Löscht einen dynamischen Tab (fixe Tabs können nicht gelöscht werden)
 * @param state Aktueller TabState
 * @param id Tab ID
 */
export function deleteTab(state: TabState, id: string): TabState {
  const tab = state.tabs.find(t => t.id === id);

  // Fixe Tabs nicht löschbar
  if (!tab || tab.isFixed) {
    return state;
  }

  const filtered = state.tabs.filter(t => t.id !== id);

  // TabIndices neu vergeben
  const reindexed = filtered.map((t, idx) => ({ ...t, tabIndex: idx }));

  return {
    tabs: reindexed,
    // Falls aktiver Tab gelöscht wird, wechsle zu Start
    activeTabId: state.activeTabId === id ? FIXED_TABS.START.id : state.activeTabId
  };
}

/**
 * Aktualisiert den Tree eines bestimmten Tabs
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param tree Neuer Tree
 */
export function updateTabTree(state: TabState, tabId: string, tree: TreeNode[]): TabState {
  return {
    ...state,
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, tree } : t)
  };
}

/**
 * Aktualisiert den Namen eines bestimmten Tabs
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param name Neuer Name
 */
export function updateTabName(state: TabState, tabId: string, name: string): TabState {
  return {
    ...state,
    tabs: state.tabs.map(t => t.id === tabId ? { ...t, name } : t)
  };
}

/**
 * Verschiebt einen Tab zu einer neuen Position
 * Start (Index 0) und Abschluss (letzter Index) bleiben fixiert
 *
 * Note: This function replaces the deprecated updateTabIndex() function.
 * Use this for all tab reordering operations.
 *
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param newIndex Neue Position (TabIndex)
 */
export function moveTab(state: TabState, tabId: string, newIndex: number): TabState {
  const tab = state.tabs.find(t => t.id === tabId);

  // Fixe Tabs nicht verschiebbar
  if (!tab || tab.isFixed) {
    return state;
  }

  // Validierung: newIndex muss zwischen 1 und tabs.length - 2 liegen
  const minIndex = 1; // Nach "Start"
  const maxIndex = state.tabs.length - 2; // Vor "Abschluss"

  if (newIndex < minIndex || newIndex > maxIndex) {
    return state;
  }

  // Tab entfernen und an neuer Position einfügen
  const filtered = state.tabs.filter(t => t.id !== tabId);
  const reordered = [
    ...filtered.slice(0, newIndex),
    tab,
    ...filtered.slice(newIndex)
  ];

  // TabIndices neu vergeben
  const reindexed = reordered.map((t, idx) => ({ ...t, tabIndex: idx }));

  return {
    ...state,
    tabs: reindexed
  };
}

/**
 * Wechselt zu einem anderen Tab
 * @param state Aktueller TabState
 * @param tabId Tab ID
 */
export function switchTab(state: TabState, tabId: string): TabState {
  return {
    ...state,
    activeTabId: tabId
  };
}
