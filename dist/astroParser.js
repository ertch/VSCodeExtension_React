"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroParser = void 0;
const cheerio = require("cheerio");
const snippetDefinitions_1 = require("./snippetDefinitions");
class AstroParser {
    static findComponents(astroContent) {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        return Object.keys(snippetDefinitions_1.snippetDefinitions).filter(name => $(name).length > 0);
    }
    static parseComponentHierarchy(astroContent) {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        const componentNames = Object.keys(snippetDefinitions_1.snippetDefinitions);
        let componentCounter = 0;
        const generateId = () => `comp_${Date.now()}_${++componentCounter}`;
        const parseElement = (element) => {
            // Check if element has tagName (is not a text node)
            if (element.type !== 'tag')
                return null;
            const tagName = element.name;
            // Skip if not a known component
            if (!componentNames.includes(tagName))
                return null;
            // Extract attributes from the original HTML content instead of processed Cheerio
            const attributes = this.extractElementAttributesFromSource(astroContent, tagName, element);
            // Parse children recursively
            const children = [];
            $(element).children().each((_, child) => {
                const childComponent = parseElement(child);
                if (childComponent) {
                    children.push(childComponent);
                }
            });
            return {
                id: generateId(),
                type: tagName,
                attributes,
                children
            };
        };
        // Find all top-level components
        const topLevelComponents = [];
        const body = $('body').length > 0 ? $('body') : $.root();
        body.children().each((_, element) => {
            const component = parseElement(element);
            if (component) {
                topLevelComponents.push(component);
            }
        });
        return topLevelComponents;
    }
    // New method: Extract attributes directly from a Cheerio element instance
    static extractElementAttributes(element, componentName) {
        const definition = snippetDefinitions_1.snippetDefinitions[componentName];
        if (!(definition === null || definition === void 0 ? void 0 : definition.attributes))
            return {};
        const attributes = {};
        // Initialize with empty values for all defined attributes
        Object.keys(definition.attributes).forEach(attr => {
            attributes[attr] = '';
        });
        // Get the raw HTML string from the original source before Cheerio processed it
        const elementHtml = element.toString();
        // Find the opening tag in the raw HTML - need to be more precise with the regex
        const tagMatch = new RegExp(`<${componentName}([\\s\\S]*?)(?:>|\/>)`, 'i').exec(elementHtml);
        if (tagMatch && tagMatch[1]) {
            const rawAttrs = tagMatch[1].trim();
            // Extract complex attributes directly from raw HTML string
            this.extractComplexAttributes(rawAttrs, attributes, definition);
        }
        return attributes;
    }
    // New method: Extract attributes from original source HTML to avoid Cheerio parsing issues
    static extractElementAttributesFromSource(sourceHtml, componentName, element) {
        const definition = snippetDefinitions_1.snippetDefinitions[componentName];
        if (!(definition === null || definition === void 0 ? void 0 : definition.attributes))
            return {};
        const attributes = {};
        // Initialize with empty values for all defined attributes
        Object.keys(definition.attributes).forEach(attr => {
            attributes[attr] = '';
        });
        // Simple approach: just extract from the existing extractComponentAttributes method
        // which works correctly for individual components
        const extractedAttrs = this.extractComponentAttributes(componentName, sourceHtml);
        // Convert string values to appropriate types and merge
        Object.entries(extractedAttrs).forEach(([key, value]) => {
            if (key in attributes) {
                // Convert string values to appropriate types
                if (value === 'true') {
                    attributes[key] = true;
                }
                else if (value === 'false') {
                    attributes[key] = false;
                }
                else {
                    attributes[key] = value || '';
                }
            }
        });
        return attributes;
    }
    // Helper method: Extract complex attributes (arrays, objects, functions) from attribute string
    static extractComplexAttributes(attrs, attributes, definition) {
        // String attributes: attr="value" or attr='value'
        [...attrs.matchAll(/(\w+)\s*=\s*(["'])((?:\\.|(?!\2)[^\\])*?)\2/g)]
            .forEach(([, key, , value]) => {
            if (key in attributes) {
                attributes[key] = value;
            }
        });
        // Function calls, arrays, objects with bracket/brace counting
        Object.keys(definition.attributes).forEach(attr => {
            if (attributes[attr])
                return; // Skip if already set
            const funcMatch = new RegExp(`${attr}\\s*=\\s*([a-zA-Z_][a-zA-Z0-9_]*\\s*\\()`).exec(attrs);
            const braceMatch = new RegExp(`${attr}\\s*=\\s*\\{`).exec(attrs);
            if (funcMatch) {
                const content = this.extractBrackets(attrs, funcMatch.index + funcMatch[0].length - 1, '(', ')');
                if (content) {
                    // Include the function call with parentheses
                    const fullValue = attrs.substring(funcMatch.index + attr.length + 1, funcMatch.index + funcMatch[0].length + content.length + 1).trim();
                    attributes[attr] = fullValue;
                }
            }
            else if (braceMatch) {
                const content = this.extractBrackets(attrs, braceMatch.index + braceMatch[0].length - 1, '{', '}');
                if (content !== null) {
                    // Include the braces in the final value: {content}
                    attributes[attr] = `{${content}}`;
                }
            }
        });
        // Boolean attributes
        [...attrs.matchAll(/\s+(\w+)(?=\s|$|>)/g)]
            .forEach(([, attr]) => {
            if (attr in attributes && !attributes[attr]) {
                attributes[attr] = 'true';
            }
        });
    }
    static extractComponentAttributes(componentName, astroContent) {
        const definition = snippetDefinitions_1.snippetDefinitions[componentName];
        if (!definition)
            return {};
        const match = new RegExp(`<${componentName}([\\s\\S]*?)>`).exec(astroContent);
        if (!(match === null || match === void 0 ? void 0 : match[1]))
            return {};
        const attrs = match[1];
        const values = {};
        Object.keys(definition.attributes).forEach(attr => values[attr] = '');
        // String attributes: attr="value" or attr='value'
        [...attrs.matchAll(/(\w+)\s*=\s*(["'])((?:\\.|(?!\2)[^\\])*?)\2/g)]
            .forEach(([, key, , value]) => key in values && (values[key] = value));
        // Function calls, arrays, objects with bracket/brace counting
        Object.keys(definition.attributes).forEach(attr => {
            if (values[attr])
                return;
            const funcMatch = new RegExp(`${attr}\\s*=\\s*([a-zA-Z_][a-zA-Z0-9_]*\\s*\\()`).exec(attrs);
            const braceMatch = new RegExp(`${attr}\\s*=\\s*\\{`).exec(attrs);
            if (funcMatch) {
                const content = this.extractBrackets(attrs, funcMatch.index + funcMatch[0].length - 1, '(', ')');
                if (content)
                    values[attr] = attrs.substring(funcMatch.index + attr.length + 1, funcMatch.index + funcMatch[0].length + content.length);
            }
            else if (braceMatch) {
                const content = this.extractBrackets(attrs, braceMatch.index + braceMatch[0].length - 1, '{', '}');
                if (content !== null) {
                    // Include the braces in the final value: {content}
                    values[attr] = `{${content}}`;
                }
            }
        });
        // Boolean attributes
        [...attrs.matchAll(/\s+(\w+)(?=\s|$|>)/g)]
            .forEach(([, attr]) => attr in values && !values[attr] && (values[attr] = 'true'));
        return values;
    }
    static extractBrackets(text, startPos, open, close) {
        let count = 0, endPos = -1;
        for (let i = startPos; i < text.length; i++) {
            if (text[i] === open)
                count++;
            if (text[i] === close && --count === 0) {
                endPos = i;
                break;
            }
        }
        return endPos !== -1 ? text.substring(startPos + 1, endPos) : null;
    }
    static generateSnippet(componentName, values) {
        const displayValues = Object.entries(values).map(([key, val]) => {
            if (!val)
                return `<div><strong>${key}:</strong> <em>N/A</em></div>`;
            if (val.match(/^[\[{]/))
                return `<div><strong>${key}:</strong> <code style="font-size:11px;background:#e9ecef;padding:2px 4px;border-radius:3px">${val}</code></div>`;
            return `<div><strong>${key}:</strong> ${val}</div>`;
        }).join('');
        return `<div style="border:2px solid #007acc;padding:16px;margin:10px 0;border-radius:8px;background:#f8f9fa">
    <h3 style="margin-top:0;color:#007acc">🧩 ${componentName}</h3>
    ${displayValues}
</div>
<script>
let values = ${JSON.stringify(values, null, 2)};
console.log('${componentName} values:', values);
</script>`;
    }
}
exports.AstroParser = AstroParser;
