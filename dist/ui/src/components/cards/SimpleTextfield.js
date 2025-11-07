"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SimpleTextfieldCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const simpleTextfieldConfig = {
    defaultName: 'SimpleTextfield',
    codegenName: 'SimpleTextfield',
    canBeParent: false,
    attributes: [
        { name: 'row', type: 'string', toolTip: 'Number of rows for the textarea', optional: false },
        { name: 'col', type: 'string', toolTip: 'Number of columns for the textarea', optional: false },
        { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
        { name: 'value', type: 'string', toolTip: 'Default value of the textarea', optional: true },
        { name: 'required', type: 'checkbox', toolTip: 'Whether this field is required', optional: false },
        { name: 'maxlength', type: 'string', toolTip: 'Maximum character length', optional: true },
        { name: 'data-call', type: 'string', toolTip: 'JavaScript function to call', optional: true },
        { name: 'data-vali', type: 'string', toolTip: 'Validation function name', optional: true },
        { name: 'data-submit', type: 'string', toolTip: 'Submit target for this field', optional: true },
        { name: 'hidden', type: 'checkbox', toolTip: 'Hide this textarea', optional: false },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: `${id}_input`, children: name }), (0, jsx_runtime_1.jsx)("span", { className: "errormessage" })] }), (0, jsx_runtime_1.jsx)("textarea", { className: "input-text", rows: 3, cols: 30 })] }))
};
function SimpleTextfieldCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: simpleTextfieldConfig });
}
//# sourceMappingURL=SimpleTextfield.js.map