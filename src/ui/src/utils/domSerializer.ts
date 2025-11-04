// src/ui/src/utils/domSerializer.ts

import type { ComponentNode } from '../../../shared/messageProtocol';
import type { ComponentPaletteEntry } from './componentPalette';

// ============================================================================
// INPUT VALUE EXTRACTION
// ============================================================================

/**
 * Extrahiert alle Input-Werte aus einem DOM-Element
 *
 * PURPOSE (DEUTSCH):
 * - React State enthaelt nur defaultProps
 * - User kann Werte in Inputs aendern
 * - Diese Funktion extrahiert aktuelle DOM-Werte
 *
 * SUPPORTED INPUT TYPES:
 * - <input type="text|number|email|..."> → string
 * - <input type="checkbox"> → boolean
 * - <input type="radio"> → string (only if checked)
 * - <select> → string or string[] (if multiple)
 * - <textarea> → string
 *
 * @param el - DOM-Element das durchsucht werden soll
 * @returns Object mit Key-Value-Paaren (input name/id → value)
 */
export function extractInputsFromElement(el: HTMLElement): Record<string, any> {
  const inputs = el.querySelectorAll('input, select, textarea');
  const data: Record<string, any> = {};

  inputs.forEach((inp) => {
    // Explizit ignorierte Inputs
    if ((inp as HTMLInputElement).id === 'preview') return;
    if ((inp as HTMLInputElement).disabled) return;

    // Key aus name oder id extrahieren
    let key = (inp as HTMLInputElement).name || (inp as HTMLInputElement).id;
    if (!key) return;

    if (inp instanceof HTMLInputElement) {
      if (inp.type === 'checkbox') {
        // Checkbox: Boolean-Wert (checked)
        data[key] = inp.checked;
      } else if (inp.type === 'radio') {
        // Radio: String-Wert (nur wenn checked)
        if (inp.checked) data[key] = inp.value;
      } else {
        // Alle anderen Input-Typen: String-Wert
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLSelectElement) {
      // Select: String oder String[] (wenn multiple)
      if (inp.multiple) {
        data[key] = Array.from(inp.selectedOptions).map((o) => o.value);
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLTextAreaElement) {
      // Textarea: String-Wert
      data[key] = inp.value;
    }
  });

  return data;
}

// ============================================================================
// TREE SERIALIZATION
// ============================================================================

/**
 * Serialisiert den Tree mit DOM-Input-Werten
 *
 * FLOW (DEUTSCH):
 * 1. Traversiere Tree rekursiv
 * 2. Fuer jede Node: Finde DOM-Element via data-node-id
 * 3. Extrahiere Input-Werte aus DOM-Element
 * 4. Merge Props mit Input-Werten (Inputs ueberschreiben!)
 * 5. Extrahiere compName aus data-compname Attribut
 * 6. Rekursiv fuer alle Children
 *
 * WICHTIG (DEUTSCH):
 * - Inputs OVERRIDE props (Spread-Operator-Reihenfolge: `{ ...node.props, ...inputs }`)
 * - compName wird aus data-compname Attribut extrahiert (Fallback: node.compName)
 * - Behandelt null rootElement gracefully (gibt Tree unveraendert zurueck)
 *
 * @param tree - Array von ComponentNodes
 * @param rootElement - Root DOM-Element (oder null wenn nicht verfuegbar)
 * @returns Neuer Tree mit aktualisierten Props
 */
export function serializeTree(
  tree: ComponentNode[],
  rootElement: HTMLElement | null
): ComponentNode[] {
  // Graceful handling wenn rootElement nicht verfuegbar
  if (!rootElement) {
    console.warn('domSerializer: rootElement is null, returning tree as-is');
    return tree;
  }

  /**
   * Rekursive Visitor-Funktion fuer jeden Node
   */
  function visitNode(node: ComponentNode): ComponentNode {
    // Finde korrespondierendes DOM-Element via data-node-id
    const wrapperEl = rootElement.querySelector<HTMLElement>(
      `[data-node-id="${node.id}"]`
    );

    // Extrahiere compName aus data-compname Attribut (Fallback: node.compName)
    const compName =
      wrapperEl?.getAttribute('data-compname') || node.compName;

    // Extrahiere Input-Werte aus DOM-Element
    const inputs = wrapperEl ? extractInputsFromElement(wrapperEl) : {};

    // Merge props mit inputs (INPUTS OVERRIDE PROPS!)
    const props = { ...node.props, ...inputs };

    // Rekursiv fuer alle Children
    const children = node.children
      ? node.children.map(visitNode)
      : undefined;

    return {
      id: node.id,
      type: node.type,
      props,
      children,
      compName,
    };
  }

  return tree.map(visitNode);
}

// ============================================================================
// TREE DESERIALIZATION
// ============================================================================

/**
 * Deserialisiert JSON zurueck zu Tree-State
 *
 * PURPOSE (DEUTSCH):
 * - Wird beim Laden von .ttEditor.json verwendet
 * - Rekonstruiert Tree aus gespeichertem JSON
 * - Fuegt fehlende compName aus Palette hinzu (Fallback)
 *
 * WICHTIG (DEUTSCH):
 * - JSON kann incomplete sein (z.B. fehlendes compName nach Migration)
 * - Fallback: compName aus paletteMap holen
 * - Ultimate Fallback: `<${jsonNode.type} />` wenn nicht in Palette gefunden
 *
 * @param jsonTree - Array von JSON-Nodes (aus .ttEditor.json)
 * @param paletteMap - Map von ComponentPaletteEntries fuer Lookup
 * @returns Rekonstruierter Tree mit kompletten Daten
 */
export function deserializeTree(
  jsonTree: ComponentNode[],
  paletteMap: Map<string, ComponentPaletteEntry>
): ComponentNode[] {
  /**
   * Rekursive Visitor-Funktion fuer jeden JSON-Node
   */
  function visitNode(jsonNode: ComponentNode): ComponentNode {
    // Hole Meta-Info aus Palette
    const meta = paletteMap.get(jsonNode.type);

    // Rekonstruiere compName mit Fallbacks
    const compName =
      jsonNode.compName ||
      meta?.compName ||
      `<${jsonNode.type} />`; // Ultimate Fallback

    // Rekursiv fuer alle Children
    const children = jsonNode.children
      ? jsonNode.children.map(visitNode)
      : undefined;

    return {
      id: jsonNode.id,
      type: jsonNode.type,
      props: jsonNode.props || {},
      children,
      compName,
    };
  }

  return jsonTree.map(visitNode);
}
