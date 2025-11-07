"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConBlockCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const Slot_1 = require("../canvas/Slot");
const conBlockConfig = {
    defaultName: 'ConBlock',
    codegenName: 'ConBlock',
    canBeParent: true,
    attributes: [
        { name: 'If', type: 'string', toolTip: 'JSON-Array für bedingte Logik (z.B. [["field1", "value1"]])', optional: false },
        { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das ConBlock-Element', optional: true },
        { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Elemente', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'ConBlock initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
        { name: 'required', type: 'checkbox', toolTip: 'Markiert das Element als erforderlich', optional: true },
        { name: 'setPosSale', type: 'checkbox', toolTip: 'Aktiviert POS-Sale-Modus für diesen Block', optional: true },
    ],
    renderPreview: (name, id, slotProps) => ((0, jsx_runtime_1.jsxs)("div", { id: id, className: "ifDiv", children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: '#666', marginBottom: '4px' }, children: name }), slotProps && (0, jsx_runtime_1.jsx)(Slot_1.Slot, { innerRef: slotProps.ref, isEmpty: slotProps.isEmpty, children: slotProps.children })] }))
};
function ConBlockCard({ id, slotProps }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: conBlockConfig, slotProps: slotProps });
}
//# sourceMappingURL=ConBlock.js.map