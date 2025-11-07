// types/palette.ts

export type PaletteEntry<TProps = {}> = {
  type: string;                  // Eindeutiger Schlüssel (stabil)
  label: string;                 // Button-Text in der Sidebar
  category?: string;             // Kategorie für Gruppierung (optional)
  canHaveChildren: boolean;      // Darf Kinder enthalten?
  Component: React.FC<TProps>;   // Deine TSX-Komponente
};
