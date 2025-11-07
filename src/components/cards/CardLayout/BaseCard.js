"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BaseCard;
const react_1 = require("react");
const NamedElementsContext_1 = require("../../../contexts/NamedElementsContext");
const Input_TrippleList_1 = require("../../inputs/Input_TrippleList");
function BaseCard({ id, config, slotProps }) {
    const [name, setName] = (0, react_1.useState)(config.defaultName);
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
            case 'checkbox':
                return React.createElement("input", { type: "checkbox", name: attr.name });
            case 'tripple_list':
                return React.createElement(Input_TrippleList_1.default, { id: attr.name });
            case 'string':
            case 'function':
            case 'double_single':
            case 'double_list':
            case 'tripple_single':
            case 'tripple_submit':
            default:
                return React.createElement("input", { type: "text", name: attr.name });
        }
    };
    return (React.createElement("div", { className: 'mainCanvas', "data-codegen": config.codegenName, "data-can-be-parent": config.canBeParent, id: id },
        React.createElement("div", { className: 'preview' }, config.renderPreview(name, id, slotProps)),
        React.createElement("details", null,
            React.createElement("summary", null, "Attributes"),
            React.createElement("div", { id: `${id}_attributes` },
                React.createElement("div", { className: 'attribute-input', id: `${id}_name`, key: `${id}_name` },
                    React.createElement("label", null, "name (required)"),
                    React.createElement("input", { type: "text", name: "name", onChange: handleNewName, value: name }),
                    React.createElement("div", null, "Name der Komponente")),
                config.attributes.map((attr) => (React.createElement("div", { className: 'attribute-input', id: `${id}_${attr.name}`, key: `${id}_${attr.name}` },
                    React.createElement("label", null,
                        attr.name,
                        " ",
                        attr.optional ? '(optional)' : '(required)'),
                    renderInput(attr),
                    attr.toolTip && React.createElement("span", null, attr.toolTip))))))));
}
