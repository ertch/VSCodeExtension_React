"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input_Function;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Input_Function - Function name input component
 *
 * Used for function reference attributes (e.g., onchange, onblur callbacks).
 * Accepts function names that will be validated during code generation.
 */
function Input_Function({ name }) {
    return ((0, jsx_runtime_1.jsx)("input", { type: "text", name: name, className: "input-text", placeholder: "functionName", pattern: "[a-zA-Z_][a-zA-Z0-9_]*", title: "Function name (letters, numbers, underscore)" }));
}
//# sourceMappingURL=Input_Function.js.map