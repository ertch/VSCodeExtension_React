import * as cheerio from 'cheerio';
import { snippetDefinitions } from './snippetDefinitions';

export class AstroParser {
    
    /**
     * Parse Astro file content and find components
     */
    static findComponents(astroContent: string): string[] {
        const $ = cheerio.load(astroContent, { xmlMode: true });
        const foundComponents: string[] = [];
        
        Object.keys(snippetDefinitions).forEach(componentName => {
            if ($(componentName).length > 0) {
                foundComponents.push(componentName);
            }
        });
        
        return foundComponents;
    }
    
    /**
     * Extract attributes from a specific component in Astro content
     */
    static extractComponentAttributes(componentName: string, astroContent: string): Record<string, string> {
        const definition = snippetDefinitions[componentName as keyof typeof snippetDefinitions];
        if (!definition) return {};
        
        // Use regex to find the component and extract all its attributes (multiline support)
        const componentRegex = new RegExp(`<${componentName}([\\s\\S]*?)>`, 'gs');
        const match = componentRegex.exec(astroContent);
        
        if (!match || !match[1]) return {};
        
        const attributeString = match[1];
        const values: Record<string, string> = {};
        
        // Initialize all defined attributes as empty
        Object.keys(definition.attributes).forEach(attr => {
            values[attr] = '';
        });
        
        // Extract string attributes: attr="value"
        const stringAttrRegex = /(\w+)=["']([^"']*?)["']/g;
        let stringMatch;
        while ((stringMatch = stringAttrRegex.exec(attributeString)) !== null) {
            const [, key, value] = stringMatch;
            if (key in values) {
                values[key] = value;
            }
        }
        
        // Extract array/object attributes with brace counting for multiline support
        for (const attr of Object.keys(definition.attributes)) {
            const attrRegex = new RegExp(`${attr}\\s*=\\s*\\{([\\s\\S]*?)`, 'g');
            const attrMatch = attrRegex.exec(attributeString);
            
            if (attrMatch) {
                let startPos = attrMatch.index + attrMatch[0].length - 1; // Position of opening brace
                let braceCount = 0;
                let endPos = -1;
                
                // Count braces to find the matching closing brace
                for (let i = startPos; i < attributeString.length; i++) {
                    if (attributeString[i] === '{') braceCount++;
                    if (attributeString[i] === '}') {
                        braceCount--;
                        if (braceCount === 0) {
                            endPos = i;
                            break;
                        }
                    }
                }
                
                if (endPos !== -1) {
                    // Extract content between braces and clean up
                    const jsContent = attributeString.substring(startPos + 1, endPos);
                    values[attr] = jsContent.replace(/\s+/g, ' ').trim();
                }
            }
        }
        
        // Extract boolean attributes (just attribute name without value)
        const boolAttrRegex = /\s+(\w+)(?=\s|$|>)/g;
        let boolMatch;
        while ((boolMatch = boolAttrRegex.exec(attributeString)) !== null) {
            const attr = boolMatch[1];
            if (attr in values && values[attr] === '') {
                values[attr] = 'true';
            }
        }
        
        return values;
    }
    
    /**
     * Generate HTML snippet with values script for a component
     */
    static generateSnippet(componentName: string, values: Record<string, string>): string {
        const valuesScript = JSON.stringify(values, null, 2);
        
        // Format values for display - show arrays and objects nicely
        const displayValues = Object.entries(values).map(([key, val]) => {
            if (!val) return `<div><strong>${key}:</strong> <em>N/A</em></div>`;
            
            // Check if value looks like an array or object
            if (val.startsWith('[') || val.startsWith('{')) {
                return `<div><strong>${key}:</strong> <code style="font-size: 11px; background: #e9ecef; padding: 2px 4px; border-radius: 3px;">${val}</code></div>`;
            }
            
            return `<div><strong>${key}:</strong> ${val}</div>`;
        }).join('');
        
        return `<div style="border: 2px solid #007acc; padding: 16px; margin: 10px 0; border-radius: 8px; background: #f8f9fa;">
            <h3 style="margin-top: 0; color: #007acc;">🧩 ${componentName}</h3>
            ${displayValues}
        </div>
        <script>
        let values = ${valuesScript};
        console.log('${componentName} values:', values);
        </script>`;
    }
}