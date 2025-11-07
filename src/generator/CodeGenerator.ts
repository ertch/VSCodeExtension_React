// Types für bessere Typsicherheit
interface BaseEntity {
  id?: string;
  type: string;
  children?: Entity[];
}

interface TabPageEntity extends BaseEntity {
  type: 'TabPage';
  name: string;
  tabIndex: number;
}

interface StandardEntity extends BaseEntity {
  inputs: Record<string, any>;
}

type Entity = TabPageEntity | StandardEntity;

// Wrapper-Konfiguration
interface WrapperConfig {
  before?: (entity: Entity) => string;
  after?: (entity: Entity) => string;
  wrapAll?: (html: string) => string;
}

// Hauptfunktion
export function generateHTML(
  entities: Entity | Entity[], 
  wrapperConfig: WrapperConfig = {}
): string {
  const entitiesArray = Array.isArray(entities) ? entities : [entities];
  const htmlParts = entitiesArray.map(entity => generateSingleEntity(entity, wrapperConfig));
  
  const combinedHTML = htmlParts.join('\n');
  
  if (wrapperConfig.wrapAll) {
    return wrapperConfig.wrapAll(combinedHTML);
  }
  
  return combinedHTML;
}

// Einzelne Entity verarbeiten
function generateSingleEntity(
  entity: Entity, 
  wrapperConfig: WrapperConfig
): string {
  const tagName = entity.type;
  const attributes = extractAttributes(entity);
  const attributesString = buildAttributesString(attributes);
  
  // Rekursiv Children verarbeiten
  const childrenHTML = entity.children && entity.children.length > 0
    ? entity.children.map(child => generateSingleEntity(child, wrapperConfig)).join('\n')
    : '';
  
  // HTML erstellen
  let html = childrenHTML
    ? `<${tagName}${attributesString}>\n${childrenHTML}\n</${tagName}>`
    : `<${tagName}${attributesString} />`;
  
  // Entity-spezifische Wrapper
  if (wrapperConfig.before) {
    html = wrapperConfig.before(entity) + html;
  }
  if (wrapperConfig.after) {
    html = html + wrapperConfig.after(entity);
  }
  
  return html;
}

// Attribute extrahieren basierend auf Entity-Typ
function extractAttributes(entity: Entity): Record<string, any> {
  const attributes: Record<string, any> = {};
  
  if (entity.type === 'TabPage') {
    // TabPage: Attribute auf oberster Ebene
    const tabPage = entity as TabPageEntity;
    attributes.id = tabPage.name;
    attributes.name = tabPage.name; // name wird zu id UND name
    attributes.tab = tabPage.tabIndex;
  } else {
    // Standard: Attribute aus inputs
    const standardEntity = entity as StandardEntity;
    if (standardEntity.id) {
      attributes.id = standardEntity.id;
    }
    
    // Inputs verarbeiten und gruppierte Attribute sammeln
    if (standardEntity.inputs) {
      const processedInputs = processInputs(standardEntity.inputs);
      Object.assign(attributes, processedInputs);
    }
  }
  
  return attributes;
}

// Inputs verarbeiten und numerierte Attribute zu Arrays gruppieren
function processInputs(inputs: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  const groupedAttributes: Record<string, any[]> = {};
  
  Object.entries(inputs).forEach(([key, value]) => {
    // Prüfen ob es ein numeriertes Attribut ist (z.B. actions_trigger_0)
    const match = key.match(/^(.+?)_(\d+)$/);
    
    if (match) {
      // Numeriertes Attribut - für Gruppierung sammeln
      const [, baseKey, index] = match;
      const numIndex = parseInt(index);
      
      if (!groupedAttributes[baseKey]) {
        groupedAttributes[baseKey] = [];
      }
      
      // Sicherstellen dass Array groß genug ist
      while (groupedAttributes[baseKey].length <= numIndex) {
        groupedAttributes[baseKey].push(null);
      }
      
      groupedAttributes[baseKey][numIndex] = value;
    } else {
      // Normales Attribut
      if (key === 'name') {
        // name wird zu id UND name
        result.id = value;
        result.name = value;
      } else if (key === 'class') {
        // class bleibt class (nicht klasse, da wir HTML generieren)
        if (value !== '') {
          result.class = value;
        }
      } else if (shouldIncludeAttribute(key, value)) {
        result[key] = value;
      }
    }
  });
  
  // Gruppierte Attribute zu Arrays konvertieren
  processGroupedAttributes(groupedAttributes, inputs, result);
  
  return result;
}

// Gruppierte Attribute verarbeiten (Triple_List, Double_List, etc.)
function processGroupedAttributes(
  grouped: Record<string, any[]>, 
  originalInputs: Record<string, any>,
  result: Record<string, any>
): void {
  
  Object.entries(grouped).forEach(([baseKey, values]) => {
    // Bestimme den Array-Typ basierend auf dem baseKey
    if (baseKey.startsWith('actions_')) {
      // Triple_List für actions
      const actions = buildTripleList(baseKey, originalInputs);
      if (actions.length > 0) {
        result.actions = actions;
      }
    } else if (baseKey === 'options') {
      // Double_List für options
      const options = buildDoubleList(values);
      if (options.length > 0) {
        result.options = options;
      }
    } else if (baseKey === 'If') {
      // Mix_List für If-Bedingungen
      const ifConditions = buildMixList(baseKey, originalInputs);
      if (ifConditions.length > 0) {
        result.If = ifConditions;
      }
    }
  });
  
  // Spezialbehandlung für firstOption (Double_Single)
  if (originalInputs.firstOption) {
    const firstOptionValue = originalInputs.firstOption;
    if (firstOptionValue && firstOptionValue !== '') {
      // Annahme: firstOption kommt als String mit Trennzeichen
      const parts = firstOptionValue.split(',').map((s: string) => s.trim());
      if (parts.length === 2) {
        result.firstOption = parts;
      }
    }
  }
}

// Triple_List erstellen (für actions)
function buildTripleList(baseKey: string, inputs: Record<string, any>): any[][] {
  const triples: any[][] = [];
  let index = 0;
  
  // Sammle alle actions_*_n Attribute
  while (true) {
    const trigger = inputs[`actions_trigger_${index}`];
    const action = inputs[`actions_action_${index}`];
    const targetId = inputs[`actions_target_id_${index}`];
    
    if (trigger === undefined && action === undefined && targetId === undefined) {
      break;
    }
    
    // Nur hinzufügen wenn mindestens ein Wert vorhanden ist
    if (trigger || action || targetId) {
      triples.push([trigger || '', action || '', targetId || '']);
    }
    
    index++;
  }
  
  return triples;
}

// Double_List erstellen (für options)
function buildDoubleList(values: any[]): any[][] {
  const pairs: any[][] = [];
  
  for (let i = 0; i < values.length; i += 2) {
    if (values[i] !== null || values[i + 1] !== null) {
      pairs.push([values[i] || '', values[i + 1] || '']);
    }
  }
  
  return pairs;
}

// Mix_List erstellen (für If-Bedingungen)
function buildMixList(baseKey: string, inputs: Record<string, any>): any[][] {
  const conditions: any[][] = [];
  let index = 0;
  
  // Sammle alle If_*_n Attribute
  while (true) {
    const value = inputs[`${baseKey}_${index}`];
    
    if (value === undefined) {
      break;
    }
    
    // Parse value - könnte ein String mit Kommas sein
    if (typeof value === 'string' && value.includes(',')) {
      conditions.push(value.split(',').map(s => s.trim()));
    } else if (value) {
      conditions.push([value]);
    }
    
    index++;
  }
  
  return conditions;
}

// Prüfen ob Attribut eingeschlossen werden soll
function shouldIncludeAttribute(key: string, value: any): boolean {
  // Leere Strings ignorieren
  if (value === '') return false;
  
  // Boolean false ignorieren (Astro-Konvention)
  if (typeof value === 'boolean' && value === false) return false;
  
  // Numerierte Attribute werden separat behandelt
  if (/^.+_\d+$/.test(key)) return false;
  
  return true;
}

// Attribute zu String konvertieren
function buildAttributesString(attributes: Record<string, any>): string {
  const parts: string[] = [];
  
  Object.entries(attributes).forEach(([key, value]) => {
    const attrString = formatAttribute(key, value);
    if (attrString) {
      parts.push(attrString);
    }
  });
  
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

// Einzelnes Attribut formatieren
function formatAttribute(key: string, value: any): string {
  // Boolean true als einzelnes Attribut (Astro-Konvention)
  if (value === true) {
    return key;
  }
  
  // Arrays formatieren
  if (Array.isArray(value)) {
    // Nested Arrays (Triple_List, Double_List, Mix_List)
    if (value.length > 0 && Array.isArray(value[0])) {
      const formattedArray = value.map(item =>
        `[${item.map((v: any) => JSON.stringify(v)).join(', ')}]`
      ).join(', ');
      return `${key}={[${formattedArray}]}`;
    }
    // Einfaches Array (Double_Single)
    const formattedArray = value.map((v: any) => JSON.stringify(v)).join(', ');
    return `${key}={[${formattedArray}]}`;
  }
  
  // Numbers
  if (typeof value === 'number') {
    return `${key}={${value}}`;
  }
  
  // Strings
  if (typeof value === 'string') {
    return `${key}="${value}"`;
  }
  
  return '';
}

// Verwendungsbeispiel
const wrapperConfig: WrapperConfig = {
  before: (entity) => {
    if (entity.type === 'TabPage') {
      return `<!-- TabPage: ${(entity as TabPageEntity).name} -->\n`;
    }
    return '';
  },
  after: (entity) => {
    if (entity.type === 'TabPage') {
      return '\n<!-- /TabPage -->';
    }
    return '';
  },
  wrapAll: (html) => {
    return `<!-- Generated HTML -->\n${html}\n<!-- /Generated HTML -->`;
  }
};