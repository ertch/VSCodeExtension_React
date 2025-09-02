import { snippetDefinitions } from '../../../snippetDefinitions'
import { Component } from './treeOperations'
import { generateId } from './attributeExtraction'

/**
 * Gets the definition for a component type from snippet definitions
 */
export const getDefinition = (type: string) =>
  snippetDefinitions[type as keyof typeof snippetDefinitions] as any

/**
 * Gets default attribute values for a component type
 */
export const defaultsForType = (type: string): Record<string, any> => {
  const def = getDefinition(type)
  const out: Record<string, any> = {}
  
  if (def?.attributes) {
    for (const [key, config] of Object.entries(def.attributes)) {
      if (config && typeof config === 'object' && 'value' in config) {
        out[key] = (config as any).value ?? ''
      } else {
        out[key] = ''
      }
    }
  }
  
  return out
}

/**
 * Creates a new component with the specified type and attribute overrides
 */
export const createComponent = (
  type: string, 
  overrides: Record<string, any> = {}
): Component => {
  const attributes = { ...defaultsForType(type), ...overrides }
  
  return {
    id: generateId(),
    type,
    attributes,
    children: [],
  }
}