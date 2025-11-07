import { EntityInputs } from '../generator/types'; // From Domain 1

/**
 * Extract form inputs from DOM element
 * @param el - Container element with data-node-id
 * @returns EntityInputs object (from Domain 1)
 */
export function extractInputsFromElement(el: HTMLElement): EntityInputs {
  try {
    const nodeId = el.getAttribute('data-node-id');
    if (!nodeId) return {};

    const contentArea = el.querySelector(`[data-content-area="${nodeId}"]`);
    if (!contentArea) return {};

    const inputs = contentArea.querySelectorAll('input, select, textarea');
    const data: EntityInputs = {};

    inputs.forEach((inp) => {
      // Skip preview inputs
      if (inp.id === 'preview') return;

      // Skip disabled inputs
      if (
        inp instanceof HTMLInputElement ||
        inp instanceof HTMLSelectElement ||
        inp instanceof HTMLTextAreaElement
      ) {
        if (inp.disabled) return;
      }

      // Get input key (name or id)
      let key = '';
      if (
        inp instanceof HTMLInputElement ||
        inp instanceof HTMLSelectElement ||
        inp instanceof HTMLTextAreaElement
      ) {
        key = inp.name || inp.id;
      }
      if (!key) return;

      // Extract value based on input type
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
  } catch (error) {
    console.error('[extractInputs] Failed:', error);
    return {}; // Return empty object on error
  }
}
