"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TabPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function TabPage({ children, initialName = 'New TabPage', tabNumber = 0, onNameChange, onTabIndexChange, minTabIndex = 1, maxTabIndex = 99 }) {
    const [tabName, setTabName] = (0, react_1.useState)(initialName);
    const [stateTabNumber, setStateTabNumber] = (0, react_1.useState)(tabNumber);
    // Sync props to state when they change
    (0, react_1.useEffect)(() => {
        setTabName(initialName);
    }, [initialName]);
    (0, react_1.useEffect)(() => {
        setStateTabNumber(tabNumber);
    }, [tabNumber]);
    const handleNewName = (event) => {
        const newName = event.target.value;
        setTabName(newName);
        onNameChange?.(newName);
    };
    const handleNewTabNumber = (event) => {
        const newNumber = Number(event.target.value);
        setStateTabNumber(newNumber);
        onTabIndexChange?.(newNumber);
    };
    return ((0, jsx_runtime_1.jsxs)("section", { className: 'page_content', "data-tab": tabNumber, children: [(0, jsx_runtime_1.jsx)("strong", { className: 'name--light', children: tabName }), (0, jsx_runtime_1.jsxs)("details", { children: [(0, jsx_runtime_1.jsx)("summary", { children: "Attribute" }), (0, jsx_runtime_1.jsxs)("div", { className: 'tab-attributes', children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: 'tabName', children: "Tab Name" }), (0, jsx_runtime_1.jsx)("input", { id: 'tabName', name: 'TabName', type: "text", placeholder: "New TabPage", value: tabName, onChange: handleNewName })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: 'tabIndex', children: "Tab Index (Reihenfolge)" }), (0, jsx_runtime_1.jsx)("input", { id: 'tabIndex', name: 'TabIndex', type: "number", min: minTabIndex, max: maxTabIndex, value: stateTabNumber, onChange: handleNewTabNumber })] })] })] }), children] }));
}
//# sourceMappingURL=TabPage.js.map