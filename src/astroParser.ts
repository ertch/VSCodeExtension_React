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
        const $ = cheerio.load(astroContent, { xmlMode: true });
        const element = $(componentName).first();
        
        if (element.length === 0) {
            return {};
        }
        
        const definition = snippetDefinitions[componentName as keyof typeof snippetDefinitions];
        if (!definition) {
            return {};
        }
        
        // Extract attributes based on definition
        const values: Record<string, string> = {};
        Object.keys(definition.attributes).forEach(attr => {
            values[attr] = element.attr(attr) || '';
        });
        
        return values;
    }
    
    /**
     * Generate HTML snippet with values script for a component
     */
    static generateSnippet(componentName: string, values: Record<string, string>): string {
        const valuesScript = JSON.stringify(values, null, 2);
        
        return `<div style="border: 2px solid #007acc; padding: 16px; margin: 10px 0; border-radius: 8px; background: #f8f9fa;">
            <h3 style="margin-top: 0; color: #007acc;">${componentName}</h3>
            ${Object.entries(values).map(([key, val]) => `<div><strong>${key}:</strong> ${val || 'N/A'}</div>`).join('')}
        </div>
        <script>
        let values = ${valuesScript};
        </script>`;
    }
}