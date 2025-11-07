"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SuggestionInputCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const suggestionInputConfig = {
    defaultName: 'SuggestionInput',
    codegenName: 'SuggestionInput',
    canBeParent: false,
    attributes: [
        { name: 'options', type: 'string', toolTip: 'Array of suggestion options', optional: false },
        { name: 'type', type: 'string', toolTip: 'Input type (e.g., text)', optional: true },
        { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
        { name: 'value', type: 'string', toolTip: 'Default value of the input', optional: true },
        { name: 'required', type: 'checkbox', toolTip: 'Whether this field is required', optional: false },
        { name: 'disabled', type: 'checkbox', toolTip: 'Disable this input', optional: false },
        { name: 'hidden', type: 'checkbox', toolTip: 'Hide this input', optional: false },
        { name: 'maxlength', type: 'string', toolTip: 'Maximum character length', optional: true },
        { name: 'pattern', type: 'string', toolTip: 'Regular expression pattern for validation', optional: true },
        { name: 'data-preset', type: 'string', toolTip: 'Preset value for this input', optional: true },
        { name: 'data-vali', type: 'string', toolTip: 'Validation function name', optional: true },
        { name: 'data-injection', type: 'string', toolTip: 'Injection loader function', optional: true },
        { name: 'data-submit', type: 'string', toolTip: 'Submit target for this input', optional: true },
        { name: 'gatekeeper', type: 'checkbox', toolTip: 'Enable gatekeeper functionality', optional: true },
        { name: 'actions', type: 'string', toolTip: 'Gatekeeper actions array', optional: true },
        { name: 'data-gate', type: 'string', toolTip: 'Gate group identifier', optional: true },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: `${id}_input`, children: name }), (0, jsx_runtime_1.jsx)("span", { className: "errormessage" })] }), (0, jsx_runtime_1.jsx)("input", { className: "input-text suggest", type: "text", list: `${id}_list` }), (0, jsx_runtime_1.jsxs)("datalist", { id: `${id}_list`, className: "suggestion", children: [(0, jsx_runtime_1.jsx)("option", { value: "Suggestion 1" }), (0, jsx_runtime_1.jsx)("option", { value: "Suggestion 2" }), (0, jsx_runtime_1.jsx)("option", { value: "Suggestion 3" })] })] }))
};
function SuggestionInputCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: suggestionInputConfig });
}
//# sourceMappingURL=SuggestionInput.js.map