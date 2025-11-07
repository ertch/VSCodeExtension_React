"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Input_Tipple;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const react_1 = require("react");
const Select_Actions_1 = __importDefault(require("../commons/Select_Actions"));
const Select_NamedElements_1 = __importDefault(require("../commons/Select_NamedElements"));
function Input_Tipple(props) {
    const [Amount, setAmount] = (0, react_1.useState)(2);
    return ((0, jsx_runtime_1.jsxs)("div", { className: 'attribute-input_tripple', id: `${props.id}_name`, children: [(0, jsx_runtime_1.jsx)("span", { children: "Tiggerwert" }), (0, jsx_runtime_1.jsx)("span", { children: "Aktion" }), (0, jsx_runtime_1.jsx)("span", { children: "Ziel (Name)" }), [...Array(Amount)].map((_, index) => ((0, jsx_runtime_1.jsxs)(React.Fragment, { children: [(0, jsx_runtime_1.jsx)("input", { type: "text", name: `${props.id}_trigger_${index}` }), (0, jsx_runtime_1.jsx)(Select_Actions_1.default, { id: `${props.id}_action_${index}` }), (0, jsx_runtime_1.jsx)(Select_NamedElements_1.default, { name: `${props.id}_target_id_${index}` })] }, index))), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setAmount(Amount + 1), children: "+" }), Amount > 1 && (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setAmount(Amount - 1), children: "-" })] }, `${props.id}_name`));
}
//# sourceMappingURL=Input_TrippleList.js.map