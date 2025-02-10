"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Card;
const React = require("react");
require("../index.css");
function Card() {
    return (React.createElement("div", { className: 'mainCanvas' },
        React.createElement("h1", null, "Test"),
        React.createElement("p", null, "hier k\u00F6nnte ihre Werbung stehen")));
}
