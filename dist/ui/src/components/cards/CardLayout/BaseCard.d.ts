export interface CardAttribute {
    name: string;
    type: 'string' | 'checkbox' | 'function' | 'double_single' | 'double_list' | 'tripple_single' | 'tripple_list' | 'tripple_submit';
    toolTip: string;
    optional: boolean;
}
export interface SlotProps {
    children: React.ReactNode;
    ref: React.RefObject<HTMLDivElement>;
    isEmpty: boolean;
}
export interface CardConfig {
    defaultName?: string;
    attributes: CardAttribute[];
    canBeParent?: boolean;
    codegenName?: string;
    renderPreview: (name: string, id: string, slotProps?: SlotProps) => React.ReactNode;
}
interface BaseCardProps {
    id: string;
    config: CardConfig;
    slotProps?: SlotProps;
}
export default function BaseCard({ id, config, slotProps }: BaseCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BaseCard.d.ts.map