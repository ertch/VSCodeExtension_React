"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const React = require("react");
require("../index.css");
function Layout({ children }) {
    return (React.createElement("main", { className: 'layout_grid' }, children));
}
