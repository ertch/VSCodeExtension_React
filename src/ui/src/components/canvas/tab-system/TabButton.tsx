import { TabData } from '../../../utils/tabState';

interface TabButtonProps {
  tab: TabData;
  isActive: boolean;
  onSwitch: () => void;
  onDelete: () => void;
}

export default function TabButton({ tab, isActive, onSwitch, onDelete }: TabButtonProps) {
  return (
    <button
      type="button"
      onClick={onSwitch}
      className={`canvas-tab ${isActive ? 'active' : ''}`}
    >
      {tab.isFixed ? tab.name : `${tab.tabIndex}. ${tab.name}`}
      {!tab.isFixed && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="canvas-tab-close"
          title="Tab löschen"
        >
          ×
        </span>
      )}
    </button>
  );
}
