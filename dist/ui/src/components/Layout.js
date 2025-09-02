"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const React = require("react");
require("../index.css");
function Layout({ children, sidebar }) {
    return (React.createElement("main", { className: 'layout_grid' },
        sidebar && (React.createElement("aside", { className: 'sidebar' }, sidebar)),
        React.createElement("div", { className: sidebar ? 'mainCanvas' : 'mainCanvas-full' }, children)));
}
