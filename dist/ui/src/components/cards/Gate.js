"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GateCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const Slot_1 = require("../canvas/Slot");
const gateConfig = {
    defaultName: 'Gate',
    codegenName: 'Gate',
    canBeParent: true,
    attributes: [
        { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das Gate-Element', optional: true },
        { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Gates', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'Gate initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
    ],
    renderPreview: (name, id, slotProps) => ((0, jsx_runtime_1.jsxs)("section", { id: id, style: { border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', fontWeight: 'bold', color: '#555', marginBottom: '8px' }, children: name }), slotProps && (0, jsx_runtime_1.jsx)(Slot_1.Slot, { innerRef: slotProps.ref, isEmpty: slotProps.isEmpty, children: slotProps.children })] }))
};
function GateCard({ id, slotProps }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: gateConfig, slotProps: slotProps });
}
//# sourceMappingURL=Gate.js.map