import { PaletteEntry } from "../../types/palette";
import SimpleInput from "./SimpleInput";
import FinishButton from "./FinishButton";
import WeiterButton from "./WeiterButton";

/**
 * Card Components Palette Subscription
 *
 * This file demonstrates how to register card components with the palette system.
 *
 * **Current Implementation:** Sample registration with 3 representative cards
 * - SimpleInput (13 attributes)
 * - FinishButton (3 attributes)
 * - WeiterButton (0 attributes)
 *
 * **Full Implementation:** Would include all 15 card components:
 * - Layout: SimpleFieldset
 * - Buttons: FinishButton, RecordButton, WeiterButton
 * - Gates: GatekeeperSelect, Gate, GateGroup
 * - Conditional: ConBlock
 * - Inputs: SimpleInput, SQLinjectionSelect, SuggestionInput, SimpleTextfield, SimpleSelect, RadioButton
 * - Media: Bild
 *
 * **TODO:** Add remaining 12 card components when migrating full codebase to New_Project
 *
 * For details on creating new cards, see README.md in this directory.
 */
export const cardComponents: PaletteEntry<any>[] = [
  {
    type: "SimpleInput",
    label: "SimpleInput",
    canHaveChildren: false,
    Component: SimpleInput,
  },
  {
    type: "FinishButton",
    label: "FinishButton",
    canHaveChildren: false,
    Component: FinishButton,
  },
  {
    type: "WeiterButton",
    label: "WeiterButton",
    canHaveChildren: false,
    Component: WeiterButton,
  },
];

/**
 * Named exports for direct component imports
 */
export {
  SimpleInput,
  FinishButton,
  WeiterButton,
};
