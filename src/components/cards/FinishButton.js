"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FinishButtonCard;
const BaseCard_1 = require("./CardLayout/BaseCard");
const finishButtonConfig = {
    defaultName: 'FinishButton',
    codegenName: 'FinishButton',
    canBeParent: false,
    attributes: [
        { name: 'auto', type: 'checkbox', toolTip: 'Automatisch abschließen mit "auto" Parameter', optional: true },
        { name: 'queryLib', type: 'checkbox', toolTip: 'QueryLib-Modus verwenden (sonst "auto")', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'Initial versteckt (d-none Klasse)', optional: true },
    ],
    renderPreview: (name, id) => (React.createElement("div", { className: "absenden", id: id },
        React.createElement("button", { className: "absenden__Btn", type: "button", onClick: () => { } },
            React.createElement("i", { className: "glyph glyph-final" }),
            "\u00A0 Auftrag abschlie\u00DFen")))
};
function FinishButtonCard({ id }) {
    return React.createElement(BaseCard_1.default, { id: id, config: finishButtonConfig });
}
