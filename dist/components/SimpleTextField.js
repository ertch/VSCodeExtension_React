"use strict";
// TODO: Alte Generator-Funktion für Legacy-System
// Muss für neues cardComponents-System neu geschrieben werden
// Siehe: src/ui/src/components/cards/
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSimpleTextfield = generateSimpleTextfield;
function generateSimpleTextfield(props) {
    const component_Id = props.id + '_' + Math.random().toString(36).substring(2, 9);
    const errorname = `${component_Id}_errorMsg`;
    const hide = props.hidden ? ` d-none` : "";
    const setClass = `${props.klasse ? ` ${props.klasse}` : ""}${hide}`;
    return `
<div id="${component_Id}_label" class="${hide}">
  <label for="${component_Id}">${props.label}</label>
  <span class="errormessage" id="${errorname}"></span>
</div>

<textarea
  class="${setClass}"
  id="${component_Id}"
  rows="${props.row}"
  cols="${props.col}"
  value="${props.value || ''}"
  ${props.required ? "required" : ""}
  onblur="autoResize(${component_Id})"
  maxlength="${props.maxlength || ''}"
  data-call="${props.call || ''}"
  data-vali="${props.validate || ''}"
  data-required="false"
  data-submit="${props.submitTo || ''}"
>
</textarea>
    `.trim();
}
