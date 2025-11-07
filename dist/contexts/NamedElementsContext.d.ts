import { ReactNode } from 'react';
export interface NamedElement {
    id: string;
    name: string;
}
export interface NamedElementsContextValue {
    namedElements: NamedElement[];
    registerElement: (id: string, name: string) => void;
    unregisterElement: (id: string) => void;
    updateElementName: (id: string, name: string) => void;
}
export declare function NamedElementsProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useNamedElements(): NamedElementsContextValue;
//# sourceMappingURL=NamedElementsContext.d.ts.map