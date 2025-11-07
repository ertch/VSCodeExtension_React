"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BildCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const BaseCard_1 = __importDefault(require("./CardLayout/BaseCard"));
const bildConfig = {
    defaultName: 'Bild',
    codegenName: 'Bild',
    canBeParent: false,
    attributes: [
        { name: 'dateiname', type: 'string', toolTip: 'Filename of the image (path will be added automatically)', optional: false },
    ],
    renderPreview: (name, id) => ((0, jsx_runtime_1.jsx)(jsx_runtime_1.Fragment, { children: (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("img", { src: "placeholder.png", alt: name, style: { maxWidth: '100%', height: 'auto' } }) }) }))
};
function BildCard({ id }) {
    return (0, jsx_runtime_1.jsx)(BaseCard_1.default, { id: id, config: bildConfig });
}
//# sourceMappingURL=Bild.js.map