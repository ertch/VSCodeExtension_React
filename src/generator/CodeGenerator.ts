/**
 * Code Generator - Facade Pattern
 * Generiert HTML/Astro Code aus Entity-Strukturen
 */

import {
  Entity,
  GenerateHTMLResult,
  GenerateOptions,
  EntityInputs,
  TabPageEntity,
  StandardEntity,
  WrapperConfig
} from './types';
import { validateEntities } from './validation';
import { formatAttribute, buildAttributesString } from './Formatters';
import { GenerationError, ValidationError } from '../errors/ExtensionErrors';

export class CodeGenerator {
  /**
   * Generate HTML from entities with optional validation
   */
  generate(entities: Entity | Entity[], options: GenerateOptions = {}): GenerateHTMLResult {
    const { wrapperConfig = {}, validate = true } = options;

    try {
      const entitiesArray = Array.isArray(entities) ? entities : [entities];

      if (validate) {
        validateEntities(entitiesArray);
      }

      const tabs: string[][] = [];
      const componentsSet = new Set<string>();

      const htmlParts = entitiesArray.map((entity) => {
        if (entity.type === 'TabPage') {
          const tabPage = entity as TabPageEntity;
          if (tabPage.name !== 'Start' && tabPage.tabIndex > 0) {
            tabs.push([
              `tab${tabPage.tabIndex}`,
              `tab_${tabPage.name}`,
              tabPage.name
            ]);
          }
        }

        this.collectComponents(entity, componentsSet);
        return this.renderEntity(entity, wrapperConfig, 0);
      });

      const combinedHTML = htmlParts.join('\n');
      const finalHTML = wrapperConfig.wrapAll ? wrapperConfig.wrapAll(combinedHTML) : combinedHTML;

      return {
        tabs,
        components: Array.from(componentsSet),
        html: finalHTML
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }

      throw new GenerationError(
        entities,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * Recursively collect all component types used in entity tree
   */
  private collectComponents(entity: Entity, componentsSet: Set<string>): void {
    // Defensive programming: Guard against undefined/null entities
    if (!entity || typeof entity !== 'object' || !entity.type) {
      console.warn('[CodeGenerator] Invalid entity encountered in collectComponents:', entity);
      return;
    }

    // TabPage is never added to components (statically imported in AstroMerger)
    if (entity.type !== 'TabPage') {
      componentsSet.add(entity.type);
    }

    // Recurse into children for ALL entity types (including TabPage)
    if (entity.children) {
      entity.children.forEach((child: Entity) => this.collectComponents(child, componentsSet));
    }
  }

  /**
   * Render entity to HTML string with indentation
   */
  private renderEntity(entity: Entity, wrapperConfig: WrapperConfig, depth: number): string {
    // Defensive programming: Guard against undefined/null entities
    if (!entity || !entity.type) {
      console.warn('[CodeGenerator] Invalid entity encountered in renderEntity:', entity);
      return '';  // Return empty string instead of crashing
    }

    const indent = '  '.repeat(depth);
    const tagName = entity.type;
    const attributes = this.extractAttributes(entity);
    const attributesString = buildAttributesString(attributes);

    // Render children recursively (for ALL entity types including TabPage)
    let childrenHTML = '';
    if (entity.children?.length) {
      childrenHTML = entity.children.map((child: Entity) =>
        this.renderEntity(child, wrapperConfig, depth + 1)
      ).join('\n');
    }

    // Build HTML
    let html: string;
    if (childrenHTML) {
      html = `${indent}<${tagName}${attributesString}>\n${childrenHTML}\n${indent}</${tagName}>`;
    } else {
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
  private extractAttributes(entity: Entity): Record<string, any> {
    const attributes: Record<string, any> = {};

    if (entity.type === 'TabPage') {
      const tabPage = entity as TabPageEntity;
      attributes.id = tabPage.name;
      attributes.name = tabPage.name;
      attributes.tab = 'tab' + tabPage.tabIndex;
    } else {
      const standardEntity = entity as StandardEntity;
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
  private processInputs(inputs: EntityInputs): Record<string, any> {
    const result: Record<string, any> = {};
    const groupedAttributes: Record<string, any[]> = {};

    if (inputs.name && inputs.name !== '') {
      result.id = inputs.name;
      result.name = inputs.name;
    }

    Object.entries(inputs).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || key === 'name') {
        return;
      }

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
      } else {
        if (this.shouldIncludeAttribute(key, value)) {
          result[key] = value;
        }
      }
    });

    this.processGroupedAttributes(groupedAttributes, inputs, result);

    return result;
  }

  /**
   * Convert grouped attributes to arrays (Triple_List, Double_List, Mix_List)
   */
  private processGroupedAttributes(
    grouped: Record<string, any[]>,
    originalInputs: EntityInputs,
    result: Record<string, any>
  ): void {
    Object.entries(grouped).forEach(([baseKey]) => {
      if (baseKey.startsWith('actions_')) {
        const actions = this.buildTripleList(originalInputs);
        if (actions.length > 0) {
          result.actions = actions;
        }
      } else if (baseKey === 'options') {
        const options = this.buildDoubleList(grouped[baseKey]);
        if (options.length > 0) {
          result.options = options;
        }
      } else if (baseKey === 'If') {
        const ifConditions = this.buildMixList('If', originalInputs);
        if (ifConditions.length > 0) {
          result.If = ifConditions;
        }
      }
    });

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
  private buildTripleList(inputs: EntityInputs): any[][] {
    const triples: any[][] = [];
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
  private buildDoubleList(values: any[]): any[][] {
    const pairs: any[][] = [];

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
  private buildMixList(baseKey: string, inputs: EntityInputs): any[][] {
    const conditions: any[][] = [];
    let index = 0;

    while (true) {
      const value = inputs[`${baseKey}_${index}`];

      if (value === undefined) break;

      if (typeof value === 'string' && value.includes(',')) {
        conditions.push(value.split(',').map(s => s.trim()));
      } else if (value) {
        conditions.push([value]);
      }

      index++;
    }

    return conditions;
  }

  /**
   * Check if attribute should be included in output
   */
  private shouldIncludeAttribute(key: string, value: any): boolean {
    if (value === '') return false;
    if (typeof value === 'boolean' && value === false) return false;
    if (/^.+_\d+$/.test(key)) return false;
    return true;
  }
}

/**
 * Backwards-Compatible Function Export
 * @deprecated Use CodeGenerator class directly. Will be removed in v2.0.
 */
export function generateHTML(
  entities: Entity | Entity[],
  wrapperConfig?: WrapperConfig
): GenerateHTMLResult {
  if (process.env.NODE_ENV === 'development') {
    console.warn('generateHTML() is deprecated. Use new CodeGenerator().generate()');
  }
  const generator = new CodeGenerator();
  return generator.generate(entities, { wrapperConfig });
}
