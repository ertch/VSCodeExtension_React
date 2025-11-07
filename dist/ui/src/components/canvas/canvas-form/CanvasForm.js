"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CanvasForm;
const jsx_runtime_1 = require("react/jsx-runtime");
const TabPage_1 = __importDefault(require("../../cards/TabPage"));
const components_1 = require("../components");
function CanvasForm({ formRef, tabState, renderNode, uniqueContextId, onRead, onLoad, onClear, onTabNameChange, onTabIndexChange }) {
    // Berechne min/max für TabIndex (nur dynamische Tabs zählen)
    const dynamicTabsCount = tabState.tabs.filter(t => !t.isFixed).length;
    const minTabIndex = 1;
    const maxTabIndex = dynamicTabsCount;
    return ((0, jsx_runtime_1.jsxs)("form", { ref: formRef, className: "canvas-form", children: [tabState.tabs.map((tab, index) => ((0, jsx_runtime_1.jsx)("div", { className: tab.id === tabState.activeTabId ? '' : 'd-none', children: (0, jsx_runtime_1.jsx)(TabPage_1.default, { initialName: tab.name, tabNumber: tab.tabIndex, onNameChange: (newName) => onTabNameChange(tab.id, newName), onTabIndexChange: (newIndex) => onTabIndexChange(tab.id, newIndex), minTabIndex: minTabIndex, maxTabIndex: maxTabIndex, children: (0, jsx_runtime_1.jsx)(components_1.RootDropArea, { tree: tab.tree, renderNode: renderNode, uniqueContextId: uniqueContextId }) }) }, tab.id))), (0, jsx_runtime_1.jsxs)("div", { className: "canvas-toolbar", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--primary", onClick: onRead, children: "Canvas auslesen" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--secondary", onClick: onLoad, children: "Canvas laden" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--secondary", onClick: onClear, children: "Canvas leeren" })] })] }));
}
//# sourceMappingURL=CanvasForm.js.map