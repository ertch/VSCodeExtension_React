"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeiterButton = exports.SimpleTextfield = exports.SuggestionInput = exports.SQLinjectionSelect = exports.SimpleSelect = exports.RecordButton = exports.RadioButton = exports.GatekeeperSelect = exports.GateGroup = exports.Gate = exports.FootButtons = exports.FinishButton = exports.ConBlock = exports.Bild = exports.SimpleFieldset = exports.SimpleInput = exports.cardComponents = void 0;
const SimpleInput_1 = __importDefault(require("./SimpleInput"));
exports.SimpleInput = SimpleInput_1.default;
const SimpleFieldset_1 = __importDefault(require("./SimpleFieldset"));
exports.SimpleFieldset = SimpleFieldset_1.default;
const Bild_1 = __importDefault(require("./Bild"));
exports.Bild = Bild_1.default;
const ConBlock_1 = __importDefault(require("./ConBlock"));
exports.ConBlock = ConBlock_1.default;
const FinishButton_1 = __importDefault(require("./FinishButton"));
exports.FinishButton = FinishButton_1.default;
const FootButtons_1 = __importDefault(require("./FootButtons"));
exports.FootButtons = FootButtons_1.default;
const Gate_1 = __importDefault(require("./Gate"));
exports.Gate = Gate_1.default;
const GateGroup_1 = __importDefault(require("./GateGroup"));
exports.GateGroup = GateGroup_1.default;
const GatekeeperSelect_1 = __importDefault(require("./GatekeeperSelect"));
exports.GatekeeperSelect = GatekeeperSelect_1.default;
const RadioButton_1 = __importDefault(require("./RadioButton"));
exports.RadioButton = RadioButton_1.default;
const RecordButton_1 = __importDefault(require("./RecordButton"));
exports.RecordButton = RecordButton_1.default;
const SimpleSelect_1 = __importDefault(require("./SimpleSelect"));
exports.SimpleSelect = SimpleSelect_1.default;
const SQLinjectionSelect_1 = __importDefault(require("./SQLinjectionSelect"));
exports.SQLinjectionSelect = SQLinjectionSelect_1.default;
const SuggestionInput_1 = __importDefault(require("./SuggestionInput"));
exports.SuggestionInput = SuggestionInput_1.default;
const SimpleTextfield_1 = __importDefault(require("./SimpleTextfield"));
exports.SimpleTextfield = SimpleTextfield_1.default;
const WeiterButton_1 = __importDefault(require("./WeiterButton"));
exports.WeiterButton = WeiterButton_1.default;
exports.cardComponents = [
    {
        type: "SimpleInput", // Type identifier for code gen
        label: "SimpleInput", // Label shown in the palette
        canHaveChildren: false, // enable Dropzone for child components
        Component: SimpleInput_1.default, // actual React component
    },
    {
        type: "SimpleFieldset",
        label: "SimpleFieldset",
        canHaveChildren: true,
        Component: SimpleFieldset_1.default,
    },
    {
        type: "Bild",
        label: "Bild",
        canHaveChildren: false,
        Component: Bild_1.default,
    },
    {
        type: "ConBlock",
        label: "ConBlock",
        canHaveChildren: true,
        Component: ConBlock_1.default,
    },
    {
        type: "FinishButton",
        label: "FinishButton",
        canHaveChildren: false,
        Component: FinishButton_1.default,
    },
    {
        type: "FootButtons",
        label: "FootButtons",
        canHaveChildren: false,
        Component: FootButtons_1.default,
    },
    {
        type: "Gate",
        label: "Gate",
        canHaveChildren: true,
        Component: Gate_1.default,
    },
    {
        type: "GateGroup",
        label: "GateGroup",
        canHaveChildren: true,
        Component: GateGroup_1.default,
    },
    {
        type: "GatekeeperSelect",
        label: "GatekeeperSelect",
        canHaveChildren: false,
        Component: GatekeeperSelect_1.default,
    },
    {
        type: "RadioButton",
        label: "RadioButton",
        canHaveChildren: false,
        Component: RadioButton_1.default,
    },
    {
        type: "RecordButton",
        label: "RecordButton",
        canHaveChildren: false,
        Component: RecordButton_1.default,
    },
    {
        type: "SimpleSelect",
        label: "SimpleSelect",
        canHaveChildren: false,
        Component: SimpleSelect_1.default,
    },
    {
        type: "SQLinjectionSelect",
        label: "SQLinjectionSelect",
        canHaveChildren: false,
        Component: SQLinjectionSelect_1.default,
    },
    {
        type: "SuggestionInput",
        label: "SuggestionInput",
        canHaveChildren: false,
        Component: SuggestionInput_1.default,
    },
    {
        type: "SimpleTextfield",
        label: "SimpleTextfield",
        canHaveChildren: false,
        Component: SimpleTextfield_1.default,
    },
    {
        type: "WeiterButton",
        label: "WeiterButton",
        canHaveChildren: false,
        Component: WeiterButton_1.default,
    },
];
//# sourceMappingURL=index.js.map