import { ReactNode, RefObject } from 'react';
import { TabState } from '../../../utils/tabState';
import { TreeNode } from '../../../utils/types/canvas';
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
export default function CanvasForm({ formRef, tabState, renderNode, uniqueContextId, onRead, onLoad, onClear, onTabNameChange, onTabIndexChange }: CanvasFormProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=CanvasForm.d.ts.map