"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Canvas;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const adapter_1 = require("@atlaskit/pragmatic-drag-and-drop/element/adapter");
const extractInputs_1 = require("../utils/extractInputs");
const NamedElementsContext_1 = require("../contexts/NamedElementsContext");
const tabState_1 = require("../utils/tabState");
const tree_utils_1 = require("./canvas/tree-utils");
const components_1 = require("./canvas/components");
const NodeWrapper_1 = require("./canvas/NodeWrapper");
const TabNavigation_1 = __importDefault(require("./canvas/tab-system/TabNavigation"));
const CanvasForm_1 = __importDefault(require("./canvas/canvas-form/CanvasForm"));
const downloadJSON_1 = require("../utils/downloadJSON");
// -----------------------
// Canvas-Komponente
// -----------------------
function Canvas({ palette, initialNodes = [] }) {
    const paletteMap = (0, react_1.useMemo)(() => {
        const map = {};
        palette.forEach((p) => (map[p.type] = p));
        return map;
    }, [palette]);
    const [tabState, setTabState] = (0, react_1.useState)(() => (0, tabState_1.initTabState)(initialNodes.length ? initialNodes : []));
    const activeTab = tabState.tabs.find(t => t.id === tabState.activeTabId);
    const tree = activeTab.tree;
    const [exportJson, setExportJson] = (0, react_1.useState)("");
    const [isDetailsOpen, setIsDetailsOpen] = (0, react_1.useState)(false);
    const [showMetaForm, setShowMetaForm] = (0, react_1.useState)(false);
    const formRef = (0, react_1.useRef)(null);
    const metaFormRef = (0, react_1.useRef)(null);
    // Unique Context ID für diesen Canvas (verhindert Cross-Canvas Drops)
    const uniqueContextId = (0, react_1.useMemo)(() => Symbol('canvas-context'), []);
    const createNodeFromType = (0, react_1.useCallback)((type) => {
        const meta = paletteMap[type];
        if (!meta)
            return null;
        return {
            id: (0, tree_utils_1.genId)(),
            type: meta.type,
            canHaveChildren: !!meta.canHaveChildren,
            props: {},
            children: [],
        };
    }, [paletteMap]);
    const performDrop = (0, react_1.useCallback)(({ dropTargetId, zone, payload }) => {
        if (!payload)
            return;
        let next = (0, tree_utils_1.cloneDeep)(tree);
        if (payload.kind === "NEW") {
            const newNode = createNodeFromType(payload.type);
            if (!newNode)
                return;
            (0, tree_utils_1.insertNode)(next, dropTargetId, zone, newNode);
            setTabState(prev => (0, tabState_1.updateTabTree)(prev, tabState.activeTabId, next));
        }
        else if (payload.kind === "MOVE") {
            const movingId = payload.nodeId;
            if (movingId === dropTargetId)
                return;
            if (dropTargetId && (0, tree_utils_1.isDescendant)(next, dropTargetId, movingId))
                return;
            const movingNode = (0, tree_utils_1.removeNode)(next, movingId);
            if (!movingNode)
                return;
            (0, tree_utils_1.insertNode)(next, dropTargetId, zone, movingNode);
            setTabState(prev => (0, tabState_1.updateTabTree)(prev, tabState.activeTabId, next));
        }
    }, [tree, createNodeFromType, tabState.activeTabId]);
    const handleDelete = (0, react_1.useCallback)((id) => {
        const next = (0, tree_utils_1.cloneDeep)(tree);
        (0, tree_utils_1.removeNode)(next, id);
        setTabState(prev => (0, tabState_1.updateTabTree)(prev, tabState.activeTabId, next));
    }, [tree, tabState.activeTabId]);
    const renderNode = (0, react_1.useCallback)((node) => {
        const meta = paletteMap[node.type];
        if (!meta) {
            return ((0, jsx_runtime_1.jsxs)("div", { className: "canvas-node-wrapper", style: { borderColor: "#ef4444" }, children: ["Unbekannte Komponente: ", node.type] }, node.id));
        }
        return ((0, jsx_runtime_1.jsx)(NodeWrapper_1.NodeWrapper, { node: node, meta: meta, onDelete: handleDelete, uniqueContextId: uniqueContextId, children: node.children?.map((child) => renderNode(child)) }, node.id));
    }, [paletteMap, handleDelete, uniqueContextId]);
    const serializeCurrentTabFromDOM = (0, react_1.useCallback)(() => {
        const root = formRef.current;
        if (!root)
            return [];
        const visit = (node) => {
            const wrapperEl = root.querySelector(`[data-node-id="${node.id}"]`);
            const inputs = wrapperEl ? (0, extractInputs_1.extractInputsFromElement)(wrapperEl) : {};
            return {
                id: node.id,
                type: node.type,
                inputs,
                children: (node.children || []).map(visit),
            };
        };
        return tree.map(visit);
    }, [tree]);
    const handleReadCanvas = (0, react_1.useCallback)(async () => {
        // Sortiere Tabs nach tabIndex (wichtig für Reihenfolge!)
        const sortedTabs = [...tabState.tabs].sort((a, b) => a.tabIndex - b.tabIndex);
        const originalActiveTabId = tabState.activeTabId;
        const results = [];
        // Durchlaufe ALLE Tabs und lese Inputs aus
        for (const tab of sortedTabs) {
            // Tab aktivieren (um Inputs aus DOM zu lesen)
            setTabState(prev => (0, tabState_1.switchTab)(prev, tab.id));
            // Warten bis DOM gerendert ist (React Batch Update)
            await new Promise(resolve => setTimeout(resolve, 50));
            // Jetzt Inputs vom aktiven Tab auslesen
            const root = formRef.current;
            if (root) {
                const visit = (node) => {
                    const wrapperEl = root.querySelector(`[data-node-id="${node.id}"]`);
                    const inputs = wrapperEl ? (0, extractInputs_1.extractInputsFromElement)(wrapperEl) : {};
                    return {
                        id: node.id,
                        type: node.type,
                        inputs,
                        children: (node.children || []).map(visit),
                    };
                };
                results.push({
                    type: "TabPage",
                    name: tab.name,
                    tabIndex: tab.tabIndex,
                    children: tab.tree.map(visit)
                });
            }
        }
        // Zurück zum ursprünglichen Tab
        setTabState(prev => (0, tabState_1.switchTab)(prev, originalActiveTabId));
        // Dialog öffnen mit gesammelten Daten
        const json = JSON.stringify(results, null, 2);
        setExportJson(json);
        setIsDetailsOpen(true);
    }, [tabState.tabs, tabState.activeTabId]);
    const handleLoadCanvas = (0, react_1.useCallback)(() => {
        console.log('Canvas laden - noch nicht implementiert');
    }, []);
    const handleGenerateAstroCode = (0, react_1.useCallback)(async (event) => {
        event.preventDefault();
        if (!metaFormRef.current)
            return;
        const formData = new FormData(metaFormRef.current);
        const metadata = {
            campaignNr: formData.get('campaignNr'),
            campaignTitle: formData.get('campaignTitle'),
            headerTitle: formData.get('headerTitle'),
            headerImg: formData.get('headerImg'),
        };
        // JSON-Daten parsen
        const jsonData = JSON.parse(exportJson);
        // TODO: AstroMerger wurde im Refactoring entfernt
        // Das Feature muss neu implementiert werden mit dem refactored CodeGenerator
        console.warn('Astro export temporarily disabled during refactoring');
        // Fallback: JSON export
        (0, downloadJSON_1.downloadJSON)(jsonData, 'export.json');
        // Formular schließen
        setShowMetaForm(false);
    }, [exportJson]);
    const addViaClick = (type) => {
        const node = createNodeFromType(type);
        if (!node)
            return;
        setTabState((prev) => (0, tabState_1.updateTabTree)(prev, prev.activeTabId, [...tree, node]));
    };
    const handleAddTab = (0, react_1.useCallback)(() => {
        const name = `Tab ${tabState.tabs.length - 1}`;
        setTabState(prev => (0, tabState_1.addTab)(prev, name));
    }, [tabState.tabs.length]);
    const handleClearTab = (0, react_1.useCallback)(() => {
        setTabState(prev => (0, tabState_1.updateTabTree)(prev, prev.activeTabId, []));
        setExportJson("");
    }, []);
    // Globaler Monitor: Fängt alle Drop-Events ab und verarbeitet sie zentral
    (0, react_1.useEffect)(() => {
        return (0, adapter_1.monitorForElements)({
            canMonitor: ({ source }) => source.data.contextId === uniqueContextId,
            onDrop: ({ location, source }) => {
                const { dropTargets } = location.current;
                if (dropTargets.length === 0) {
                    return;
                }
                // Nimm das INNERSTE Drop-Target (Index 0 ist das tiefste/innerste)
                const [innermostTarget] = dropTargets;
                const dropTargetId = innermostTarget.data.nodeId;
                const zone = innermostTarget.data.zone;
                // Verarbeite den Drop einmalig über die zentrale Funktion
                performDrop({
                    dropTargetId: dropTargetId ?? null,
                    zone,
                    payload: source.data,
                });
            },
        });
    }, [uniqueContextId, performDrop]);
    return ((0, jsx_runtime_1.jsxs)(NamedElementsContext_1.NamedElementsProvider, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "canvas-layout", children: [(0, jsx_runtime_1.jsxs)("div", { className: "canvas-area", children: [(0, jsx_runtime_1.jsx)(TabNavigation_1.default, { tabState: tabState, onTabSwitch: (tabId) => setTabState(prev => (0, tabState_1.switchTab)(prev, tabId)), onTabDelete: (tabId) => setTabState(prev => (0, tabState_1.deleteTab)(prev, tabId)), onTabAdd: handleAddTab }), (0, jsx_runtime_1.jsx)(CanvasForm_1.default, { formRef: formRef, tabState: tabState, renderNode: renderNode, uniqueContextId: uniqueContextId, onRead: handleReadCanvas, onLoad: handleLoadCanvas, onClear: handleClearTab, onTabNameChange: (tabId, newName) => setTabState(prev => (0, tabState_1.updateTabName)(prev, tabId, newName)), onTabIndexChange: (tabId, newIndex) => setTabState(prev => (0, tabState_1.updateTabIndex)(prev, tabId, newIndex)) })] }), (0, jsx_runtime_1.jsx)(components_1.Sidebar, { palette: palette, onAddClick: addViaClick, uniqueContextId: uniqueContextId })] }), isDetailsOpen && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "confirm-dialog-backdrop", onClick: () => setIsDetailsOpen(false) }), (0, jsx_runtime_1.jsxs)("div", { className: "confirm-dialog canvas-details", role: "dialog", "aria-modal": "true", "aria-labelledby": "canvas-details-title", children: [(0, jsx_runtime_1.jsxs)("div", { className: "confirm-dialog__header", children: [(0, jsx_runtime_1.jsx)("h3", { id: "canvas-details-title", children: "Canvas Details" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setIsDetailsOpen(false), className: "closedialog", children: (0, jsx_runtime_1.jsx)("span", { className: "glyph glyph-close" }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "canvas-details__content", children: [(0, jsx_runtime_1.jsx)("textarea", { readOnly: true, value: exportJson, className: "canvas-details__json", placeholder: "Noch keine Daten exportiert..." }), (0, jsx_runtime_1.jsxs)("div", { className: "canvas-details__actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--primary", onClick: async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(exportJson);
                                                        console.log('JSON in Zwischenablage kopiert');
                                                    }
                                                    catch (err) {
                                                        console.error('Kopieren fehlgeschlagen:', err);
                                                    }
                                                }, children: "JSON Text kopieren" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--primary", onClick: () => (0, downloadJSON_1.downloadJSON)(exportJson), children: "JSON exportieren" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--secondary", onClick: () => {
                                                    setIsDetailsOpen(false);
                                                    setShowMetaForm(true);
                                                }, disabled: !exportJson, children: "Code generieren" })] })] })] })] })), showMetaForm && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "confirm-dialog-backdrop", onClick: () => setShowMetaForm(false) }), (0, jsx_runtime_1.jsxs)("div", { className: "confirm-dialog canvas-details", role: "dialog", "aria-modal": "true", "aria-labelledby": "meta-form-title", children: [(0, jsx_runtime_1.jsxs)("div", { className: "confirm-dialog__header", children: [(0, jsx_runtime_1.jsx)("h3", { id: "meta-form-title", children: "Kampagnen-Informationen" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowMetaForm(false), className: "closedialog", children: (0, jsx_runtime_1.jsx)("span", { className: "glyph glyph-close" }) })] }), (0, jsx_runtime_1.jsx)("div", { className: "canvas-details__content", children: (0, jsx_runtime_1.jsxs)("form", { ref: metaFormRef, onSubmit: handleGenerateAstroCode, children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "campaignNr", children: "Campaign Number:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "campaignNr", name: "campaignNr", required: true, placeholder: "z.B. 001" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "campaignTitle", children: "Campaign Title:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "campaignTitle", name: "campaignTitle", required: true, placeholder: "z.B. Meine Kampagne" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "headerTitle", children: "Header Title:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "headerTitle", name: "headerTitle", required: true, placeholder: "z.B. Willkommen" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-group", children: [(0, jsx_runtime_1.jsx)("label", { htmlFor: "headerImg", children: "Header Image:" }), (0, jsx_runtime_1.jsx)("input", { type: "text", id: "headerImg", name: "headerImg", required: true, placeholder: "z.B. header.png" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-actions", children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", className: "canvas-btn canvas-btn--primary", children: "Astro-Datei generieren" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "canvas-btn canvas-btn--secondary", onClick: () => setShowMetaForm(false), children: "Abbrechen" })] })] }) })] })] }))] }));
}
//# sourceMappingURL=Canvas.js.map