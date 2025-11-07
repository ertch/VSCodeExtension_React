"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const NamedElementsContext_1 = require("../../../contexts/NamedElementsContext");
const Input_String_1 = __importDefault(require("../../inputs/Input_String"));
const Input_Checkbox_1 = __importDefault(require("../../inputs/Input_Checkbox"));
const Input_Function_1 = __importDefault(require("../../inputs/Input_Function"));
const Input_DoubleSingle_1 = __importDefault(require("../../inputs/Input_DoubleSingle"));
const Input_TrippleSingle_1 = __importDefault(require("../../inputs/Input_TrippleSingle"));
const Input_TrippleList_1 = __importDefault(require("../../inputs/Input_TrippleList"));
function BaseCard({ id, config, slotProps }) {
    const [name, setName] = (0, react_1.useState)(config.defaultName || '');
    const { updateElementName, unregisterElement } = (0, NamedElementsContext_1.useNamedElements)();
    const handleNewName = (event) => {
        const newName = event.target.value;
        setName(newName);
        updateElementName(id, newName);
    };
    (0, react_1.useEffect)(() => {
        return () => {
            unregisterElement(id);
        };
    }, [id, unregisterElement]);
    const renderInput = (attr) => {
        switch (attr.type) {
            case 'string':
                return (0, jsx_runtime_1.jsx)(Input_String_1.default, { name: attr.name });
            case 'checkbox':
                return (0, jsx_runtime_1.jsx)(Input_Checkbox_1.default, { name: attr.name });
            case 'function':
                return (0, jsx_runtime_1.jsx)(Input_Function_1.default, { name: attr.name });
            case 'double_single':
                return (0, jsx_runtime_1.jsx)(Input_DoubleSingle_1.default, { name: attr.name });
            case 'tripple_single':
                return (0, jsx_runtime_1.jsx)(Input_TrippleSingle_1.default, { name: attr.name });
            case 'tripple_list':
                return (0, jsx_runtime_1.jsx)(Input_TrippleList_1.default, { id: attr.name });
            case 'double_list':
            case 'tripple_submit':
            default:
                return (0, jsx_runtime_1.jsx)("input", { type: "text", name: attr.name });
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'mainCanvas', "data-codegen": config.codegenName, "data-can-be-parent": config.canBeParent, id: id, children: [(0, jsx_runtime_1.jsx)("div", { className: 'preview', children: config.renderPreview(name, id, slotProps) }), (0, jsx_runtime_1.jsxs)("details", { children: [(0, jsx_runtime_1.jsx)("summary", { children: "Attributes" }), (0, jsx_runtime_1.jsxs)("div", { id: `${id}_attributes`, children: [(0, jsx_runtime_1.jsxs)("div", { className: 'attribute-input', id: `${id}_name`, children: [(0, jsx_runtime_1.jsx)("label", { children: "name (required)" }), (0, jsx_runtime_1.jsx)("input", { type: "text", name: "name", onChange: handleNewName, value: name }), (0, jsx_runtime_1.jsx)("div", { children: "Name der Komponente" })] }, `${id}_name`), config.attributes.map((attr) => ((0, jsx_runtime_1.jsxs)("div", { className: 'attribute-input', id: `${id}_${attr.name}`, children: [(0, jsx_runtime_1.jsxs)("label", { children: [attr.name, " ", attr.optional ? '(optional)' : '(required)'] }), renderInput(attr), attr.toolTip && (0, jsx_runtime_1.jsx)("span", { children: attr.toolTip })] }, `${id}_${attr.name}`)))] })] })] }));
}
//# sourceMappingURL=BaseCard.js.map