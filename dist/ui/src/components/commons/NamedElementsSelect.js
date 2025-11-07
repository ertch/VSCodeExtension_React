"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = NamedElementsSelect;
const jsx_runtime_1 = require("react/jsx-runtime");
const NamedElementsContext_1 = require("../../contexts/NamedElementsContext");
function NamedElementsSelect({ value, onChange, placeholder = "Element auswählen...", className, }) {
    const { namedElements } = (0, NamedElementsContext_1.useNamedElements)();
    const handleChange = (e) => {
        if (onChange) {
            onChange(e.target.value);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("select", { value: value, onChange: handleChange, className: className, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: placeholder }), namedElements.map((element) => ((0, jsx_runtime_1.jsx)("option", { value: element.id, children: element.name }, element.id)))] }));
}
//# sourceMappingURL=NamedElementsSelect.js.map