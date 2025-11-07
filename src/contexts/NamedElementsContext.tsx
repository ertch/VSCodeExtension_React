import * as React from 'react';
import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

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

const NamedElementsContext = createContext<NamedElementsContextValue | undefined>(undefined);

export function NamedElementsProvider({ children }: { children: ReactNode }) {
  const [namedElements, setNamedElements] = useState<NamedElement[]>([]);

  const registerElement = useCallback((id: string, name: string) => {
    if (!name || name.trim() === '') return;

    setNamedElements((prev) => {
      const exists = prev.find((el) => el.id === id);
      if (exists) {
        // Update existing
        return prev.map((el) => (el.id === id ? { id, name } : el));
      }
      // Add new
      return [...prev, { id, name }];
    });
  }, []);

  const unregisterElement = useCallback((id: string) => {
    setNamedElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  const updateElementName = useCallback((id: string, name: string) => {
    if (!name || name.trim() === '') {
      // If no name, remove element
      unregisterElement(id);
      return;
    }

    registerElement(id, name);
  }, [registerElement, unregisterElement]);

  const value = useMemo(
    () => ({
      namedElements,
      registerElement,
      unregisterElement,
      updateElementName,
    }),
    [namedElements, registerElement, unregisterElement, updateElementName]
  );

  return (
    <NamedElementsContext.Provider value={value}>
      {children}
    </NamedElementsContext.Provider>
  );
}

export function useNamedElements() {
  const context = useContext(NamedElementsContext);
  if (!context) {
    throw new Error('useNamedElements must be used within NamedElementsProvider');
  }
  return context;
}
