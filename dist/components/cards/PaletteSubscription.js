"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeiterButton = exports.FinishButton = exports.SimpleInput = exports.cardComponents = void 0;
const SimpleInput_1 = __importDefault(require("./SimpleInput"));
exports.SimpleInput = SimpleInput_1.default;
const FinishButton_1 = __importDefault(require("./FinishButton"));
exports.FinishButton = FinishButton_1.default;
const WeiterButton_1 = __importDefault(require("./WeiterButton"));
exports.WeiterButton = WeiterButton_1.default;
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
exports.cardComponents = [
    {
        type: "SimpleInput",
        label: "SimpleInput",
        canHaveChildren: false,
        Component: SimpleInput_1.default,
    },
    {
        type: "FinishButton",
        label: "FinishButton",
        canHaveChildren: false,
        Component: FinishButton_1.default,
    },
    {
        type: "WeiterButton",
        label: "WeiterButton",
        canHaveChildren: false,
        Component: WeiterButton_1.default,
    },
];
//# sourceMappingURL=PaletteSubscription.js.map