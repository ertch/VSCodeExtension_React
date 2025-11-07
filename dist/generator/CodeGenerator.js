"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateHTML = generateHTML;
// Hauptfunktion mit Einrückung - Erweiterte Version
function generateHTML(entities, wrapperConfig = {}) {
    const entitiesArray = Array.isArray(entities) ? entities : [entities];
    const tabs = [];
    const componentsSet = new Set();
    // HTML generieren und dabei tabs + components sammeln
    const htmlParts = entitiesArray.map((entity, index) => {
        // Tabs sammeln (Start-Tab überspringen)
        if (entity.type === 'TabPage') {
            const tabPage = entity;
            if (tabPage.name !== 'Start' && tabPage.tabIndex > 0) {
                tabs.push([
                    `tab${tabPage.tabIndex}`,
                    `tab_${tabPage.name}`,
                    tabPage.name
                ]);
            }
        }
        // Components sammeln (rekursiv durch den Baum)
        collectComponents(entity, componentsSet);
        return generateSingleEntity(entity, wrapperConfig, 0);
    });
    const combinedHTML = htmlParts.join('\n');
    const finalHTML = wrapperConfig.wrapAll ? wrapperConfig.wrapAll(combinedHTML) : combinedHTML;
    return {
        tabs,
        components: Array.from(componentsSet),
        html: finalHTML
    };
}
// Hilfsfunktion: Sammelt alle verwendeten Component-Typen
function collectComponents(entity, componentsSet) {
    if (entity.type !== 'TabPage') {
        componentsSet.add(entity.type);
    }
    if (entity.children) {
        entity.children.forEach(child => collectComponents(child, componentsSet));
    }
}
// Einzelne Entity mit Einrückungstiefe verarbeiten
function generateSingleEntity(entity, wrapperConfig, depth = 0) {
    const indent = '  '.repeat(depth);
    const tagName = entity.type;
    const attributes = extractAttributes(entity);
    const attributesString = buildAttributesString(attributes);
    // Rekursiv Children mit erhöhter Tiefe verarbeiten
    const childrenHTML = entity.children && entity.children.length > 0
        ? entity.children.map(child => generateSingleEntity(child, wrapperConfig, depth + 1)).join('\n')
        : '';
    // HTML mit korrekter Einrückung erstellen
    let html;
    if (childrenHTML) {
        html = `${indent}<${tagName}${attributesString}>\n${childrenHTML}\n${indent}</${tagName}>`;
    }
    else {
        html = `${indent}<${tagName}${attributesString} />`;
    }
    // Entity-spezifische Wrapper (nur auf oberster Ebene)
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
// Attribute extrahieren basierend auf Entity-Typ
function extractAttributes(entity) {
    const attributes = {};
    if (entity.type === 'TabPage') {
        // TabPage: name wird zu id und name, tabIndex wird zu tab (als String)
        const tabPage = entity;
        attributes.id = tabPage.name;
        attributes.name = tabPage.name;
        attributes.tab = String('tab' + tabPage.tabIndex);
    }
    else {
        // Standard: name aus inputs wird zu id
        const standardEntity = entity;
        if (standardEntity.inputs) {
            const processedInputs = processInputs(standardEntity.inputs);
            Object.assign(attributes, processedInputs);
        }
    }
    return attributes;
}
// Inputs verarbeiten und numerierte Attribute zu Arrays gruppieren
function processInputs(inputs) {
    const result = {};
    const groupedAttributes = {};
    // Zuerst name verarbeiten für id
    if (inputs.name && inputs.name !== '') {
        result.id = inputs.name;
        result.name = inputs.name;
    }
    Object.entries(inputs).forEach(([key, value]) => {
        // Skip empty values und name (bereits verarbeitet)
        if (value === '' || value === null || value === undefined || key === 'name') {
            return;
        }
        // Prüfen ob es ein numeriertes Attribut ist
        const match = key.match(/^(.+?)_(\d+)$/);
        if (match) {
            // Numeriertes Attribut - für Gruppierung sammeln
            const [, baseKey, index] = match;
            const numIndex = parseInt(index);
            if (!groupedAttributes[baseKey]) {
                groupedAttributes[baseKey] = [];
            }
            while (groupedAttributes[baseKey].length <= numIndex) {
                groupedAttributes[baseKey].push(null);
            }
            groupedAttributes[baseKey][numIndex] = value;
        }
        else {
            // Normales Attribut
            if (shouldIncludeAttribute(key, value)) {
                result[key] = value;
            }
        }
    });
    // Gruppierte Attribute zu Arrays konvertieren
    processGroupedAttributes(groupedAttributes, inputs, result);
    return result;
}
// Gruppierte Attribute verarbeiten (Triple_List, Double_List, etc.)
function processGroupedAttributes(grouped, originalInputs, result) {
    Object.entries(grouped).forEach(([baseKey, values]) => {
        // Bestimme den Array-Typ basierend auf dem baseKey
        if (baseKey.startsWith('actions_')) {
            // Triple_List für actions
            const actions = buildTripleList(baseKey, originalInputs);
            if (actions.length > 0) {
                result.actions = actions;
            }
        }
        else if (baseKey === 'options') {
            // Double_List für options
            const options = buildDoubleList(values);
            if (options.length > 0) {
                result.options = options;
            }
        }
        else if (baseKey === 'If') {
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
            const parts = firstOptionValue.split(',').map((s) => s.trim());
            if (parts.length === 2) {
                result.firstOption = parts;
            }
        }
    }
}
// Triple_List erstellen (für actions)
function buildTripleList(baseKey, inputs) {
    const triples = [];
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
function buildDoubleList(values) {
    const pairs = [];
    for (let i = 0; i < values.length; i += 2) {
        if (values[i] !== null || values[i + 1] !== null) {
            pairs.push([values[i] || '', values[i + 1] || '']);
        }
    }
    return pairs;
}
// Mix_List erstellen (für If-Bedingungen)
function buildMixList(baseKey, inputs) {
    const conditions = [];
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
        }
        else if (value) {
            conditions.push([value]);
        }
        index++;
    }
    return conditions;
}
// Prüfen ob Attribut eingeschlossen werden soll
function shouldIncludeAttribute(key, value) {
    // Leere Strings ignorieren
    if (value === '')
        return false;
    // Boolean false ignorieren (Astro-Konvention)
    if (typeof value === 'boolean' && value === false)
        return false;
    // Numerierte Attribute werden separat behandelt
    if (/^.+_\d+$/.test(key))
        return false;
    return true;
}
// Attribute zu String konvertieren
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
// Einzelnes Attribut formatieren
function formatAttribute(key, value) {
    // Boolean true als einzelnes Attribut (Astro-Konvention)
    if (value === true) {
        return key;
    }
    // Arrays formatieren
    if (Array.isArray(value)) {
        // Nested Arrays (Triple_List, Double_List, Mix_List)
        if (value.length > 0 && Array.isArray(value[0])) {
            const formattedArray = value.map(item => `[${item.map((v) => JSON.stringify(v)).join(', ')}]`).join(', ');
            return `${key}={[${formattedArray}]}`;
        }
        // Einfaches Array (Double_Single)
        const formattedArray = value.map((v) => JSON.stringify(v)).join(', ');
        return `${key}={[${formattedArray}]}`;
    }
    // Numbers - Astro Syntax mit geschweiften Klammern
    if (typeof value === 'number') {
        return `${key}={${value}}`;
    }
    // Strings
    if (typeof value === 'string' && value !== '') {
        return `${key}="${value}"`;
    }
    // Objects (für komplexere Astro-Props)
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return `${key}={${JSON.stringify(value)}}`;
    }
    return '';
}
// Verwendungsbeispiel
const wrapperConfig = {
    before: (entity) => {
        if (entity.type === 'TabPage') {
            return `<!-- TabPage: ${entity.name} -->`;
        }
        return '';
    },
    after: (entity) => {
        if (entity.type === 'TabPage') {
            return '<!-- /TabPage -->';
        }
        return '';
    },
    wrapAll: (html) => {
        return `<!-- Generated HTML -->\n${html}\n<!-- /Generated HTML -->`;
    }
};
