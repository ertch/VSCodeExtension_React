export type PaletteEntry<TProps = {}> = {
    type: string;
    label: string;
    category?: string;
    canHaveChildren: boolean;
    Component: React.FC<TProps>;
};
//# sourceMappingURL=palette.d.ts.map