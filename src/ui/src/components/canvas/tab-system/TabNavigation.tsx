import { useState } from 'react';
import { TabState } from '../../../utils/tabState';
import TabButton from './TabButton';
import ConfirmDialog from '../../shared/ConfirmDialog';

interface TabNavigationProps {
  tabState: TabState;
  onTabSwitch: (tabId: string) => void;
  onTabDelete: (tabId: string) => void;
  onTabAdd: () => void;
}

interface DeleteConfirmState {
  tabId: string;
  tabName: string;
  hasContent: boolean;
}

export default function TabNavigation({
  tabState,
  onTabSwitch,
  onTabDelete,
  onTabAdd
}: TabNavigationProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState | null>(null);

  // Sortiere Tabs nach tabIndex
  const sortedTabs = [...tabState.tabs].sort((a, b) => a.tabIndex - b.tabIndex);

  const handleDeleteClick = (tabId: string, tabName: string, hasContent: boolean) => {
    setDeleteConfirm({ tabId, tabName, hasContent });
  };

  const handleConfirmDelete = () => {
    if (deleteConfirm) {
      onTabDelete(deleteConfirm.tabId);
      setDeleteConfirm(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  return (
    <>
      <div className="canvas-tabs">
        {sortedTabs.map(tab => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={tabState.activeTabId === tab.id}
            onSwitch={() => onTabSwitch(tab.id)}
            onDelete={() => handleDeleteClick(tab.id, tab.name, tab.tree.length > 0)}
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

      <ConfirmDialog
        isOpen={deleteConfirm !== null}
        title="Tab löschen?"
        message={
          deleteConfirm?.hasContent
            ? `Tab "${deleteConfirm.tabName}" enthält Elemente. Möchten Sie diesen Tab wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
            : `Möchten Sie Tab "${deleteConfirm?.tabName}" wirklich löschen?`
        }
        confirmText="Löschen"
        cancelText="Abbrechen"
        type="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}
