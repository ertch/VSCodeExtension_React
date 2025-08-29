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
                if (content)
                    values[attr] = content.replace(/\s+/g, ' ').trim();
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
