/**
 * HTML Formatierung und Attribut-Handling
 */

/**
 * Format single attribute for HTML/Astro output
 */
export function formatAttribute(key: string, value: any): string {
  if (value === true) {
    return key;
  }

  if (Array.isArray(value)) {
    return formatArray(key, value);
  }

  if (typeof value === 'number') {
    return `${key}={${value}}`;
  }

  if (typeof value === 'string' && value !== '') {
    return `${key}="${escapeHTML(value)}"`;
  }

  if (typeof value === 'object' && value !== null) {
    return `${key}={${JSON.stringify(value)}}`;
  }

  return '';
}

/**
 * Format Array values (nested or simple)
 */
function formatArray(key: string, value: any[]): string {
  if (value.length > 0 && Array.isArray(value[0])) {
    const formattedArray = value.map(item =>
      `[${item.map((v: any) => JSON.stringify(v)).join(', ')}]`
    ).join(', ');
    return `${key}={[${formattedArray}]}`;
  }

  const formattedArray = value.map((v: any) => JSON.stringify(v)).join(', ');
  return `${key}={[${formattedArray}]}`;
}

/**
 * Build complete attributes string from Record
 */
export function buildAttributesString(attributes: Record<string, any>): string {
  const parts: string[] = [];

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
function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
