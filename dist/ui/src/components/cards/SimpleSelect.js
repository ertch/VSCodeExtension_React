"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SimpleSelectCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const simpleSelectConfig = {
    canBeParent: false,
    attributes: [
        { name: 'options', type: 'double_list', toolTip: 'Array of options [[value, label], ...]', optional: false },
        { name: 'actions', type: 'tripple_list', toolTip: 'Array of actions for option triggers', optional: true },
        { name: 'firstOption', type: 'double_single', toolTip: 'First option [value, label]', optional: true },
        { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
        { name: 'required', type: 'checkbox', toolTip: 'Whether this select is required', optional: false },
        { name: 'disabled', type: 'checkbox', toolTip: 'Disable this select', optional: false },
        { name: 'hidden', type: 'checkbox', toolTip: 'Hide this select', optional: false },
        { name: 'data-required', type: 'string', toolTip: 'Required value validation', optional: true },
        { name: 'onchange', type: 'function', toolTip: 'Function to call on change', optional: true },
        { name: 'data-trigger', type: 'double_single', toolTip: 'Trigger actions array', optional: true },
        { name: 'data-preset', type: 'string', toolTip: 'Preset value for this select', optional: true },
        { name: 'data-submit', type: 'tripple_single', toolTip: 'Submit target for this select', optional: true },
    ],
    renderPreview: (name, id) => ( // Preview card HTML
    (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: `${id}_select`, children: name }), (0, jsx_runtime_1.jsx)("span", { className: "errormessage" })] }), (0, jsx_runtime_1.jsxs)("select", { className: "dropdown h-drop", children: [(0, jsx_runtime_1.jsx)("option", { value: "", disabled: true, children: "[Bitte ausw\u00E4hlen]" }), (0, jsx_runtime_1.jsx)("option", { value: "option1", children: "Option 1" }), (0, jsx_runtime_1.jsx)("option", { value: "option2", children: "Option 2" })] })] }))
};
function SimpleSelectCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: simpleSelectConfig });
}
//# sourceMappingURL=SimpleSelect.js.map