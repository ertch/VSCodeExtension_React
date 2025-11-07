"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SimpleInputCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const simpleInputConfig = {
    defaultName: 'SimpleInput',
    codegenName: 'SimpleInput',
    canBeParent: false,
    attributes: [
        { name: 'type', type: 'string', toolTip: '', optional: false },
        { name: 'class', type: 'string', toolTip: '', optional: false },
        { name: 'value', type: 'string', toolTip: '', optional: false },
        { name: 'required', type: 'checkbox', toolTip: '', optional: false },
        { name: 'disabled', type: 'checkbox', toolTip: '', optional: false },
        { name: 'maxlength', type: 'string', toolTip: '', optional: true },
        { name: 'pattern', type: 'string', toolTip: 'regExP', optional: true },
        { name: 'data-preset', type: 'string', toolTip: '', optional: true },
        { name: 'onchange', type: 'function', toolTip: '', optional: true },
        { name: 'onblur', type: 'function', toolTip: '', optional: true },
        { name: 'data-vali', type: 'string', toolTip: '', optional: true },
        { name: 'data-submit', type: 'tripple_submit', toolTip: 'Hallo Ich blockiere dich', optional: true },
        { name: 'data-call', type: 'string', toolTip: '', optional: true },
        { name: 'min', type: 'string', toolTip: '', optional: true },
        { name: 'max', type: 'string', toolTip: '', optional: true },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("label", { htmlFor: `${id}_input`, children: name }) }), (0, jsx_runtime_1.jsx)("input", { className: 'input-text' })] }))
};
function SimpleInputCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: simpleInputConfig });
}
//# sourceMappingURL=SimpleInput.js.map