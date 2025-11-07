"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Select_Actions;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Select_Actions - Action selector component
 *
 * Provides dropdown for selecting actions in tripple inputs (trigger-action-target).
 * Used by Input_TrippleList for selecting what action to perform.
 */
function Select_Actions(props) {
    return ((0, jsx_runtime_1.jsxs)("select", { name: props.id, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "-- Bitte W\u00E4hlen --" }), (0, jsx_runtime_1.jsx)("option", { value: "open", children: "Open" }), (0, jsx_runtime_1.jsx)("option", { value: "openOnly", children: "open Only" }), (0, jsx_runtime_1.jsx)("option", { value: "close", children: "Close" }), (0, jsx_runtime_1.jsx)("option", { value: "all", children: "All (in Gate)" }), (0, jsx_runtime_1.jsx)("option", { value: "disable", children: "Disable" })] }));
}
//# sourceMappingURL=Select_Actions.js.map