"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_TABS = void 0;
exports.initTabState = initTabState;
exports.addTab = addTab;
exports.deleteTab = deleteTab;
exports.updateTabTree = updateTabTree;
exports.updateTabName = updateTabName;
exports.moveTab = moveTab;
exports.switchTab = switchTab;
// Fixe Tabs (hart-codiert, nicht löschbar)
exports.FIXED_TABS = {
    START: { id: 'tab_start', name: 'Start', isFixed: true },
    ABSCHLUSS: { id: 'tab_end', name: 'Abschluss', isFixed: true }
};
// Counter for generating unique tab IDs
let tabIdCounter = 0;
/**
 * Initialisiert den Tab-State mit 2 fixen Tabs (Start & Abschluss)
 * @param initialNodes Nodes für den Start-Tab
 */
function initTabState(initialNodes = []) {
    return {
        tabs: [
            Object.assign(Object.assign({}, exports.FIXED_TABS.START), { tree: initialNodes, tabIndex: 0 }),
            Object.assign(Object.assign({}, exports.FIXED_TABS.ABSCHLUSS), { tree: [], tabIndex: 1 })
        ],
        activeTabId: exports.FIXED_TABS.START.id
    };
}
/**
 * Fügt einen neuen Tab zwischen Start und Abschluss ein
 * @param state Aktueller TabState
 * @param name Name des neuen Tabs
 */
function addTab(state, name) {
    // TabIndex = vorletzter Index (vor Abschluss)
    const newTabIndex = state.tabs.length - 1;
    const newTab = {
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
        Object.assign(Object.assign({}, state.tabs[state.tabs.length - 1]), { tabIndex: newTabIndex + 1 })
    ];
    return Object.assign(Object.assign({}, state), { tabs: newTabs });
}
/**
 * Löscht einen dynamischen Tab (fixe Tabs können nicht gelöscht werden)
 * @param state Aktueller TabState
 * @param id Tab ID
 */
function deleteTab(state, id) {
    const tab = state.tabs.find(t => t.id === id);
    // Fixe Tabs nicht löschbar
    if (!tab || tab.isFixed) {
        return state;
    }
    const filtered = state.tabs.filter(t => t.id !== id);
    // TabIndices neu vergeben
    const reindexed = filtered.map((t, idx) => (Object.assign(Object.assign({}, t), { tabIndex: idx })));
    return {
        tabs: reindexed,
        // Falls aktiver Tab gelöscht wird, wechsle zu Start
        activeTabId: state.activeTabId === id ? exports.FIXED_TABS.START.id : state.activeTabId
    };
}
/**
 * Aktualisiert den Tree eines bestimmten Tabs
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param tree Neuer Tree
 */
function updateTabTree(state, tabId, tree) {
    return Object.assign(Object.assign({}, state), { tabs: state.tabs.map(t => t.id === tabId ? Object.assign(Object.assign({}, t), { tree }) : t) });
}
/**
 * Aktualisiert den Namen eines bestimmten Tabs
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param name Neuer Name
 */
function updateTabName(state, tabId, name) {
    return Object.assign(Object.assign({}, state), { tabs: state.tabs.map(t => t.id === tabId ? Object.assign(Object.assign({}, t), { name }) : t) });
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
function moveTab(state, tabId, newIndex) {
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
    const reindexed = reordered.map((t, idx) => (Object.assign(Object.assign({}, t), { tabIndex: idx })));
    return Object.assign(Object.assign({}, state), { tabs: reindexed });
}
/**
 * Wechselt zu einem anderen Tab
 * @param state Aktueller TabState
 * @param tabId Tab ID
 */
function switchTab(state, tabId) {
    return Object.assign(Object.assign({}, state), { activeTabId: tabId });
}
