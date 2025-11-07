"use strict";
/**
 * tabState Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tabState_1 = require("../../src/state/tabState");
describe('tabState', () => {
    describe('initTabState()', () => {
        it('should create 2 fixed tabs', () => {
            const state = (0, tabState_1.initTabState)();
            expect(state.tabs).toHaveLength(2);
            expect(state.tabs[0].id).toBe(tabState_1.FIXED_TABS.START.id);
            expect(state.tabs[1].id).toBe(tabState_1.FIXED_TABS.ABSCHLUSS.id);
        });
        it('should set Start as active tab', () => {
            const state = (0, tabState_1.initTabState)();
            expect(state.activeTabId).toBe(tabState_1.FIXED_TABS.START.id);
        });
        it('should populate Start tab with initialNodes', () => {
            const initialNodes = [
                { id: 'node1', type: 'Button', props: {}, children: [], canHaveChildren: false }
            ];
            const state = (0, tabState_1.initTabState)(initialNodes);
            expect(state.tabs[0].tree).toEqual(initialNodes);
        });
        it('should mark fixed tabs correctly', () => {
            const state = (0, tabState_1.initTabState)();
            expect(state.tabs[0].isFixed).toBe(true);
            expect(state.tabs[1].isFixed).toBe(true);
        });
        it('should assign correct tabIndex', () => {
            const state = (0, tabState_1.initTabState)();
            expect(state.tabs[0].tabIndex).toBe(0);
            expect(state.tabs[1].tabIndex).toBe(1);
        });
    });
    describe('addTab()', () => {
        it('should insert tab before Abschluss', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            expect(state.tabs).toHaveLength(3);
            expect(state.tabs[1].name).toBe('Tab1');
            expect(state.tabs[2].id).toBe(tabState_1.FIXED_TABS.ABSCHLUSS.id);
        });
        it('should increment tabIndex correctly', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            expect(state.tabs[0].tabIndex).toBe(0); // Start
            expect(state.tabs[1].tabIndex).toBe(1); // Tab1
            expect(state.tabs[2].tabIndex).toBe(2); // Abschluss
        });
        it('should mark dynamic tab as not fixed', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            expect(state.tabs[1].isFixed).toBe(false);
        });
        it('should initialize new tab with empty tree', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            expect(state.tabs[1].tree).toEqual([]);
        });
        it('should add multiple tabs', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            state = (0, tabState_1.addTab)(state, 'Tab3');
            expect(state.tabs).toHaveLength(5);
            expect(state.tabs[1].name).toBe('Tab1');
            expect(state.tabs[2].name).toBe('Tab2');
            expect(state.tabs[3].name).toBe('Tab3');
            expect(state.tabs[4].id).toBe(tabState_1.FIXED_TABS.ABSCHLUSS.id);
        });
    });
    describe('deleteTab()', () => {
        it('should delete dynamic tab', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            state = (0, tabState_1.deleteTab)(state, tabId);
            expect(state.tabs).toHaveLength(2);
            expect(state.tabs.find(t => t.id === tabId)).toBeUndefined();
        });
        it('should NOT delete fixed tabs (Start)', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.deleteTab)(state, tabState_1.FIXED_TABS.START.id);
            expect(state.tabs).toHaveLength(2);
            expect(state.tabs[0].id).toBe(tabState_1.FIXED_TABS.START.id);
        });
        it('should NOT delete fixed tabs (Abschluss)', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.deleteTab)(state, tabState_1.FIXED_TABS.ABSCHLUSS.id);
            expect(state.tabs).toHaveLength(2);
            expect(state.tabs[1].id).toBe(tabState_1.FIXED_TABS.ABSCHLUSS.id);
        });
        it('should switch to Start if active tab deleted', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            state = Object.assign(Object.assign({}, state), { activeTabId: tabId });
            state = (0, tabState_1.deleteTab)(state, tabId);
            expect(state.activeTabId).toBe(tabState_1.FIXED_TABS.START.id);
        });
        it('should NOT switch active tab if other tab deleted', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            const tab2Id = state.tabs[2].id;
            state = (0, tabState_1.switchTab)(state, tab2Id);
            // Delete Tab1 (not the active tab)
            const tab1Id = state.tabs[1].id;
            state = (0, tabState_1.deleteTab)(state, tab1Id);
            // Active tab should still be Tab2
            expect(state.activeTabId).toBe(tab2Id);
            expect(state.tabs.some(t => t.id === tab2Id)).toBe(true);
        });
        it('should reindex remaining tabs', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            const tab1Id = state.tabs[1].id;
            state = (0, tabState_1.deleteTab)(state, tab1Id);
            expect(state.tabs).toHaveLength(3);
            expect(state.tabs[0].tabIndex).toBe(0); // Start
            expect(state.tabs[1].tabIndex).toBe(1); // Tab2
            expect(state.tabs[2].tabIndex).toBe(2); // Abschluss
        });
        it('should handle deleting non-existent tab', () => {
            let state = (0, tabState_1.initTabState)();
            const originalState = Object.assign({}, state);
            state = (0, tabState_1.deleteTab)(state, 'nonexistent-tab-id');
            expect(state).toEqual(originalState);
        });
    });
    describe('moveTab()', () => {
        it('should move tab to new position', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            const tab1Id = state.tabs[1].id; // Tab1
            const tab2Id = state.tabs[2].id; // Tab2
            state = (0, tabState_1.moveTab)(state, tab1Id, 2);
            const movedTab1 = state.tabs.find(t => t.id === tab1Id);
            const movedTab2 = state.tabs.find(t => t.id === tab2Id);
            expect(movedTab2 === null || movedTab2 === void 0 ? void 0 : movedTab2.tabIndex).toBe(1); // Tab2 moved up
            expect(movedTab1 === null || movedTab1 === void 0 ? void 0 : movedTab1.tabIndex).toBe(2); // Tab1 moved down
        });
        it('should NOT move fixed tabs (Start)', () => {
            const state = (0, tabState_1.initTabState)();
            const result = (0, tabState_1.moveTab)(state, tabState_1.FIXED_TABS.START.id, 1);
            expect(result).toEqual(state); // Unchanged
        });
        it('should NOT move fixed tabs (Abschluss)', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const result = (0, tabState_1.moveTab)(state, tabState_1.FIXED_TABS.ABSCHLUSS.id, 1);
            expect(result).toEqual(state); // Unchanged
        });
        it('should reject invalid indices (too low)', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            // Try to move before Start (index 0)
            const result = (0, tabState_1.moveTab)(state, tabId, 0);
            expect(result).toEqual(state);
        });
        it('should reject invalid indices (too high)', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            // Try to move after Abschluss (index 3)
            const result = (0, tabState_1.moveTab)(state, tabId, 3);
            expect(result).toEqual(state);
        });
        it('should reindex all tabs correctly', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            state = (0, tabState_1.addTab)(state, 'Tab3');
            const tabId = state.tabs[3].id; // Tab3
            state = (0, tabState_1.moveTab)(state, tabId, 1); // Move to position 1
            state.tabs.forEach((tab, idx) => {
                expect(tab.tabIndex).toBe(idx);
            });
        });
        it('should handle moving to same position', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            // Tab1 is at index 1, move to index 1
            state = (0, tabState_1.moveTab)(state, tabId, 1);
            expect(state.tabs[1].id).toBe(tabId);
        });
        it('should handle moving non-existent tab', () => {
            let state = (0, tabState_1.initTabState)();
            const originalState = Object.assign({}, state);
            state = (0, tabState_1.moveTab)(state, 'nonexistent-tab-id', 1);
            expect(state).toEqual(originalState);
        });
    });
    describe('updateTabTree()', () => {
        it('should update tree for specific tab', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            const newTree = [
                { id: 'node1', type: 'Button', props: {}, children: [], canHaveChildren: false }
            ];
            state = (0, tabState_1.updateTabTree)(state, tabId, newTree);
            expect(state.tabs[1].tree).toEqual(newTree);
            expect(state.tabs[0].tree).toEqual([]); // Start unchanged
        });
        it('should not affect other tabs', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            const tab1Id = state.tabs[1].id;
            const tab2Id = state.tabs[2].id;
            const tab1Tree = [
                { id: 'node1', type: 'Button', props: {}, children: [], canHaveChildren: false }
            ];
            const tab2Tree = [
                { id: 'node2', type: 'Input', props: {}, children: [], canHaveChildren: false }
            ];
            state = (0, tabState_1.updateTabTree)(state, tab1Id, tab1Tree);
            state = (0, tabState_1.updateTabTree)(state, tab2Id, tab2Tree);
            const updatedTab1 = state.tabs.find(t => t.id === tab1Id);
            const updatedTab2 = state.tabs.find(t => t.id === tab2Id);
            expect(updatedTab1 === null || updatedTab1 === void 0 ? void 0 : updatedTab1.tree).toEqual(tab1Tree);
            expect(updatedTab2 === null || updatedTab2 === void 0 ? void 0 : updatedTab2.tree).toEqual(tab2Tree);
        });
        it('should handle updating non-existent tab', () => {
            let state = (0, tabState_1.initTabState)();
            const originalState = Object.assign({}, state);
            state = (0, tabState_1.updateTabTree)(state, 'nonexistent-tab-id', []);
            expect(state).toEqual(originalState);
        });
    });
    describe('updateTabName()', () => {
        it('should update name for specific tab', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            state = (0, tabState_1.updateTabName)(state, tabId, 'Renamed Tab');
            expect(state.tabs[1].name).toBe('Renamed Tab');
        });
        it('should not affect other tabs', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.addTab)(state, 'Tab2');
            const tab1Id = state.tabs[1].id;
            const tab2Id = state.tabs[2].id;
            state = (0, tabState_1.updateTabName)(state, tab1Id, 'New Name 1');
            const updatedTab1 = state.tabs.find(t => t.id === tab1Id);
            const updatedTab2 = state.tabs.find(t => t.id === tab2Id);
            expect(updatedTab1 === null || updatedTab1 === void 0 ? void 0 : updatedTab1.name).toBe('New Name 1');
            expect(updatedTab2 === null || updatedTab2 === void 0 ? void 0 : updatedTab2.name).toBe('Tab2'); // Unchanged
        });
        it('should handle updating non-existent tab', () => {
            let state = (0, tabState_1.initTabState)();
            const originalState = Object.assign({}, state);
            state = (0, tabState_1.updateTabName)(state, 'nonexistent-tab-id', 'New Name');
            expect(state).toEqual(originalState);
        });
    });
    describe('switchTab()', () => {
        it('should switch active tab', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            const tabId = state.tabs[1].id;
            state = (0, tabState_1.switchTab)(state, tabId);
            expect(state.activeTabId).toBe(tabId);
        });
        it('should allow switching to fixed tabs', () => {
            let state = (0, tabState_1.initTabState)();
            state = (0, tabState_1.addTab)(state, 'Tab1');
            state = (0, tabState_1.switchTab)(state, state.tabs[1].id);
            state = (0, tabState_1.switchTab)(state, tabState_1.FIXED_TABS.ABSCHLUSS.id);
            expect(state.activeTabId).toBe(tabState_1.FIXED_TABS.ABSCHLUSS.id);
        });
    });
});
