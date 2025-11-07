import { ReactNode } from 'react';
interface TabPageProps {
    children?: ReactNode;
    initialName?: string;
    tabNumber?: number;
    onNameChange?: (newName: string) => void;
    onTabIndexChange?: (newIndex: number) => void;
    minTabIndex?: number;
    maxTabIndex?: number;
}
export default function TabPage({ children, initialName, tabNumber, onNameChange, onTabIndexChange, minTabIndex, maxTabIndex }: TabPageProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=TabPage.d.ts.map