"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = GatekeeperSelectCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const gatekeeperSelectConfig = {
    defaultName: 'GatekeeperSelect',
    codegenName: 'GatekeeperSelect',
    canBeParent: false,
    attributes: [
        { name: 'options', type: 'string', toolTip: 'Array of options [[value, label], ...]', optional: false },
        { name: 'actions', type: 'string', toolTip: 'Gatekeeper actions array [[value, action, target], ...]', optional: true },
        { name: 'firstOption', type: 'string', toolTip: 'First option [value, label]', optional: true },
        { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
        { name: 'required', type: 'checkbox', toolTip: 'Whether this select is required', optional: false },
        { name: 'disabled', type: 'checkbox', toolTip: 'Disable this select', optional: false },
        { name: 'data-gate', type: 'string', toolTip: 'Gate group identifier', optional: true },
        { name: 'data-lock', type: 'checkbox', toolTip: 'Lock page navigation', optional: true },
        { name: 'data-call', type: 'string', toolTip: 'Additional functions to call', optional: true },
        { name: 'data-preset', type: 'string', toolTip: 'Preset value for this select', optional: true },
        { name: 'data-submit', type: 'string', toolTip: 'Submit target for this select', optional: true },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: `${id}_select`, children: name }), (0, jsx_runtime_1.jsx)("span", { className: "errormessage" })] }), (0, jsx_runtime_1.jsxs)("select", { className: "dropdown h-drop", children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Bitte Ausw\u00E4hlen" }), (0, jsx_runtime_1.jsx)("option", { value: "option1", children: "Option 1" }), (0, jsx_runtime_1.jsx)("option", { value: "option2", children: "Option 2" })] })] }))
};
function GatekeeperSelectCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: gatekeeperSelectConfig });
}
//# sourceMappingURL=GatekeeperSelect.js.map