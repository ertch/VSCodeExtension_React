"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComponent = exports.defaultsForType = exports.getDefinition = void 0;
const snippetDefinitions_1 = require("../../../snippetDefinitions");
const attributeExtraction_1 = require("./attributeExtraction");
/**
 * Gets the definition for a component type from snippet definitions
 */
const getDefinition = (type) => snippetDefinitions_1.snippetDefinitions[type];
exports.getDefinition = getDefinition;
/**
 * Gets default attribute values for a component type
 */
const defaultsForType = (type) => {
    var _a;
    const def = (0, exports.getDefinition)(type);
    const out = {};
    if (def === null || def === void 0 ? void 0 : def.attributes) {
        for (const [key, config] of Object.entries(def.attributes)) {
            if (config && typeof config === 'object' && 'value' in config) {
                out[key] = (_a = config.value) !== null && _a !== void 0 ? _a : '';
            }
            else {
                out[key] = '';
            }
        }
    }
    return out;
};
exports.defaultsForType = defaultsForType;
/**
 * Creates a new component with the specified type and attribute overrides
 */
const createComponent = (type, overrides = {}) => {
    const attributes = Object.assign(Object.assign({}, (0, exports.defaultsForType)(type)), overrides);
    return {
        id: (0, attributeExtraction_1.generateId)(),
        type,
        attributes,
        children: [],
    };
};
exports.createComponent = createComponent;
