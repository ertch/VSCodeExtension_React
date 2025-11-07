"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = WeiterButtonCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const weiterButtonConfig = {
    defaultName: 'WeiterButton',
    codegenName: 'WeiterButton',
    canBeParent: false,
    attributes: [],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsx)("div", { className: "go nextpage grid-col_center", children: (0, jsx_runtime_1.jsx)("div", { id: id, className: "d-none", children: (0, jsx_runtime_1.jsxs)("button", { onClick: () => { }, type: "button", className: "nextpage--btn", children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-outro" }), "Weiter"] }) }) }))
};
function WeiterButtonCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: weiterButtonConfig });
}
//# sourceMappingURL=WeiterButton.js.map