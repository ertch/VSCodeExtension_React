"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FinishButtonCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const finishButtonConfig = {
    defaultName: 'FinishButton',
    codegenName: 'FinishButton',
    canBeParent: false,
    attributes: [
        { name: 'auto', type: 'checkbox', toolTip: 'Automatisch abschließen mit "auto" Parameter', optional: true },
        { name: 'queryLib', type: 'checkbox', toolTip: 'QueryLib-Modus verwenden (sonst "auto")', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'Initial versteckt (d-none Klasse)', optional: true },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsx)("div", { className: "absenden", id: id, children: (0, jsx_runtime_1.jsxs)("button", { className: "absenden__Btn", type: "button", onClick: () => { }, children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-final" }), "\u00A0 Auftrag abschlie\u00DFen"] }) }))
};
function FinishButtonCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: finishButtonConfig });
}
//# sourceMappingURL=FinishButton.js.map