"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabButton;
const jsx_runtime_1 = require("react/jsx-runtime");
function TabButton({ tab, isActive, onSwitch, onDelete }) {
    return ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: onSwitch, className: `canvas-tab ${isActive ? 'active' : ''}`, children: [tab.isFixed ? tab.name : `${tab.tabIndex}. ${tab.name}`, !tab.isFixed && ((0, jsx_runtime_1.jsx)("span", { onClick: (e) => {
                    e.stopPropagation();
                    onDelete();
                }, className: "canvas-tab-close", title: "Tab l\u00F6schen", children: "\u00D7" }))] }));
}
//# sourceMappingURL=TabButton.js.map