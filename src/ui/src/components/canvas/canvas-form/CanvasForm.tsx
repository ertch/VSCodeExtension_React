import { ReactNode, RefObject, FormEvent } from 'react';
import { TabState } from '../../../utils/tabState';
import { TreeNode } from '../../../utils/types/canvas';
import TabPage from '../../cards/TabPage';
import { RootDropArea } from '../components';

interface CanvasFormProps {
  formRef: RefObject<HTMLFormElement>;
  tabState: TabState;
  renderNode: (node: TreeNode) => ReactNode;
  uniqueContextId: symbol;
  onRead: () => void;
  onLoad: () => void;
  onClear: () => void;
  onTabNameChange: (tabId: string, newName: string) => void;
  onTabIndexChange: (tabId: string, newIndex: number) => void;
}

export default function CanvasForm({
  formRef,
  tabState,
  renderNode,
  uniqueContextId,
  onRead,
  onLoad,
  onClear,
  onTabNameChange,
  onTabIndexChange
}: CanvasFormProps) {
  // Berechne min/max für TabIndex (nur dynamische Tabs zählen)
  const dynamicTabsCount = tabState.tabs.filter(t => !t.isFixed).length;
  const minTabIndex = 1;
  const maxTabIndex = dynamicTabsCount;

  return (
    <form ref={formRef} className="canvas-form">

      {tabState.tabs.map((tab, index) => (
        <div key={tab.id} className={tab.id === tabState.activeTabId ? '' : 'd-none'}>
          <TabPage
            initialName={tab.name}
            tabNumber={tab.tabIndex}
            onNameChange={(newName) => onTabNameChange(tab.id, newName)}
            onTabIndexChange={(newIndex) => onTabIndexChange(tab.id, newIndex)}
            minTabIndex={minTabIndex}
            maxTabIndex={maxTabIndex}
          >
            <RootDropArea tree={tab.tree} renderNode={renderNode} uniqueContextId={uniqueContextId} />
          </TabPage>
        </div>
      ))}

      <div className="canvas-toolbar">
        <button type="button" className="canvas-btn canvas-btn--primary" onClick={onRead}>
          Canvas auslesen
        </button>
        <button type="button" className="canvas-btn canvas-btn--secondary" onClick={onLoad}>
          Canvas laden
        </button>
        <button type="button" className="canvas-btn canvas-btn--secondary" onClick={onClear}>
          Canvas leeren
        </button>
      </div>
    </form>
  );
}
