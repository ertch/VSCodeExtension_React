import { TabData } from '../../../utils/tabState';
interface TabButtonProps {
    tab: TabData;
    isActive: boolean;
    onSwitch: () => void;
    onDelete: () => void;
}
export default function TabButton({ tab, isActive, onSwitch, onDelete }: TabButtonProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TabButton.d.ts.map