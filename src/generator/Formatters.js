"use strict";
/**
 * HTML Formatierung und Attribut-Handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAttribute = formatAttribute;
exports.buildAttributesString = buildAttributesString;
/**
 * Format single attribute for HTML/Astro output
 */
function formatAttribute(key, value) {
    // Boolean true als einzelnes Attribut
    if (value === true) {
        return key;
    }
    // Arrays
    if (Array.isArray(value)) {
        return formatArray(key, value);
    }
    // Numbers - Astro Syntax mit geschweiften Klammern
    if (typeof value === 'number') {
        return `${key}={${value}}`;
    }
    // Strings - mit XSS Protection
    if (typeof value === 'string' && value !== '') {
        return `${key}="${escapeHTML(value)}"`;
    }
    // Objects
    if (typeof value === 'object' && value !== null) {
        return `${key}={${JSON.stringify(value)}}`;
    }
    return '';
}
/**
 * Format Array values (nested or simple)
 */
function formatArray(key, value) {
    if (value.length > 0 && Array.isArray(value[0])) {
        // Nested Arrays (Triple_List, Double_List, Mix_List)
        const formattedArray = value.map(item => `[${item.map((v) => JSON.stringify(v)).join(', ')}]`).join(', ');
        return `${key}={[${formattedArray}]}`;
    }
    // Simple Array (Double_Single)
    const formattedArray = value.map((v) => JSON.stringify(v)).join(', ');
    return `${key}={[${formattedArray}]}`;
}
/**
 * Build complete attributes string from Record
 */
function buildAttributesString(attributes) {
    const parts = [];
    Object.entries(attributes).forEach(([key, value]) => {
        const attrString = formatAttribute(key, value);
        if (attrString) {
            parts.push(attrString);
        }
    });
    return parts.length > 0 ? ' ' + parts.join(' ') : '';
}
/**
 * XSS Protection - Escape HTML special characters
 */
function escapeHTML(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
