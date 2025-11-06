// Automatischer Export aller Card-Komponenten mit Metadaten

import { PaletteEntry } from "../../utils/types/palette";
import SimpleInput from "./SimpleInput";
import SimpleFieldset from "./SimpleFieldset";

export const cardComponents: PaletteEntry<any>[] = [
  {
    type: "SimpleInput",
    label: "SimpleInput",
    canHaveChildren: false,
    Component: SimpleInput,
  },
  {
    type: "SimpleFieldset",
    label: "SimpleFieldset",
    canHaveChildren: true,
    Component: SimpleFieldset,
  },
];

export { SimpleInput, SimpleFieldset };
