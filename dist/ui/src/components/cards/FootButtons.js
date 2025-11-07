"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = FootButtonsCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const footButtonsConfig = {
    defaultName: 'FootButtons',
    codegenName: 'FootButtons',
    canBeParent: false,
    attributes: [],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsx)("div", { id: id, className: "footer", children: (0, jsx_runtime_1.jsxs)("div", { id: "footer_button", children: [(0, jsx_runtime_1.jsx)("div", { className: "go", id: "div_go_negativ", children: (0, jsx_runtime_1.jsxs)("button", { id: "go_negativ", type: "button", "data-id": "freedial", className: "calldialog", children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-telephone" }), "Freedial"] }) }), (0, jsx_runtime_1.jsx)("div", { className: "go", id: "div_go_wiedervorlage", children: (0, jsx_runtime_1.jsxs)("button", { id: "go_wiedervorlage", type: "button", "data-id": "recall", className: "calldialog", children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-calendar" }), "Wiedervorlage"] }) }), (0, jsx_runtime_1.jsx)("div", { className: "go", id: "div_go_ane", children: (0, jsx_runtime_1.jsxs)("button", { id: "go_ane", type: "button", "data-id": "apne", className: "calldialog", children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-apne" }), "APNE"] }) }), (0, jsx_runtime_1.jsx)("form", { action: "#", method: "POST", id: "finish_abfax", children: (0, jsx_runtime_1.jsx)("div", { className: "go", id: "div_go_abfax", children: (0, jsx_runtime_1.jsxs)("button", { id: "go_abfax", onClick: () => { }, children: [(0, jsx_runtime_1.jsx)("i", { className: "glyph glyph-abfax" }), "AB/Fax/Modem"] }) }) })] }) }))
};
function FootButtonsCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: footButtonsConfig });
}
//# sourceMappingURL=FootButtons.js.map