"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SimpleFieldsetCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const Slot_1 = require("../canvas/Slot");
const simpleFieldsetConfig = {
    defaultName: 'SimpleFieldset',
    codegenName: 'SimpleFieldset',
    canBeParent: true,
    attributes: [
        { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das Fieldset', optional: true },
        { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Fieldsets', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'Fieldset initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
    ],
    renderPreview: (name, id, slotProps) => ((0, jsx_runtime_1.jsxs)("fieldset", { id: id, children: [(0, jsx_runtime_1.jsx)("legend", { children: name }), slotProps && (0, jsx_runtime_1.jsx)(Slot_1.Slot, { innerRef: slotProps.ref, isEmpty: slotProps.isEmpty, children: slotProps.children })] }))
};
function SimpleFieldsetCard({ id, slotProps }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: simpleFieldsetConfig, slotProps: slotProps });
}
//# sourceMappingURL=SimpleFieldset.js.map