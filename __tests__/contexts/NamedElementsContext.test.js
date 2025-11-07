"use strict";
/**
 * NamedElementsContext Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = require("@testing-library/react");
const NamedElementsContext_1 = require("../../src/contexts/NamedElementsContext");
const react_2 = require("react");
describe('NamedElementsContext', () => {
    const wrapper = ({ children }) => (react_2.default.createElement(NamedElementsContext_1.NamedElementsProvider, null, children));
    it('should start with empty elements', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        expect(result.current.namedElements).toEqual([]);
    });
    it('should register new element', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
        });
        expect(result.current.namedElements).toHaveLength(1);
        expect(result.current.namedElements[0]).toEqual({ id: 'node1', name: 'Element 1' });
    });
    it('should update existing element on re-register', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Old Name');
        });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'New Name');
        });
        expect(result.current.namedElements).toHaveLength(1);
        expect(result.current.namedElements[0].name).toBe('New Name');
    });
    it('should unregister element', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
        });
        (0, react_1.act)(() => {
            result.current.unregisterElement('node1');
        });
        expect(result.current.namedElements).toEqual([]);
    });
    it('should update element name', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Old Name');
        });
        (0, react_1.act)(() => {
            result.current.updateElementName('node1', 'New Name');
        });
        expect(result.current.namedElements).toHaveLength(1);
        expect(result.current.namedElements[0].name).toBe('New Name');
    });
    it('should remove element when name is empty', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
        });
        (0, react_1.act)(() => {
            result.current.updateElementName('node1', '');
        });
        expect(result.current.namedElements).toEqual([]);
    });
    it('should remove element when name is whitespace', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
        });
        (0, react_1.act)(() => {
            result.current.updateElementName('node1', '   ');
        });
        expect(result.current.namedElements).toEqual([]);
    });
    it('should not register element with empty name', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', '');
        });
        expect(result.current.namedElements).toEqual([]);
    });
    it('should not register element with whitespace name', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', '   ');
        });
        expect(result.current.namedElements).toEqual([]);
    });
    it('should throw error when used outside provider', () => {
        // Suppress console.error for this test
        const consoleError = console.error;
        console.error = jest.fn();
        expect(() => {
            (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)());
        }).toThrow('useNamedElements must be used within NamedElementsProvider');
        console.error = consoleError;
    });
    it('should handle multiple elements', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
            result.current.registerElement('node2', 'Element 2');
            result.current.registerElement('node3', 'Element 3');
        });
        expect(result.current.namedElements).toHaveLength(3);
        expect(result.current.namedElements.map(el => el.id)).toEqual(['node1', 'node2', 'node3']);
    });
    it('should preserve other elements when unregistering', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
            result.current.registerElement('node2', 'Element 2');
            result.current.registerElement('node3', 'Element 3');
        });
        (0, react_1.act)(() => {
            result.current.unregisterElement('node2');
        });
        expect(result.current.namedElements).toHaveLength(2);
        expect(result.current.namedElements.map(el => el.id)).toEqual(['node1', 'node3']);
    });
    it('should handle unregister of non-existent element', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.registerElement('node1', 'Element 1');
        });
        (0, react_1.act)(() => {
            result.current.unregisterElement('nonexistent');
        });
        expect(result.current.namedElements).toHaveLength(1);
        expect(result.current.namedElements[0].id).toBe('node1');
    });
    it('should handle update of non-existent element (creates new)', () => {
        const { result } = (0, react_1.renderHook)(() => (0, NamedElementsContext_1.useNamedElements)(), { wrapper });
        (0, react_1.act)(() => {
            result.current.updateElementName('node1', 'Element 1');
        });
        expect(result.current.namedElements).toHaveLength(1);
        expect(result.current.namedElements[0]).toEqual({ id: 'node1', name: 'Element 1' });
    });
});
