/**
 * Project Configuration Utilities
 * Validierung und Helper für .ttEditor.json
 */

import { ProjectConfig, ComponentNode } from './messageProtocol';

/**
 * Validiert ob ein ProjectConfig-Objekt valide ist
 */
export function validateProjectConfig(config: any): config is ProjectConfig {
  if (!config || typeof config !== 'object') {
    return false;
  }

  // Version check
  if (config.version !== '1.0') {
    console.warn('ProjectConfig: Unsupported version', config.version);
    return false;
  }

  // Required fields
  if (!config.projectName || typeof config.projectName !== 'string') {
    return false;
  }

  if (!config.lastModified || typeof config.lastModified !== 'string') {
    return false;
  }

  if (!Array.isArray(config.tree)) {
    return false;
  }

  // Validate tree structure
  return config.tree.every(validateComponentNode);
}

/**
 * Validiert eine einzelne ComponentNode
 */
export function validateComponentNode(node: any): node is ComponentNode {
  if (!node || typeof node !== 'object') {
    return false;
  }

  if (!node.id || typeof node.id !== 'string') {
    return false;
  }

  if (!node.type || typeof node.type !== 'string') {
    return false;
  }

  if (!node.props || typeof node.props !== 'object') {
    return false;
  }

  if (!Array.isArray(node.children)) {
    return false;
  }

  if (!node.codeGen || typeof node.codeGen !== 'object') {
    return false;
  }

  // Recursive validation for children
  return node.children.every(validateComponentNode);
}

/**
 * Erstellt ein leeres ProjectConfig
 */
export function createEmptyConfig(projectName: string): ProjectConfig {
  return {
    version: '1.0',
    projectName,
    lastModified: new Date().toISOString(),
    tree: [],
    metadata: {},
  };
}

/**
 * Aktualisiert lastModified Timestamp
 */
export function updateTimestamp(config: ProjectConfig): ProjectConfig {
  return {
    ...config,
    lastModified: new Date().toISOString(),
  };
}
