"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Card;
const React = require("react");
require("../index.css");
function Card() {
    return (React.createElement("div", { className: 'mainCanvas', "data-codegen": "Card" },
        React.createElement("h1", null, "Test"),
        React.createElement("input", { id: "preview", type: "text" }),
        React.createElement("details", null,
            React.createElement("summary", null, "Attribute"),
            React.createElement("input", { id: 'id', type: "text" }))));
}
