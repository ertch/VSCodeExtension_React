"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input_DoubleSingle;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Input_DoubleSingle - Double value input (comma-separated pair)
 *
 * Used for attributes that require two related values (e.g., value-label pairs).
 * Format: "value, label" or "key, value"
 */
function Input_DoubleSingle({ name }) {
    return ((0, jsx_runtime_1.jsx)("input", { type: "text", name: name, className: "input-text", placeholder: "value, label", title: "Format: value, label (comma-separated)" }));
}
//# sourceMappingURL=Input_DoubleSingle.js.map