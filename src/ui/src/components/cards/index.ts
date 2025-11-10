import { PaletteEntry } from "../../utils/types/palette";
import SimpleInput from "./SimpleInput";
import SimpleFieldset from "./SimpleFieldset";
import Bild from "./Bild";
import ConBlock from "./ConBlock";
import FinishButton from "./FinishButton";
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
  // Inputs
  {
    type: "SimpleInput",
    label: "Simple Input",
    category: "Inputs",
    canHaveChildren: false,
    Component: SimpleInput,
  },
  {
    type: "SimpleTextfield",
    label: "Simple Textfield",
    category: "Inputs",
    canHaveChildren: false,
    Component: SimpleTextfield,
  },
  {
    type: "SuggestionInput",
    label: "Suggestion Input",
    category: "Inputs",
    canHaveChildren: false,
    Component: SuggestionInput,
  },
  {
    type: "RadioButton",
    label: "Radio Button",
    category: "Inputs",
    canHaveChildren: false,
    Component: RadioButton,
  },
  {
    type: "SimpleSelect",
    label: "Simple Select",
    category: "Inputs",
    canHaveChildren: false,
    Component: SimpleSelect,
  },
  {
    type: "GatekeeperSelect",
    label: "Gatekeeper Select",
    category: "Inputs",
    canHaveChildren: false,
    Component: GatekeeperSelect,
  },
  {
    type: "SQLinjectionSelect",
    label: "SQL Injection Select",
    category: "Inputs",
    canHaveChildren: false,
    Component: SQLinjectionSelect,
  },

  // Buttons
  {
    type: "FinishButton",
    label: "Finish Button",
    category: "Buttons",
    canHaveChildren: false,
    Component: FinishButton,
  },
  {
    type: "WeiterButton",
    label: "Weiter Button",
    category: "Buttons",
    canHaveChildren: false,
    Component: WeiterButton,
  },
  {
    type: "RecordButton",
    label: "Record Button",
    category: "Buttons",
    canHaveChildren: false,
    Component: RecordButton,
  },

  // Containers
  {
    type: "SimpleFieldset",
    label: "Simple Fieldset",
    category: "Containers",
    canHaveChildren: true,
    Component: SimpleFieldset,
  },
  {
    type: "ConBlock",
    label: "Con Block",
    category: "Containers",
    canHaveChildren: true,
    Component: ConBlock,
  },
  {
    type: "Gate",
    label: "Gate",
    category: "Containers",
    canHaveChildren: true,
    Component: Gate,
  },
  {
    type: "GateGroup",
    label: "Gate Group",
    category: "Containers",
    canHaveChildren: true,
    Component: GateGroup,
  },

  // Media
  {
    type: "Bild",
    label: "Bild",
    category: "Media",
    canHaveChildren: false,
    Component: Bild,
  },
];

export {
  SimpleInput,
  SimpleFieldset,
  Bild,
  ConBlock,
  FinishButton,
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
