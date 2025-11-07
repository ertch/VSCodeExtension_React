// components/palette/index.ts
import { PaletteEntry } from "../types/palette";
import { cardComponents } from "../../components/cards";

// Automatischer Import aller Cards aus dem cards Ordner
export const previewComponents: PaletteEntry[] = [
  ...cardComponents,
  // Hier kannst du weitere Komponenten-Gruppen hinzufügen
];