"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractInputsFromElement = extractInputsFromElement;
function extractInputsFromElement(el) {
    const nodeId = el.getAttribute('data-node-id');
    if (!nodeId)
        return {};
    const contentArea = el.querySelector(`[data-content-area="${nodeId}"]`);
    if (!contentArea)
        return {};
    const inputs = contentArea.querySelectorAll("input, select, textarea");
    const data = {};
    inputs.forEach((inp) => {
        if (inp.id === "preview")
            return;
        if (inp instanceof HTMLInputElement || inp instanceof HTMLSelectElement || inp instanceof HTMLTextAreaElement) {
            if (inp.disabled)
                return;
        }
        let key = '';
        if (inp instanceof HTMLInputElement || inp instanceof HTMLSelectElement || inp instanceof HTMLTextAreaElement) {
            key = inp.name || inp.id;
        }
        if (!key)
            return;
        if (inp instanceof HTMLInputElement) {
            if (inp.type === "checkbox") {
                data[key] = inp.checked;
            }
            else if (inp.type === "radio") {
                if (inp.checked)
                    data[key] = inp.value;
            }
            else {
                data[key] = inp.value;
            }
        }
        else if (inp instanceof HTMLSelectElement) {
            if (inp.multiple) {
                data[key] = Array.from(inp.selectedOptions).map((o) => o.value);
            }
            else {
                data[key] = inp.value;
            }
        }
        else if (inp instanceof HTMLTextAreaElement) {
            data[key] = inp.value;
        }
    });
    return data;
}
//# sourceMappingURL=extractInputs.js.map