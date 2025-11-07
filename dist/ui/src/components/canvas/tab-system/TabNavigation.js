"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabNavigation;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TabButton_1 = __importDefault(require("./TabButton"));
const ConfirmDialog_1 = __importDefault(require("../../shared/ConfirmDialog"));
function TabNavigation({ tabState, onTabSwitch, onTabDelete, onTabAdd }) {
    const [deleteConfirm, setDeleteConfirm] = (0, react_1.useState)(null);
    // Sortiere Tabs nach tabIndex
    const sortedTabs = [...tabState.tabs].sort((a, b) => a.tabIndex - b.tabIndex);
    const handleDeleteClick = (tabId, tabName, hasContent) => {
        setDeleteConfirm({ tabId, tabName, hasContent });
    };
    const handleConfirmDelete = () => {
        if (deleteConfirm) {
            onTabDelete(deleteConfirm.tabId);
            setDeleteConfirm(null);
        }
    };
    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "canvas-tabs", children: [sortedTabs.map(tab => ((0, jsx_runtime_1.jsx)(TabButton_1.default, { tab: tab, isActive: tabState.activeTabId === tab.id, onSwitch: () => onTabSwitch(tab.id), onDelete: () => handleDeleteClick(tab.id, tab.name, tab.tree.length > 0) }, tab.id))), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onTabAdd, className: "canvas-tab-add", title: "Neuen Tab hinzuf\u00FCgen", children: "+ Tab" })] }), (0, jsx_runtime_1.jsx)(ConfirmDialog_1.default, { isOpen: deleteConfirm !== null, title: "Tab l\u00F6schen?", message: deleteConfirm?.hasContent
                    ? `Tab "${deleteConfirm.tabName}" enthält Elemente. Möchten Sie diesen Tab wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`
                    : `Möchten Sie Tab "${deleteConfirm?.tabName}" wirklich löschen?`, confirmText: "L\u00F6schen", cancelText: "Abbrechen", type: "danger", onConfirm: handleConfirmDelete, onCancel: handleCancelDelete })] }));
}
//# sourceMappingURL=TabNavigation.js.map