import React from 'react';
interface NamedElement {
    id: string;
    name: string;
}
interface NamedElementsContextValue {
    namedElements: NamedElement[];
    registerElement: (id: string, name: string) => void;
    unregisterElement: (id: string) => void;
    updateElementName: (id: string, name: string) => void;
}
export declare function NamedElementsProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useNamedElements(): NamedElementsContextValue;
export {};
//# sourceMappingURL=NamedElementsContext.d.ts.map