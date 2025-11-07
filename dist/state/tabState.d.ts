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
export declare const FIXED_TABS: {
    readonly START: {
        readonly id: "tab_start";
        readonly name: "Start";
        readonly isFixed: true;
    };
    readonly ABSCHLUSS: {
        readonly id: "tab_end";
        readonly name: "Abschluss";
        readonly isFixed: true;
    };
};
/**
 * Initialisiert den Tab-State mit 2 fixen Tabs (Start & Abschluss)
 * @param initialNodes Nodes für den Start-Tab
 */
export declare function initTabState(initialNodes?: TreeNode[]): TabState;
/**
 * Fügt einen neuen Tab zwischen Start und Abschluss ein
 * @param state Aktueller TabState
 * @param name Name des neuen Tabs
 */
export declare function addTab(state: TabState, name: string): TabState;
/**
 * Löscht einen dynamischen Tab (fixe Tabs können nicht gelöscht werden)
 * @param state Aktueller TabState
 * @param id Tab ID
 */
export declare function deleteTab(state: TabState, id: string): TabState;
/**
 * Aktualisiert den Tree eines bestimmten Tabs
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param tree Neuer Tree
 */
export declare function updateTabTree(state: TabState, tabId: string, tree: TreeNode[]): TabState;
/**
 * Aktualisiert den Namen eines bestimmten Tabs
 * @param state Aktueller TabState
 * @param tabId Tab ID
 * @param name Neuer Name
 */
export declare function updateTabName(state: TabState, tabId: string, name: string): TabState;
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
export declare function moveTab(state: TabState, tabId: string, newIndex: number): TabState;
/**
 * Wechselt zu einem anderen Tab
 * @param state Aktueller TabState
 * @param tabId Tab ID
 */
export declare function switchTab(state: TabState, tabId: string): TabState;
//# sourceMappingURL=tabState.d.ts.map