// cards/index.ts
// Automatischer Export aller Card-Komponenten mit Metadaten

import { PaletteEntry } from "../../utils/types/palette";
import Card from "./Card";
import SimpleInput from "./SimpleInput";
import ContainerCard from "./ContainerCard";

// Hier fügst du für jede neue Card einen Eintrag hinzu
export const cardComponents: PaletteEntry[] = [
  {
    type: "Card",
    label: "Card (Standard)",
    canHaveChildren: false,
    Component: Card,
  },
  {
    type: "SimpleInput",
    label: "SimpleInput",
    canHaveChildren: false,
    Component: SimpleInput,
  },
  {
    type: "ContainerCard",
    label: "Container Card",
    canHaveChildren: true,  // Kann andere Cards enthalten!
    Component: ContainerCard,
  },
];

// Optional: Einzelexporte für direkten Import
export { Card, SimpleInput, ContainerCard };
