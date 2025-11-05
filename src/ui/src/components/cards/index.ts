// Automatischer Export aller Card-Komponenten mit Metadaten

import { PaletteEntry } from "../../utils/types/palette";
import Card from "./Card";
import SimpleInput from "./SimpleInput";

export const cardComponents: PaletteEntry<any>[] = [
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
  
];

export { Card, SimpleInput };
