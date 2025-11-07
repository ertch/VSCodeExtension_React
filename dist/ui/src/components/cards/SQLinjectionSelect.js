"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SQLinjectionSelectCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const sqlInjectionSelectConfig = {
    defaultName: 'SQLinjectionSelect',
    codegenName: 'SQLinjectionSelect',
    canBeParent: false,
    attributes: [
        { name: 'data-injection', type: 'string', toolTip: 'SQL injection loader function', optional: true },
        { name: 'required', type: 'checkbox', toolTip: 'Whether this select is required', optional: false },
        { name: 'data-required', type: 'string', toolTip: 'Required value validation', optional: true },
        { name: 'onchange', type: 'function', toolTip: 'Function to call on change', optional: true },
        { name: 'data-trigger', type: 'string', toolTip: 'Trigger actions array', optional: true },
        { name: 'data-preset', type: 'string', toolTip: 'Preset value for this select', optional: true },
        { name: 'data-submit', type: 'string', toolTip: 'Submit target for this select', optional: true },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: `${id}_select`, children: name }), (0, jsx_runtime_1.jsx)("span", { className: "errormessage" })] }), (0, jsx_runtime_1.jsx)("select", { className: "dropdown h-drop", children: (0, jsx_runtime_1.jsx)("option", { value: "", disabled: true, children: "[Bitte Ausw\u00E4hlen]" }) })] }))
};
function SQLinjectionSelectCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: sqlInjectionSelectConfig });
}
//# sourceMappingURL=SQLinjectionSelect.js.map