/**
 * DOM Serializer
 * Extrahiert Werte aus DOM-Elementen (Inputs) und serialisiert Canvas-State
 */

/**
 * Extrahiert alle Input-Werte aus einem DOM-Element
 * Ignoriert Inputs mit id="preview"
 */
export function extractInputsFromElement(el) {
  const inputs = el.querySelectorAll('input, select, textarea');
  const data = {};

  inputs.forEach((inp) => {
    // Explizit ignorieren
    if (inp.id === 'preview') return;
    if (inp.disabled) return;

    let key = inp.name || inp.id;
    if (!key) return;

    if (inp instanceof HTMLInputElement) {
      if (inp.type === 'checkbox') {
        data[key] = inp.checked;
      } else if (inp.type === 'radio') {
        if (inp.checked) data[key] = inp.value;
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLSelectElement) {
      if (inp.multiple) {
        data[key] = Array.from(inp.selectedOptions).map((o) => o.value);
      } else {
        data[key] = inp.value;
      }
    } else if (inp instanceof HTMLTextAreaElement) {
      data[key] = inp.value;
    }
  });

  return data;
}

/**
 * Serialisiert den kompletten Tree mit DOM-Inputs
 */
export function serializeTree(tree, rootElement) {
  if (!rootElement) return tree;

  function visitNode(node) {
    // Finde das entsprechende DOM-Element
    const wrapperEl = rootElement.querySelector(`[data-node-id="${node.id}"]`);

    // Extrahiere codeGen
    let codeGenRaw = wrapperEl?.getAttribute('data-codegen');
    let codeGen = null;
    if (codeGenRaw) {
      try {
        codeGen = JSON.parse(codeGenRaw);
      } catch {
        codeGen = codeGenRaw; // Fallback if not JSON
      }
    }

    // Extrahiere Input-Werte
    const inputs = wrapperEl ? extractInputsFromElement(wrapperEl) : {};

    // Merge props mit inputs
    const props = { ...node.props, ...inputs };

    return {
      id: node.id,
      type: node.type,
      props,
      children: (node.children || []).map(visitNode),
      codeGen: codeGen || node.codeGen,
    };
  }

  return tree.map(visitNode);
}

/**
 * Deserialisiert JSON zu Tree-State
 */
export function deserializeTree(jsonTree, paletteMap) {
  function visitNode(jsonNode) {
    const meta = paletteMap[jsonNode.type];

    return {
      id: jsonNode.id,
      type: jsonNode.type,
      props: jsonNode.props || {},
      children: (jsonNode.children || []).map(visitNode),
      codeGen: jsonNode.codeGen || { component: jsonNode.type },
    };
  }

  return jsonTree.map(visitNode);
}
