// src/shared/projectConfig.ts

import { CONFIG_VERSION } from './constants';
import type { ProjectConfig, ComponentNode } from './messageProtocol';

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validates a ComponentNode structure recursively
 *
 * WICHTIG (DEUTSCH):
 * - Prüft NICHT die Tiefe (das muss separat gemacht werden)
 * - Prüft NICHT auf zirkuläre Referenzen
 * - Props-Inhalte werden NICHT validiert (flexibel für beliebige Komponenten)
 */
export function validateComponentNode(node: any): node is ComponentNode {
  // Basic structure check
  if (!node || typeof node !== 'object') {
    console.warn('validateComponentNode: Node is not an object', node);
    return false;
  }

  // Required fields
  if (!node.id || typeof node.id !== 'string') {
    console.warn('validateComponentNode: Missing or invalid id', node);
    return false;
  }
  if (!node.type || typeof node.type !== 'string') {
    console.warn('validateComponentNode: Missing or invalid type', node);
    return false;
  }
  if (!node.props || typeof node.props !== 'object') {
    console.warn('validateComponentNode: Missing or invalid props', node);
    return false;
  }
  if (!node.compName || typeof node.compName !== 'string') {
    console.warn('validateComponentNode: Missing or invalid compName', node);
    return false;
  }

  // Children must be array if present
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) {
      console.warn('validateComponentNode: Children is not an array', node);
      return false;
    }

    // Recursive validation of children
    return node.children.every((child: any) => validateComponentNode(child));
  }

  return true;
}

/**
 * Validates a complete ProjectConfig structure
 *
 * WICHTIG (DEUTSCH):
 * - Wirft bei ungültiger Version eine Warning (für Migration-Logik)
 * - Tree muss ein Array sein (kann leer sein)
 * - Jedes Tree-Element muss ein valides ComponentNode sein
 */
export function validateProjectConfig(config: any): config is ProjectConfig {
  // Null/undefined check
  if (!config || typeof config !== 'object') {
    console.warn('validateProjectConfig: Config is not an object', config);
    return false;
  }

  // Version check (log warning for future migration)
  if (config.version !== CONFIG_VERSION) {
    console.warn(
      `validateProjectConfig: Unsupported version ${config.version}, expected ${CONFIG_VERSION}`
    );
    return false;
  }

  // Required fields
  if (!config.projectName || typeof config.projectName !== 'string') {
    console.warn('validateProjectConfig: Missing or invalid projectName', config);
    return false;
  }
  if (!config.lastModified || typeof config.lastModified !== 'string') {
    console.warn('validateProjectConfig: Missing or invalid lastModified', config);
    return false;
  }
  if (!Array.isArray(config.tree)) {
    console.warn('validateProjectConfig: Tree is not an array', config);
    return false;
  }
  if (!config.metadata || typeof config.metadata !== 'object') {
    console.warn('validateProjectConfig: Missing or invalid metadata', config);
    return false;
  }

  // Validate all tree nodes
  const allValid = config.tree.every((node: any) => validateComponentNode(node));
  if (!allValid) {
    console.warn('validateProjectConfig: Invalid nodes found in tree');
  }

  return allValid;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Creates an empty ProjectConfig
 *
 * USAGE: For initializing new projects
 */
export function createEmptyConfig(projectName: string): ProjectConfig {
  return {
    version: CONFIG_VERSION,
    projectName,
    lastModified: new Date().toISOString(),
    tree: [],
    metadata: {},
  };
}

/**
 * Updates the lastModified timestamp
 *
 * WICHTIG (DEUTSCH):
 * - Verwendet Spread-Operator für Immutability
 * - Gibt NEUES Objekt zurück (modifiziert Original nicht)
 * - Achtung: Shallow Copy, nicht Deep Copy!
 */
export function updateTimestamp(config: ProjectConfig): ProjectConfig {
  return {
    ...config,
    lastModified: new Date().toISOString(),
  };
}
