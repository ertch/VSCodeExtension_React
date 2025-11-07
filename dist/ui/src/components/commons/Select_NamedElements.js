"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Select_NamedElements;
const jsx_runtime_1 = require("react/jsx-runtime");
const NamedElementsContext_1 = require("../../contexts/NamedElementsContext");
function Select_NamedElements(props) {
    const { namedElements } = (0, NamedElementsContext_1.useNamedElements)();
    return ((0, jsx_runtime_1.jsxs)("select", { name: props.name, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "--Bitte w\u00E4hlen--" }), namedElements.map((element) => ((0, jsx_runtime_1.jsx)("option", { value: element.id, children: element.name }, element.id)))] }));
}
//# sourceMappingURL=Select_NamedElements.js.map