// components/palette/index.ts
import { PaletteEntry } from "../types/palette";
import Card from "../../components/Card";

export const previewComponents: PaletteEntry[] = [
  {
    type: "Card",
    label: "Card",
    canHaveChildren: false,
    codeGen: "<Card>", // String ist auch ok
    Component: Card,
  },
];