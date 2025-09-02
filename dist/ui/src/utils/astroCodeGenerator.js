"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAstroCode = void 0;
/**
 * Generates Astro code from component tree structure
 */
const generateAstroCode = (nodes) => {
    const render = (comp, depth = 0) => {
        const indent = '  '.repeat(depth);
        // Filter out empty, false, undefined, and null attribute values
        const attrs = Object.entries(comp.attributes)
            .filter(([, v]) => v !== '' && v !== false && v !== undefined && v !== null)
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ');
        const opening = `${indent}<${comp.type}${attrs ? ' ' + attrs : ''}>`;
        // If no children, create self-closing or simple closing tag
        if (!comp.children.length) {
            return `${opening}</${comp.type}>`;
        }
        // Render children with proper indentation
        const children = comp.children
            .map(c => render(c, depth + 1))
            .join('\n');
        return `${opening}\n${children}\n${indent}</${comp.type}>`;
    };
    return nodes.map(n => render(n)).join('\n\n');
};
exports.generateAstroCode = generateAstroCode;
