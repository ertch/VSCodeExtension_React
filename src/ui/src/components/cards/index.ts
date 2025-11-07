import { PaletteEntry } from "../../utils/types/palette";
import SimpleInput from "./SimpleInput";
import SimpleFieldset from "./SimpleFieldset";
import Bild from "./Bild";
import ConBlock from "./ConBlock";
import FinishButton from "./FinishButton";
import FootButtons from "./FootButtons";
import Gate from "./Gate";
import GateGroup from "./GateGroup";
import GatekeeperSelect from "./GatekeeperSelect";
import RadioButton from "./RadioButton";
import RecordButton from "./RecordButton";
import SimpleSelect from "./SimpleSelect";
import SQLinjectionSelect from "./SQLinjectionSelect";
import SuggestionInput from "./SuggestionInput";
import SimpleTextfield from "./SimpleTextfield";
import WeiterButton from "./WeiterButton";

export const cardComponents: PaletteEntry<any>[] = [
  {
    type: "SimpleInput",    // Type identifier for code gen
    label: "SimpleInput",   // Label shown in the palette
    canHaveChildren: false, // enable Dropzone for child components
    Component: SimpleInput, // actual React component
  },
  {
    type: "SimpleFieldset",
    label: "SimpleFieldset",
    canHaveChildren: true,
    Component: SimpleFieldset,
  },
  {
    type: "Bild",
    label: "Bild",
    canHaveChildren: false,
    Component: Bild,
  },
  {
    type: "ConBlock",
    label: "ConBlock",
    canHaveChildren: true,
    Component: ConBlock,
  },
  {
    type: "FinishButton",
    label: "FinishButton",
    canHaveChildren: false,
    Component: FinishButton,
  },
  {
    type: "FootButtons",
    label: "FootButtons",
    canHaveChildren: false,
    Component: FootButtons,
  },
  {
    type: "Gate",
    label: "Gate",
    canHaveChildren: true,
    Component: Gate,
  },
  {
    type: "GateGroup",
    label: "GateGroup",
    canHaveChildren: true,
    Component: GateGroup,
  },
  {
    type: "GatekeeperSelect",
    label: "GatekeeperSelect",
    canHaveChildren: false,
    Component: GatekeeperSelect,
  },
  {
    type: "RadioButton",
    label: "RadioButton",
    canHaveChildren: false,
    Component: RadioButton,
  },
  {
    type: "RecordButton",
    label: "RecordButton",
    canHaveChildren: false,
    Component: RecordButton,
  },
  {
    type: "SimpleSelect",
    label: "SimpleSelect",
    canHaveChildren: false,
    Component: SimpleSelect,
  },
  {
    type: "SQLinjectionSelect",
    label: "SQLinjectionSelect",
    canHaveChildren: false,
    Component: SQLinjectionSelect,
  },
  {
    type: "SuggestionInput",
    label: "SuggestionInput",
    canHaveChildren: false,
    Component: SuggestionInput,
  },
  {
    type: "SimpleTextfield",
    label: "SimpleTextfield",
    canHaveChildren: false,
    Component: SimpleTextfield,
  },
  {
    type: "WeiterButton",
    label: "WeiterButton",
    canHaveChildren: false,
    Component: WeiterButton,
  },
];

export {
  SimpleInput,
  SimpleFieldset,
  Bild,
  ConBlock,
  FinishButton,
  FootButtons,
  Gate,
  GateGroup,
  GatekeeperSelect,
  RadioButton,
  RecordButton,
  SimpleSelect,
  SQLinjectionSelect,
  SuggestionInput,
  SimpleTextfield,
  WeiterButton
};
