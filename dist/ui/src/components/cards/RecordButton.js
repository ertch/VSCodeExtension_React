"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RecordButtonCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const recordButtonConfig = {
    defaultName: 'RecordButton',
    codegenName: 'RecordButton',
    canBeParent: false,
    attributes: [
        { name: 'showInfo', type: 'checkbox', toolTip: 'Info-Text anzeigen ("Aufnahme läuft nur für Sie")', optional: true },
        { name: 'centered', type: 'checkbox', toolTip: 'Zentrierte Darstellung (--centered Klasse)', optional: true },
        { name: 'txt_info', type: 'string', toolTip: 'Eigener Info-Text (Standard: "Aufnahme läuft nur für Sie")', optional: true },
        { name: 'txt_btn', type: 'string', toolTip: 'Eigener Button-Text (Standard: "Kunden aufnehmen")', optional: true },
        { name: 'callState', type: 'string', toolTip: 'CallState-Parameter für recordBtn-Funktion (Standard: "3")', optional: true },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsxs)("div", { id: id, className: "input_form recordDisplay grid-col_center", children: [(0, jsx_runtime_1.jsxs)("div", { className: "recordDisplay__info d-none", children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-record" }), "Aufnahme l\u00E4uft nur f\u00FCr Sie"] }), (0, jsx_runtime_1.jsx)("div", { className: "go", id: "recordDisplay_Btn", children: (0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => { }, children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-circle" }), "Kunden aufnehmen"] }) })] }))
};
function RecordButtonCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: recordButtonConfig });
}
//# sourceMappingURL=RecordButton.js.map