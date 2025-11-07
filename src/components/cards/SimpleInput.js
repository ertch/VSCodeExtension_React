"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SimpleInputCard;
const BaseCard_1 = require("./CardLayout/BaseCard");
const simpleInputConfig = {
    defaultName: 'SimpleInput',
    codegenName: 'SimpleInput',
    canBeParent: false,
    attributes: [
        { name: 'type', type: 'string', toolTip: '', optional: false },
        { name: 'class', type: 'string', toolTip: '', optional: false },
        { name: 'value', type: 'string', toolTip: '', optional: false },
        { name: 'required', type: 'checkbox', toolTip: '', optional: false },
        { name: 'disabled', type: 'checkbox', toolTip: '', optional: false },
        { name: 'maxlength', type: 'string', toolTip: '', optional: true },
        { name: 'pattern', type: 'string', toolTip: 'regExP', optional: true },
        { name: 'data-preset', type: 'string', toolTip: '', optional: true },
        { name: 'onchange', type: 'function', toolTip: '', optional: true },
        { name: 'onblur', type: 'function', toolTip: '', optional: true },
        { name: 'data-vali', type: 'string', toolTip: '', optional: true },
        { name: 'data-submit', type: 'tripple_submit', toolTip: 'Hallo Ich blockiere dich', optional: true },
        { name: 'data-call', type: 'string', toolTip: '', optional: true },
        { name: 'min', type: 'string', toolTip: '', optional: true },
        { name: 'max', type: 'string', toolTip: '', optional: true },
    ],
    renderPreview: (name, id) => (React.createElement(React.Fragment, null,
        React.createElement("div", null,
            React.createElement("label", { htmlFor: `${id}_input` }, name)),
        React.createElement("input", { className: 'input-text' })))
};
function SimpleInputCard({ id }) {
    return React.createElement(BaseCard_1.default, { id: id, config: simpleInputConfig });
}
