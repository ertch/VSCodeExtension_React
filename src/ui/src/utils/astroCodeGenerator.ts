import { Component } from './treeOperations'

/**
 * Generates Astro code from component tree structure
 */
export const generateAstroCode = (nodes: Component[]): string => {
  const render = (comp: Component, depth = 0): string => {
    const indent = '  '.repeat(depth)
    
    // Filter out empty, false, undefined, and null attribute values
    const attrs = Object.entries(comp.attributes)
      .filter(([, v]) => v !== '' && v !== false && v !== undefined && v !== null)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ')
    
    const opening = `${indent}<${comp.type}${attrs ? ' ' + attrs : ''}>`
    
    // If no children, create self-closing or simple closing tag
    if (!comp.children.length) {
      return `${opening}</${comp.type}>`
    }
    
    // Render children with proper indentation
    const children = comp.children
      .map(c => render(c, depth + 1))
      .join('\n')
    
    return `${opening}\n${children}\n${indent}</${comp.type}>`
  }
  
  return nodes.map(n => render(n)).join('\n\n')
}