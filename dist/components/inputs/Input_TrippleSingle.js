"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input_TrippleSingle;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Input_TrippleSingle - Triple value input (comma-separated)
 *
 * Used for attributes that require three related values (e.g., trigger-action-target).
 * Format: "value1, value2, value3"
 */
function Input_TrippleSingle({ name }) {
    return ((0, jsx_runtime_1.jsx)("input", { type: "text", name: name, className: "input-text", placeholder: "trigger, action, target", title: "Format: trigger, action, target (comma-separated)" }));
}
//# sourceMappingURL=Input_TrippleSingle.js.map