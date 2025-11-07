/**
 * Code Generator - Facade Pattern
 * Generiert HTML/Astro Code aus Entity-Strukturen
 */
import { Entity, GenerateHTMLResult, GenerateOptions, WrapperConfig } from './types';
export declare class CodeGenerator {
    /**
     * Generate HTML from entities with optional validation
     */
    generate(entities: Entity | Entity[], options?: GenerateOptions): GenerateHTMLResult;
    /**
     * Recursively collect all component types used in entity tree
     */
    private collectComponents;
    /**
     * Render entity to HTML string with indentation
     */
    private renderEntity;
    /**
     * Extract attributes from entity based on type
     */
    private extractAttributes;
    /**
     * Process inputs and group numbered attributes into arrays
     */
    private processInputs;
    /**
     * Convert grouped attributes to arrays (Triple_List, Double_List, Mix_List)
     */
    private processGroupedAttributes;
    /**
     * Build Triple_List for actions ([trigger, action, targetId])
     */
    private buildTripleList;
    /**
     * Build Double_List for options ([value, label])
     */
    private buildDoubleList;
    /**
     * Build Mix_List for If-conditions
     */
    private buildMixList;
    /**
     * Check if attribute should be included in output
     */
    private shouldIncludeAttribute;
}
/**
 * Backwards-Compatible Function Export
 * @deprecated Use CodeGenerator class directly. Will be removed in v2.0.
 */
export declare function generateHTML(entities: Entity | Entity[], wrapperConfig?: WrapperConfig): GenerateHTMLResult;
//# sourceMappingURL=CodeGenerator.d.ts.map