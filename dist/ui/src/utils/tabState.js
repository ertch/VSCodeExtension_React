"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXED_TABS = void 0;
exports.initTabState = initTabState;
exports.addTab = addTab;
exports.deleteTab = deleteTab;
exports.updateTabTree = updateTabTree;
exports.updateTabName = updateTabName;
exports.updateTabIndex = updateTabIndex;
exports.switchTab = switchTab;
exports.moveTab = moveTab;
// Fixe Tabs (hart-codiert, nicht löschbar)
exports.FIXED_TABS = {
    START: { id: 'tab_start', name: 'Start', isFixed: true },
    ABSCHLUSS: { id: 'tab_end', name: 'Abschluss', isFixed: true }
};
/**
 * Initialisiert den Tab-State mit 2 fixen Tabs (Start & Abschluss)
 * @param initialNodes Nodes für den Start-Tab
 */
function initTabState(initialNodes = []) {
    return {
        tabs: [
            { ...exports.FIXED_TABS.START, tree: initialNodes, tabIndex: 0 },
            { ...exports.FIXED_TABS.ABSCHLUSS, tree: [], tabIndex: 1 }
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
        id: `tab_${Date.now()}`,
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
function deleteTab(state, id) {
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
function updateTabName(state, tabId, name) {
    return {
        ...state,
        tabs: state.tabs.map(t => t.id === tabId ? { ...t, name } : t)
    };
}
/**
 * Aktualisiert den TabIndex eines bestimmten Tabs
 * Andere Tabs werden automatisch neu nummeriert
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param newIndex Neuer TabIndex
 */
function updateTabIndex(state, tabId, newIndex) {
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
    const oldIndex = tab.tabIndex;
    // Wenn Index gleich bleibt, keine Änderung
    if (oldIndex === newIndex) {
        return state;
    }
    // Alle Tabs aktualisieren
    const updatedTabs = state.tabs.map(t => {
        if (t.id === tabId) {
            // Der zu verschiebende Tab bekommt neuen Index
            return { ...t, tabIndex: newIndex };
        }
        // Andere dynamische Tabs anpassen
        if (!t.isFixed) {
            if (oldIndex < newIndex) {
                // Tab wurde nach unten verschoben
                // Alle Tabs zwischen oldIndex und newIndex rutschen nach oben
                if (t.tabIndex > oldIndex && t.tabIndex <= newIndex) {
                    return { ...t, tabIndex: t.tabIndex - 1 };
                }
            }
            else {
                // Tab wurde nach oben verschoben
                // Alle Tabs zwischen newIndex und oldIndex rutschen nach unten
                if (t.tabIndex >= newIndex && t.tabIndex < oldIndex) {
                    return { ...t, tabIndex: t.tabIndex + 1 };
                }
            }
        }
        return t;
    });
    return {
        ...state,
        tabs: updatedTabs
    };
}
/**
 * Wechselt zu einem anderen Tab
 * @param state Aktueller TabState
 * @param tabId Tab ID
 */
function switchTab(state, tabId) {
    return {
        ...state,
        activeTabId: tabId
    };
}
/**
 * Verschiebt einen Tab zu einer neuen Position
 * Start (Index 0) und Abschluss (letzter Index) bleiben fixiert
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
    const reindexed = reordered.map((t, idx) => ({ ...t, tabIndex: idx }));
    return {
        ...state,
        tabs: reindexed
    };
}
//# sourceMappingURL=tabState.js.map