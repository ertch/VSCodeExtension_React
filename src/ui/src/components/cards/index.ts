// Automatischer Export aller Card-Komponenten mit Metadaten

import { PaletteEntry } from "../../utils/types/palette";
import SimpleInput from "./SimpleInput";

export const cardComponents: PaletteEntry<any>[] = [
  {
    type: "SimpleInput",
    label: "SimpleInput",
    canHaveChildren: false,
    Component: SimpleInput,
  },
  
];

export { SimpleInput };
