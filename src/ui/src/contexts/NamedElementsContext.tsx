import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

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

const NamedElementsContext = createContext<NamedElementsContextValue | undefined>(undefined);

export function NamedElementsProvider({ children }: { children: React.ReactNode }) {
  const [namedElements, setNamedElements] = useState<NamedElement[]>([]);

  const registerElement = useCallback((id: string, name: string) => {
    if (!name || name.trim() === '') return;

    setNamedElements((prev) => { // Duplikate ausschließen
      const exists = prev.find((el) => el.id === id);
      if (exists) {
        return prev.map((el) => (el.id === id ? { id, name } : el));
      }
      // Unbekannt --> neue Card hinzufügen
      return [...prev, { id, name }];
    });
  }, []);

  // Card ohne Namen auschließen
  const unregisterElement = useCallback((id: string) => {
    setNamedElements((prev) => prev.filter((el) => el.id !== id));
  }, []);

  // neuer Name --> aktualisieren zu registered
  const updateElementName = useCallback((id: string, name: string) => {
    if (!name || name.trim() === '') {
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
