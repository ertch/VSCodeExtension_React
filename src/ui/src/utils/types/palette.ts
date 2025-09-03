// types/palette.ts

export type PaletteEntry<TProps = {}> = {
  type: string;                  // Eindeutiger Schlüssel (stabil)
  label: string;                 // Button-Text in der Sidebar
  canHaveChildren: boolean;      // Darf Kinder enthalten?
  codeGen: unknown;              // Beliebiges Objekt oder String (landet in data-codegen)
  Component: React.FC<TProps>;   // Deine TSX-Komponente
};