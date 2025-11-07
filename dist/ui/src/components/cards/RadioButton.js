"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RadioButtonCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const radioButtonConfig = {
    defaultName: 'RadioButton',
    codegenName: 'RadioButton',
    canBeParent: false,
    attributes: [
        { name: 'name', type: 'string', toolTip: 'Radio button group name', optional: false },
        { name: 'required', type: 'checkbox', toolTip: 'Whether this radio button is required', optional: false },
        { name: 'value', type: 'string', toolTip: 'Value of this radio button option', optional: false },
        { name: 'data-submit', type: 'string', toolTip: 'Submit target for this radio button', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'Hide this radio button', optional: false },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsxs)("div", { className: "radio-option", children: [(0, jsx_runtime_1.jsx)("input", { className: "radio-option__input", type: "radio" }), (0, jsx_runtime_1.jsx)("label", { className: "radio-option__label", htmlFor: `${id}_input`, children: name })] }) }))
};
function RadioButtonCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: radioButtonConfig });
}
//# sourceMappingURL=RadioButton.js.map