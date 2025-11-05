import { ReactNode, RefObject, FormEvent } from 'react';
import { TabState } from '../../../utils/tabState';
import { TreeNode } from '../../../utils/types/canvas';
import TabPage from '../../cards/TabPage';
import { RootDropArea } from '../components';
import CanvasToolbar from './CanvasToolbar';
import CanvasPreview from './CanvasPreview';

interface CanvasFormProps {
  formRef: RefObject<HTMLFormElement>;
  onSubmit: (e: FormEvent) => void;
  tabState: TabState;
  renderNode: (node: TreeNode) => ReactNode;
  uniqueContextId: symbol;
  onClear: () => void;
  exportJson: string;
  onTabNameChange: (tabId: string, newName: string) => void;
  onTabIndexChange: (tabId: string, newIndex: number) => void;
}

export default function CanvasForm({
  formRef,
  onSubmit,
  tabState,
  renderNode,
  uniqueContextId,
  onClear,
  exportJson,
  onTabNameChange,
  onTabIndexChange
}: CanvasFormProps) {
  // Berechne min/max für TabIndex (nur dynamische Tabs zählen)
  const dynamicTabsCount = tabState.tabs.filter(t => !t.isFixed).length;
  const minTabIndex = 1;
  const maxTabIndex = dynamicTabsCount;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="canvas-form">
      <div className="canvas-hint">
        Ziehe Komponenten aus der rechten Palette auf die Fläche. Drop-Indikatoren zeigen dir: oben, unten oder innen.
      </div>

      {/* Render alle Tabs, nur aktiver ist sichtbar */}
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

      <CanvasToolbar onExport={onSubmit} onClear={onClear} />
      <CanvasPreview exportJson={exportJson} />
    </form>
  );
}
