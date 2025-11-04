// cards/index.ts
// Automatischer Export aller Card-Komponenten mit Metadaten

import { PaletteEntry } from "../../utils/types/palette";
import Card from "./Card";
import Card2 from "./Card2";
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
    type: "Card2",
    label: "Card 2",
    canHaveChildren: false,
    codeGen: { component: "Card2", variant: "default" },
    Component: Card2,
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
