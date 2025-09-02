import * as cheerio from 'cheerio';
import { snippetDefinitions } from './snippetDefinitions';

interface Component {
    id: string;
    type: string;
    attributes: Record<string, any>;
    children: Component[];
}

export class AstroParser {
    private static componentCounter = 0;
    
    // Precompiled regex patterns for better performance
    private static readonly PATTERNS = {
        COMPONENT_REGEX: (name: string) => new RegExp(`<${name}([\\s\\S]*?)(?:>|/>)`, 'i'),
        STRING_ATTR: /(\w+)\s*=\s*(["'])((?:\\.|(?!\2)[^\\])*?)\2/g,
        BOOLEAN_ATTR: /\s+(\w+)(?=\s|$|>)/g,
        FUNC_ATTR: (attr: string) => new RegExp(`${attr}\\s*=\\s*([a-zA-Z_][a-zA-Z0-9_]*\\s*\\()`),
        BRACE_ATTR: (attr: string) => new RegExp(`${attr}\\s*=\\s*\\{`)
    };

    private static generateId(): string {
        return `comp_${Date.now()}_${++this.componentCounter}`;
    }

    static findComponents(astroContent: string): string[] {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        return Object.keys(snippetDefinitions).filter(name => $(name).length > 0);
    }

    static parseComponentHierarchy(astroContent: string): Component[] {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        const componentNames = Object.keys(snippetDefinitions);
        
        const parseElement = (element: cheerio.Element): Component | null => {
            if (element.type !== 'tag' || !componentNames.includes(element.name)) {
                return null;
            }
            
            const attributes = this.extractComponentAttributes(element.name, astroContent);
            const children: Component[] = [];
            
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
        
        const topLevelComponents: Component[] = [];
        const body = $('body').length > 0 ? $('body') : $.root();
        
        body.children().each((_, element) => {
            const component = parseElement(element);
            if (component) {
                topLevelComponents.push(component);
            }
        });
        
        return topLevelComponents;
    }

    static extractComponentAttributes(componentName: string, astroContent: string): Record<string, string> {
        const definition = snippetDefinitions[componentName as keyof typeof snippetDefinitions];
        if (!definition) return {};
        
        const match = this.PATTERNS.COMPONENT_REGEX(componentName).exec(astroContent);
        if (!match?.[1]) return {};
        
        const attrs = match[1];
        const values: Record<string, string> = {};
        
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
    
    private static extractComplexAttributes(attrs: string, values: Record<string, string>, definition: any): void {
        Object.keys(definition.attributes).forEach(attr => {
            if (values[attr]) return; // Skip if already set
            
            const funcMatch = this.PATTERNS.FUNC_ATTR(attr).exec(attrs);
            const braceMatch = this.PATTERNS.BRACE_ATTR(attr).exec(attrs);
            
            if (funcMatch) {
                const content = this.extractBrackets(attrs, funcMatch.index! + funcMatch[0].length - 1, '(', ')');
                if (content !== null) {
                    values[attr] = attrs.substring(
                        funcMatch.index! + attr.length + 1, 
                        funcMatch.index! + funcMatch[0].length + content.length
                    ).trim();
                }
            } else if (braceMatch) {
                const content = this.extractBrackets(attrs, braceMatch.index! + braceMatch[0].length - 1, '{', '}');
                if (content !== null) {
                    values[attr] = `{${content}}`;
                }
            }
        });
    }
    
    private static extractBrackets(text: string, startPos: number, open: string, close: string): string | null {
        let count = 0;
        for (let i = startPos; i < text.length; i++) {
            if (text[i] === open) count++;
            if (text[i] === close && --count === 0) {
                return text.substring(startPos + 1, i);
            }
        }
        return null;
    }
    
    private static normalizeAttributes(attributes: Record<string, string>): Record<string, any> {
        const normalized: Record<string, any> = {};
        Object.entries(attributes).forEach(([key, value]) => {
            if (value === 'true') {
                normalized[key] = true;
            } else if (value === 'false') {
                normalized[key] = false;
            } else {
                normalized[key] = value || '';
            }
        });
        return normalized;
    }
    
    static generateSnippet(componentName: string, values: Record<string, string>): string {
        const displayValues = Object.entries(values).map(([key, val]) => {
            if (!val) return `<div><strong>${key}:</strong> <em>N/A</em></div>`;
            if (val.match(/^[\[{]/)) return `<div><strong>${key}:</strong> <code style="font-size:11px;background:#e9ecef;padding:2px 4px;border-radius:3px">${val}</code></div>`;
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