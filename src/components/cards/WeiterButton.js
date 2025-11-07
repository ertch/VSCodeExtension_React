"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WeiterButtonCard;
const BaseCard_1 = require("./CardLayout/BaseCard");
const weiterButtonConfig = {
    defaultName: 'WeiterButton',
    codegenName: 'WeiterButton',
    canBeParent: false,
    attributes: [],
    renderPreview: (name, id) => (React.createElement("div", { className: "go nextpage grid-col_center" },
        React.createElement("div", { id: id, className: "d-none" },
            React.createElement("button", { onClick: () => { }, type: "button", className: "nextpage--btn" },
                React.createElement("i", { className: "glyph glyph-outro" }),
                "Weiter"))))
};
function WeiterButtonCard({ id }) {
    return React.createElement(BaseCard_1.default, { id: id, config: weiterButtonConfig });
}
