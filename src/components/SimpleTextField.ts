export function generateSimpleTextfield(props: {
    id: string;
    label: string;
    row: string;
    col: string;
    call?: string;
    value?: string;
    required?: boolean;
    maxlength?: string;
    submitTo?: string;
    klasse?: string;
    hidden?: boolean;
    validate?: string;
}): string {
    const errorname = `${props.id}_errorMsg`;
    const hide = props.hidden ? ` d-none` : "";
    const setClass = `${props.klasse ? ` ${props.klasse}` : ""}${hide}`;

    return `
<div id="${props.id}_label" class="${hide}">
  <label for="${props.id}">${props.label}</label>
  <span class="errormessage" id="${errorname}"></span>
</div>

<textarea
  class="${setClass}"
  id="${props.id}"
  rows="${props.row}"
  cols="${props.col}"
  value="${props.value || ''}"
  ${props.required ? "required" : ""}
  onblur="autoResize(${props.id})"
  maxlength="${props.maxlength || ''}"
  data-call="${props.call || ''}"
  data-vali="${props.validate || ''}"
  data-required="false"
  data-submit="${props.submitTo || ''}"
>
</textarea>
    `.trim();
}