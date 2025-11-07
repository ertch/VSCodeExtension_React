/**
 * tabState Tests
 */

import {
  initTabState,
  addTab,
  deleteTab,
  moveTab,
  updateTabTree,
  updateTabName,
  switchTab,
  FIXED_TABS
} from '../../src/state/tabState';

describe('tabState', () => {
  describe('initTabState()', () => {
    it('should create 2 fixed tabs', () => {
      const state = initTabState();

      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[0].id).toBe(FIXED_TABS.START.id);
      expect(state.tabs[1].id).toBe(FIXED_TABS.ABSCHLUSS.id);
    });

    it('should set Start as active tab', () => {
      const state = initTabState();

      expect(state.activeTabId).toBe(FIXED_TABS.START.id);
    });

    it('should populate Start tab with initialNodes', () => {
      const initialNodes = [
        { id: 'node1', type: 'Button', props: {}, children: [], canHaveChildren: false }
      ];
      const state = initTabState(initialNodes);

      expect(state.tabs[0].tree).toEqual(initialNodes);
    });

    it('should mark fixed tabs correctly', () => {
      const state = initTabState();

      expect(state.tabs[0].isFixed).toBe(true);
      expect(state.tabs[1].isFixed).toBe(true);
    });

    it('should assign correct tabIndex', () => {
      const state = initTabState();

      expect(state.tabs[0].tabIndex).toBe(0);
      expect(state.tabs[1].tabIndex).toBe(1);
    });
  });

  describe('addTab()', () => {
    it('should insert tab before Abschluss', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');

      expect(state.tabs).toHaveLength(3);
      expect(state.tabs[1].name).toBe('Tab1');
      expect(state.tabs[2].id).toBe(FIXED_TABS.ABSCHLUSS.id);
    });

    it('should increment tabIndex correctly', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');

      expect(state.tabs[0].tabIndex).toBe(0); // Start
      expect(state.tabs[1].tabIndex).toBe(1); // Tab1
      expect(state.tabs[2].tabIndex).toBe(2); // Abschluss
    });

    it('should mark dynamic tab as not fixed', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');

      expect(state.tabs[1].isFixed).toBe(false);
    });

    it('should initialize new tab with empty tree', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');

      expect(state.tabs[1].tree).toEqual([]);
    });

    it('should add multiple tabs', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');
      state = addTab(state, 'Tab3');

      expect(state.tabs).toHaveLength(5);
      expect(state.tabs[1].name).toBe('Tab1');
      expect(state.tabs[2].name).toBe('Tab2');
      expect(state.tabs[3].name).toBe('Tab3');
      expect(state.tabs[4].id).toBe(FIXED_TABS.ABSCHLUSS.id);
    });
  });

  describe('deleteTab()', () => {
    it('should delete dynamic tab', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      state = deleteTab(state, tabId);

      expect(state.tabs).toHaveLength(2);
      expect(state.tabs.find(t => t.id === tabId)).toBeUndefined();
    });

    it('should NOT delete fixed tabs (Start)', () => {
      let state = initTabState();
      state = deleteTab(state, FIXED_TABS.START.id);

      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[0].id).toBe(FIXED_TABS.START.id);
    });

    it('should NOT delete fixed tabs (Abschluss)', () => {
      let state = initTabState();
      state = deleteTab(state, FIXED_TABS.ABSCHLUSS.id);

      expect(state.tabs).toHaveLength(2);
      expect(state.tabs[1].id).toBe(FIXED_TABS.ABSCHLUSS.id);
    });

    it('should switch to Start if active tab deleted', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      state = { ...state, activeTabId: tabId };
      state = deleteTab(state, tabId);

      expect(state.activeTabId).toBe(FIXED_TABS.START.id);
    });

    it('should NOT switch active tab if other tab deleted', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');
      const tab2Id = state.tabs[2].id;

      state = switchTab(state, tab2Id);

      // Delete Tab1 (not the active tab)
      const tab1Id = state.tabs[1].id;
      state = deleteTab(state, tab1Id);

      // Active tab should still be Tab2
      expect(state.activeTabId).toBe(tab2Id);
      expect(state.tabs.some(t => t.id === tab2Id)).toBe(true);
    });

    it('should reindex remaining tabs', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');
      const tab1Id = state.tabs[1].id;

      state = deleteTab(state, tab1Id);

      expect(state.tabs).toHaveLength(3);
      expect(state.tabs[0].tabIndex).toBe(0); // Start
      expect(state.tabs[1].tabIndex).toBe(1); // Tab2
      expect(state.tabs[2].tabIndex).toBe(2); // Abschluss
    });

    it('should handle deleting non-existent tab', () => {
      let state = initTabState();
      const originalState = { ...state };

      state = deleteTab(state, 'nonexistent-tab-id');

      expect(state).toEqual(originalState);
    });
  });

  describe('moveTab()', () => {
    it('should move tab to new position', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');
      const tab1Id = state.tabs[1].id; // Tab1
      const tab2Id = state.tabs[2].id; // Tab2

      state = moveTab(state, tab1Id, 2);

      const movedTab1 = state.tabs.find(t => t.id === tab1Id);
      const movedTab2 = state.tabs.find(t => t.id === tab2Id);

      expect(movedTab2?.tabIndex).toBe(1); // Tab2 moved up
      expect(movedTab1?.tabIndex).toBe(2); // Tab1 moved down
    });

    it('should NOT move fixed tabs (Start)', () => {
      const state = initTabState();
      const result = moveTab(state, FIXED_TABS.START.id, 1);

      expect(result).toEqual(state); // Unchanged
    });

    it('should NOT move fixed tabs (Abschluss)', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const result = moveTab(state, FIXED_TABS.ABSCHLUSS.id, 1);

      expect(result).toEqual(state); // Unchanged
    });

    it('should reject invalid indices (too low)', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      // Try to move before Start (index 0)
      const result = moveTab(state, tabId, 0);

      expect(result).toEqual(state);
    });

    it('should reject invalid indices (too high)', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      // Try to move after Abschluss (index 3)
      const result = moveTab(state, tabId, 3);

      expect(result).toEqual(state);
    });

    it('should reindex all tabs correctly', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');
      state = addTab(state, 'Tab3');

      const tabId = state.tabs[3].id; // Tab3
      state = moveTab(state, tabId, 1); // Move to position 1

      state.tabs.forEach((tab, idx) => {
        expect(tab.tabIndex).toBe(idx);
      });
    });

    it('should handle moving to same position', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      // Tab1 is at index 1, move to index 1
      state = moveTab(state, tabId, 1);

      expect(state.tabs[1].id).toBe(tabId);
    });

    it('should handle moving non-existent tab', () => {
      let state = initTabState();
      const originalState = { ...state };

      state = moveTab(state, 'nonexistent-tab-id', 1);

      expect(state).toEqual(originalState);
    });
  });

  describe('updateTabTree()', () => {
    it('should update tree for specific tab', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      const newTree = [
        { id: 'node1', type: 'Button', props: {}, children: [], canHaveChildren: false }
      ];
      state = updateTabTree(state, tabId, newTree);

      expect(state.tabs[1].tree).toEqual(newTree);
      expect(state.tabs[0].tree).toEqual([]); // Start unchanged
    });

    it('should not affect other tabs', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');

      const tab1Id = state.tabs[1].id;
      const tab2Id = state.tabs[2].id;

      const tab1Tree = [
        { id: 'node1', type: 'Button', props: {}, children: [], canHaveChildren: false }
      ];
      const tab2Tree = [
        { id: 'node2', type: 'Input', props: {}, children: [], canHaveChildren: false }
      ];

      state = updateTabTree(state, tab1Id, tab1Tree);
      state = updateTabTree(state, tab2Id, tab2Tree);

      const updatedTab1 = state.tabs.find(t => t.id === tab1Id);
      const updatedTab2 = state.tabs.find(t => t.id === tab2Id);

      expect(updatedTab1?.tree).toEqual(tab1Tree);
      expect(updatedTab2?.tree).toEqual(tab2Tree);
    });

    it('should handle updating non-existent tab', () => {
      let state = initTabState();
      const originalState = { ...state };

      state = updateTabTree(state, 'nonexistent-tab-id', []);

      expect(state).toEqual(originalState);
    });
  });

  describe('updateTabName()', () => {
    it('should update name for specific tab', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      state = updateTabName(state, tabId, 'Renamed Tab');

      expect(state.tabs[1].name).toBe('Renamed Tab');
    });

    it('should not affect other tabs', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = addTab(state, 'Tab2');

      const tab1Id = state.tabs[1].id;
      const tab2Id = state.tabs[2].id;

      state = updateTabName(state, tab1Id, 'New Name 1');

      const updatedTab1 = state.tabs.find(t => t.id === tab1Id);
      const updatedTab2 = state.tabs.find(t => t.id === tab2Id);

      expect(updatedTab1?.name).toBe('New Name 1');
      expect(updatedTab2?.name).toBe('Tab2'); // Unchanged
    });

    it('should handle updating non-existent tab', () => {
      let state = initTabState();
      const originalState = { ...state };

      state = updateTabName(state, 'nonexistent-tab-id', 'New Name');

      expect(state).toEqual(originalState);
    });
  });

  describe('switchTab()', () => {
    it('should switch active tab', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      const tabId = state.tabs[1].id;

      state = switchTab(state, tabId);

      expect(state.activeTabId).toBe(tabId);
    });

    it('should allow switching to fixed tabs', () => {
      let state = initTabState();
      state = addTab(state, 'Tab1');
      state = switchTab(state, state.tabs[1].id);

      state = switchTab(state, FIXED_TABS.ABSCHLUSS.id);

      expect(state.activeTabId).toBe(FIXED_TABS.ABSCHLUSS.id);
    });
  });
});
