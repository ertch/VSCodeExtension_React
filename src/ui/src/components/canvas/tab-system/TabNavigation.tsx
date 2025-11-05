import { TabState } from '../../../utils/tabState';
import TabButton from './TabButton';

interface TabNavigationProps {
  tabState: TabState;
  onTabSwitch: (tabId: string) => void;
  onTabDelete: (tabId: string) => void;
  onTabAdd: () => void;
}

export default function TabNavigation({
  tabState,
  onTabSwitch,
  onTabDelete,
  onTabAdd
}: TabNavigationProps) {
  // Sortiere Tabs nach tabIndex
  const sortedTabs = [...tabState.tabs].sort((a, b) => a.tabIndex - b.tabIndex);

  return (
    <div className="canvas-tabs">
      {sortedTabs.map(tab => (
        <TabButton
          key={tab.id}
          tab={tab}
          isActive={tabState.activeTabId === tab.id}
          onSwitch={() => onTabSwitch(tab.id)}
          onDelete={() => {
            // Validation: Check if tab has content
            if (tab.tree.length > 0) {
              alert('Tab enthält Elemente. Bitte zuerst leeren.');
              return;
            }
            onTabDelete(tab.id);
          }}
        />
      ))}
      <button
        type="button"
        onClick={onTabAdd}
        className="canvas-tab-add"
        title="Neuen Tab hinzufügen"
      >
        + Tab
      </button>
    </div>
  );
}
