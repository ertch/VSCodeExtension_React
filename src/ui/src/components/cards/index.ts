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
    codeGen: { component: "Card", variant: "default" },
    Component: Card,
  },
  {
    type: "SimpleInput",
    label: "SimpleInput",
    canHaveChildren: false,
    codeGen: { component: "SimpleInput", variant: "default" },
    Component: SimpleInput,
  },
  {
    type: "ContainerCard",
    label: "Container Card",
    canHaveChildren: true,  // Kann andere Cards enthalten!
    codeGen: { component: "ContainerCard", variant: "container" },
    Component: ContainerCard,
  },
];

// Optional: Einzelexporte für direkten Import
export { Card, Card2, ContainerCard };
