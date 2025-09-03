"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewComponents = void 0;
const Card_1 = require("../../components/Card");
exports.previewComponents = [
    {
        type: "Card",
        label: "Card",
        canHaveChildren: false,
        codeGen: "<Card>", // String ist auch ok
        Component: Card_1.default,
    },
];
