"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input_String;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Input_String - Simple text input component
 *
 * Used for basic string attributes in card components.
 * Wraps native HTML input for consistency with other input components.
 */
function Input_String({ name }) {
    return ((0, jsx_runtime_1.jsx)("input", { type: "text", name: name, className: "input-text", placeholder: "Enter text..." }));
}
//# sourceMappingURL=Input_String.js.map