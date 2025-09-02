/**
 * Sichere Extraktion von Attributen aus <script>let values={...};</script>
 * Parses script content safely and extracts attribute values
 */
export const extractAttributes = (content: string): Record<string, any> => {
  try {
    if (!content) return {}
    
    // Find script tag content
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/)
    if (!scriptMatch) return {}
    
    const scriptContent = scriptMatch[1]
    
    // Find values object definition
    const valuesMatch = scriptContent.match(/let\s+values\s*=\s*({[\s\S]*?});/)
    if (!valuesMatch) return {}

    const valuesStr = valuesMatch[1]
    
    // Safely parse the object using Function constructor
    const parsed = new Function(`"use strict"; return (${valuesStr});`)() as Record<string, any>

    // Clean up the parsed values
    const cleaned: Record<string, any> = {}
    for (const [k, v] of Object.entries(parsed)) {
      if (v !== '' && v !== undefined && v !== null) {
        // Convert string booleans to actual booleans
        cleaned[k] = v === 'true' ? true : v === 'false' ? false : v
      }
    }
    
    return cleaned
  } catch {
    // Return empty object if parsing fails
    return {}
  }
}

/**
 * Generates a unique ID for components
 */
export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substring(2, 11)
}