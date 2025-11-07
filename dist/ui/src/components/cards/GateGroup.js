"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GateGroupCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const Slot_1 = require("../canvas/Slot");
const gateGroupConfig = {
    defaultName: 'GateGroup',
    codegenName: 'GateGroup',
    canBeParent: true,
    attributes: [
        { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung - definiert zu welcher Gruppe dieses GateGroup gehört', optional: false },
        { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das GateGroup-Element', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'GateGroup initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
    ],
    renderPreview: (name, id, slotProps) => ((0, jsx_runtime_1.jsxs)("div", { id: id, style: { border: '2px dashed #aaa', padding: '12px', borderRadius: '6px', backgroundColor: '#f9f9f9' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }, children: name }), slotProps && (0, jsx_runtime_1.jsx)(Slot_1.Slot, { innerRef: slotProps.ref, isEmpty: slotProps.isEmpty, children: slotProps.children })] }))
};
function GateGroupCard({ id, slotProps }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: gateGroupConfig, slotProps: slotProps });
}
//# sourceMappingURL=GateGroup.js.map