"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Slot = Slot;
const jsx_runtime_1 = require("react/jsx-runtime");
function Slot({ children, isEmpty, innerRef }) {
    return ((0, jsx_runtime_1.jsx)("div", { ref: innerRef, className: `canvas-children-column ${isEmpty ? '' : 'has-children'}`, children: isEmpty ? ((0, jsx_runtime_1.jsx)("div", { className: "canvas-children-empty", children: "Drop hier hinein..." })) : (children) }));
}
//# sourceMappingURL=Slot.js.map