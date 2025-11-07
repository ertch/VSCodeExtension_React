"use strict";
/**
 * Code Generator - Facade Pattern
 * Generiert HTML/Astro Code aus Entity-Strukturen
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodeGenerator = void 0;
exports.generateHTML = generateHTML;
const validation_1 = require("./validation");
const Formatters_1 = require("./Formatters");
const ExtensionErrors_1 = require("../errors/ExtensionErrors");
class CodeGenerator {
    /**
     * Generate HTML from entities with optional validation
     */
    generate(entities, options = {}) {
        const { wrapperConfig = {}, validate = true } = options;
        try {
            const entitiesArray = Array.isArray(entities) ? entities : [entities];
            // Optional: Validate input
            if (validate) {
                (0, validation_1.validateEntities)(entitiesArray);
            }
            const tabs = [];
            const componentsSet = new Set();
            // Generate HTML for each entity
            const htmlParts = entitiesArray.map((entity) => {
                // Collect tabs (skip "Start" tab)
                if (entity.type === 'TabPage') {
                    const tabPage = entity;
                    if (tabPage.name !== 'Start' && tabPage.tabIndex > 0) {
                        tabs.push([
                            `tab${tabPage.tabIndex}`,
                            `tab_${tabPage.name}`,
                            tabPage.name
                        ]);
                    }
                }
                // Collect components
                this.collectComponents(entity, componentsSet);
                // Render entity to HTML
                return this.renderEntity(entity, wrapperConfig, 0);
            });
            const combinedHTML = htmlParts.join('\n');
            const finalHTML = wrapperConfig.wrapAll ? wrapperConfig.wrapAll(combinedHTML) : combinedHTML;
            return {
                tabs,
                components: Array.from(componentsSet),
                html: finalHTML
            };
        }
        catch (error) {
            // Let ValidationError propagate unchanged
            if (error instanceof ExtensionErrors_1.ValidationError) {
                throw error;
            }
            throw new ExtensionErrors_1.GenerationError(entities, error instanceof Error ? error : new Error(String(error)));
        }
    }
    /**
     * Recursively collect all component types used in entity tree
     */
    collectComponents(entity, componentsSet) {
        if (entity.type !== 'TabPage') {
            componentsSet.add(entity.type);
            // Only StandardEntity has children (type guard)
            const standardEntity = entity;
            if (standardEntity.children) {
                standardEntity.children.forEach((child) => this.collectComponents(child, componentsSet));
            }
        }
    }
    /**
     * Render entity to HTML string with indentation
     */
    renderEntity(entity, wrapperConfig, depth) {
        var _a;
        const indent = '  '.repeat(depth);
        const tagName = entity.type;
        const attributes = this.extractAttributes(entity);
        const attributesString = (0, Formatters_1.buildAttributesString)(attributes);
        // Render children recursively (only StandardEntity has children)
        let childrenHTML = '';
        if (entity.type !== 'TabPage') {
            const standardEntity = entity;
            if ((_a = standardEntity.children) === null || _a === void 0 ? void 0 : _a.length) {
                childrenHTML = standardEntity.children.map((child) => this.renderEntity(child, wrapperConfig, depth + 1)).join('\n');
            }
        }
        // Build HTML
        let html;
        if (childrenHTML) {
            html = `${indent}<${tagName}${attributesString}>\n${childrenHTML}\n${indent}</${tagName}>`;
        }
        else {
            html = `${indent}<${tagName}${attributesString} />`;
        }
        // Apply wrappers (only at root level)
        if (depth === 0) {
            if (wrapperConfig.before) {
                html = wrapperConfig.before(entity) + '\n' + html;
            }
            if (wrapperConfig.after) {
                html = html + '\n' + wrapperConfig.after(entity);
            }
        }
        return html;
    }
    /**
     * Extract attributes from entity based on type
     */
    extractAttributes(entity) {
        const attributes = {};
        if (entity.type === 'TabPage') {
            const tabPage = entity;
            attributes.id = tabPage.name;
            attributes.name = tabPage.name;
            attributes.tab = 'tab' + tabPage.tabIndex;
        }
        else {
            const standardEntity = entity;
            if (standardEntity.inputs) {
                const processedInputs = this.processInputs(standardEntity.inputs);
                Object.assign(attributes, processedInputs);
            }
        }
        return attributes;
    }
    /**
     * Process inputs and group numbered attributes into arrays
     */
    processInputs(inputs) {
        const result = {};
        const groupedAttributes = {};
        // Handle 'name' for ID
        if (inputs.name && inputs.name !== '') {
            result.id = inputs.name;
            result.name = inputs.name;
        }
        Object.entries(inputs).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined || key === 'name') {
                return;
            }
            // Check if it's a numbered attribute (e.g., actions_trigger_0)
            const match = key.match(/^(.+?)_(\d+)$/);
            if (match) {
                const [, baseKey, index] = match;
                const numIndex = parseInt(index);
                if (!groupedAttributes[baseKey]) {
                    groupedAttributes[baseKey] = [];
                }
                while (groupedAttributes[baseKey].length <= numIndex) {
                    groupedAttributes[baseKey].push(null);
                }
                groupedAttributes[baseKey][numIndex] = value;
            }
            else {
                // Normal attribute
                if (this.shouldIncludeAttribute(key, value)) {
                    result[key] = value;
                }
            }
        });
        // Process grouped attributes
        this.processGroupedAttributes(groupedAttributes, inputs, result);
        return result;
    }
    /**
     * Convert grouped attributes to arrays (Triple_List, Double_List, Mix_List)
     */
    processGroupedAttributes(grouped, originalInputs, result) {
        Object.entries(grouped).forEach(([baseKey]) => {
            if (baseKey.startsWith('actions_')) {
                // Triple_List for actions
                const actions = this.buildTripleList(originalInputs);
                if (actions.length > 0) {
                    result.actions = actions;
                }
            }
            else if (baseKey === 'options') {
                // Double_List for options
                const options = this.buildDoubleList(grouped[baseKey]);
                if (options.length > 0) {
                    result.options = options;
                }
            }
            else if (baseKey === 'If') {
                // Mix_List for If-conditions
                const ifConditions = this.buildMixList('If', originalInputs);
                if (ifConditions.length > 0) {
                    result.If = ifConditions;
                }
            }
        });
        // Handle firstOption (Double_Single)
        if (originalInputs.firstOption) {
            const firstOptionValue = originalInputs.firstOption;
            if (firstOptionValue && firstOptionValue !== '') {
                const parts = String(firstOptionValue).split(',').map(s => s.trim());
                if (parts.length === 2) {
                    result.firstOption = parts;
                }
            }
        }
    }
    /**
     * Build Triple_List for actions ([trigger, action, targetId])
     */
    buildTripleList(inputs) {
        const triples = [];
        let index = 0;
        while (true) {
            const trigger = inputs[`actions_trigger_${index}`];
            const action = inputs[`actions_action_${index}`];
            const targetId = inputs[`actions_target_id_${index}`];
            if (trigger === undefined && action === undefined && targetId === undefined) {
                break;
            }
            if (trigger || action || targetId) {
                triples.push([trigger || '', action || '', targetId || '']);
            }
            index++;
        }
        return triples;
    }
    /**
     * Build Double_List for options ([value, label])
     */
    buildDoubleList(values) {
        const pairs = [];
        for (let i = 0; i < values.length; i += 2) {
            if (values[i] !== null || values[i + 1] !== null) {
                pairs.push([values[i] || '', values[i + 1] || '']);
            }
        }
        return pairs;
    }
    /**
     * Build Mix_List for If-conditions
     */
    buildMixList(baseKey, inputs) {
        const conditions = [];
        let index = 0;
        while (true) {
            const value = inputs[`${baseKey}_${index}`];
            if (value === undefined)
                break;
            if (typeof value === 'string' && value.includes(',')) {
                conditions.push(value.split(',').map(s => s.trim()));
            }
            else if (value) {
                conditions.push([value]);
            }
            index++;
        }
        return conditions;
    }
    /**
     * Check if attribute should be included in output
     */
    shouldIncludeAttribute(key, value) {
        if (value === '')
            return false;
        if (typeof value === 'boolean' && value === false)
            return false;
        if (/^.+_\d+$/.test(key))
            return false;
        return true;
    }
}
exports.CodeGenerator = CodeGenerator;
/**
 * Backwards-Compatible Function Export
 * @deprecated Use CodeGenerator class directly. Will be removed in v2.0.
 */
function generateHTML(entities, wrapperConfig) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('generateHTML() is deprecated. Use new CodeGenerator().generate()');
    }
    const generator = new CodeGenerator();
    return generator.generate(entities, { wrapperConfig });
}
