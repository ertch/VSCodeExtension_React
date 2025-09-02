"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AstroParser = void 0;
const cheerio = require("cheerio");
const snippetDefinitions_1 = require("./snippetDefinitions");
class AstroParser {
    static generateId() {
        return `comp_${Date.now()}_${++this.componentCounter}`;
    }
    static findComponents(astroContent) {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        return Object.keys(snippetDefinitions_1.snippetDefinitions).filter(name => $(name).length > 0);
    }
    static parseComponentHierarchy(astroContent) {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        const componentNames = Object.keys(snippetDefinitions_1.snippetDefinitions);
        const parseElement = (element) => {
            if (element.type !== 'tag' || !componentNames.includes(element.name)) {
                return null;
            }
            const attributes = this.extractComponentAttributes(element.name, astroContent);
            const children = [];
            $(element).children().each((_, child) => {
                const childComponent = parseElement(child);
                if (childComponent) {
                    children.push(childComponent);
                }
            });
            return {
                id: this.generateId(),
                type: element.name,
                attributes: this.normalizeAttributes(attributes),
                children
            };
        };
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
    static extractComponentAttributes(componentName, astroContent) {
        const definition = snippetDefinitions_1.snippetDefinitions[componentName];
        if (!definition)
            return {};
        const match = this.PATTERNS.COMPONENT_REGEX(componentName).exec(astroContent);
        if (!(match === null || match === void 0 ? void 0 : match[1]))
            return {};
        const attrs = match[1];
        const values = {};
        // Initialize with empty values
        Object.keys(definition.attributes).forEach(attr => values[attr] = '');
        // Extract string attributes
        for (const [, key, , value] of attrs.matchAll(this.PATTERNS.STRING_ATTR)) {
            if (key in values) {
                values[key] = value;
            }
        }
        // Extract complex attributes (functions, objects)
        this.extractComplexAttributes(attrs, values, definition);
        // Extract boolean attributes
        for (const [, attr] of attrs.matchAll(this.PATTERNS.BOOLEAN_ATTR)) {
            if (attr in values && !values[attr]) {
                values[attr] = 'true';
            }
        }
        return values;
    }
    static extractComplexAttributes(attrs, values, definition) {
        Object.keys(definition.attributes).forEach(attr => {
            if (values[attr])
                return; // Skip if already set
            const funcMatch = this.PATTERNS.FUNC_ATTR(attr).exec(attrs);
            const braceMatch = this.PATTERNS.BRACE_ATTR(attr).exec(attrs);
            if (funcMatch) {
                const content = this.extractBrackets(attrs, funcMatch.index + funcMatch[0].length - 1, '(', ')');
                if (content !== null) {
                    values[attr] = attrs.substring(funcMatch.index + attr.length + 1, funcMatch.index + funcMatch[0].length + content.length).trim();
                }
            }
            else if (braceMatch) {
                const content = this.extractBrackets(attrs, braceMatch.index + braceMatch[0].length - 1, '{', '}');
                if (content !== null) {
                    values[attr] = `{${content}}`;
                }
            }
        });
    }
    static extractBrackets(text, startPos, open, close) {
        let count = 0;
        for (let i = startPos; i < text.length; i++) {
            if (text[i] === open)
                count++;
            if (text[i] === close && --count === 0) {
                return text.substring(startPos + 1, i);
            }
        }
        return null;
    }
    static normalizeAttributes(attributes) {
        const normalized = {};
        Object.entries(attributes).forEach(([key, value]) => {
            if (value === 'true') {
                normalized[key] = true;
            }
            else if (value === 'false') {
                normalized[key] = false;
            }
            else {
                normalized[key] = value || '';
            }
        });
        return normalized;
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
AstroParser.componentCounter = 0;
// Precompiled regex patterns for better performance
AstroParser.PATTERNS = {
    COMPONENT_REGEX: (name) => new RegExp(`<${name}([\\s\\S]*?)(?:>|/>)`, 'i'),
    STRING_ATTR: /(\w+)\s*=\s*(["'])((?:\\.|(?!\2)[^\\])*?)\2/g,
    BOOLEAN_ATTR: /\s+(\w+)(?=\s|$|>)/g,
    FUNC_ATTR: (attr) => new RegExp(`${attr}\\s*=\\s*([a-zA-Z_][a-zA-Z0-9_]*\\s*\\()`),
    BRACE_ATTR: (attr) => new RegExp(`${attr}\\s*=\\s*\\{`)
};
