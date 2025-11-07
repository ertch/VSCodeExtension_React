"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NamedElementsProvider = NamedElementsProvider;
exports.useNamedElements = useNamedElements;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const NamedElementsContext = (0, react_1.createContext)(undefined);
function NamedElementsProvider({ children }) {
    const [namedElements, setNamedElements] = (0, react_1.useState)([]);
    const registerElement = (0, react_1.useCallback)((id, name) => {
        if (!name || name.trim() === '')
            return;
        setNamedElements((prev) => {
            const exists = prev.find((el) => el.id === id);
            if (exists) {
                // Update existing
                return prev.map((el) => (el.id === id ? { id, name } : el));
            }
            // Add new
            return [...prev, { id, name }];
        });
    }, []);
    const unregisterElement = (0, react_1.useCallback)((id) => {
        setNamedElements((prev) => prev.filter((el) => el.id !== id));
    }, []);
    const updateElementName = (0, react_1.useCallback)((id, name) => {
        if (!name || name.trim() === '') {
            // If no name, remove element
            unregisterElement(id);
            return;
        }
        registerElement(id, name);
    }, [registerElement, unregisterElement]);
    const value = (0, react_1.useMemo)(() => ({
        namedElements,
        registerElement,
        unregisterElement,
        updateElementName,
    }), [namedElements, registerElement, unregisterElement, updateElementName]);
    return ((0, jsx_runtime_1.jsx)(NamedElementsContext.Provider, { value: value, children: children }));
}
function useNamedElements() {
    const context = (0, react_1.useContext)(NamedElementsContext);
    if (!context) {
        throw new Error('useNamedElements must be used within NamedElementsProvider');
    }
    return context;
}
//# sourceMappingURL=NamedElementsContext.js.map