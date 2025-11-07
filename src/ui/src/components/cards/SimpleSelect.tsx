import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const simpleSelectConfig: CardConfig = {

  canBeParent: false,

  attributes: [ // Card attributes for form
    { name: 'options', type: 'double_list', toolTip: 'Array of options [[value, label], ...]', optional: false },
    { name: 'actions', type: 'tripple_list', toolTip: 'Array of actions for option triggers', optional: true },
    { name: 'firstOption', type: 'double_single', toolTip: 'First option [value, label]', optional: true },
    { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
    { name: 'required', type: 'checkbox', toolTip: 'Whether this select is required', optional: false },
    { name: 'disabled', type: 'checkbox', toolTip: 'Disable this select', optional: false },
    { name: 'hidden', type: 'checkbox', toolTip: 'Hide this select', optional: false },
    { name: 'data-required', type: 'string', toolTip: 'Required value validation', optional: true },
    { name: 'onchange', type: 'function', toolTip: 'Function to call on change', optional: true },
    { name: 'data-trigger', type: 'double_single', toolTip: 'Trigger actions array', optional: true },
    { name: 'data-preset', type: 'string', toolTip: 'Preset value for this select', optional: true },
    { name: 'data-submit', type: 'tripple_single', toolTip: 'Submit target for this select', optional: true },
  ],

  renderPreview: (name, id) => ( // Preview card HTML
    <>
      <div>
        <label htmlFor={`${id}_select`}>{name}</label>
        <span className="errormessage"></span>
      </div>
      <select className="dropdown h-drop">
        <option value="" disabled>[Bitte auswählen]</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    </>
  )
}

export default function SimpleSelectCard({ id }: { id: string }) {
  return <BaseCard id={id} config={simpleSelectConfig} />
}
