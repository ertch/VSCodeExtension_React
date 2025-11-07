import { TabState } from '../../../utils/tabState';
interface TabNavigationProps {
    tabState: TabState;
    onTabSwitch: (tabId: string) => void;
    onTabDelete: (tabId: string) => void;
    onTabAdd: () => void;
}
export default function TabNavigation({ tabState, onTabSwitch, onTabDelete, onTabAdd }: TabNavigationProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TabNavigation.d.ts.map