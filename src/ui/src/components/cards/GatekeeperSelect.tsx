import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const gatekeeperSelectConfig: CardConfig = {
  defaultName: 'GatekeeperSelect',
  codegenName: 'GatekeeperSelect',
  canBeParent: false,
  attributes: [
    { name: 'options', type: 'string', toolTip: 'Array of options [[value, label], ...]', optional: false },
    { name: 'actions', type: 'string', toolTip: 'Gatekeeper actions array [[value, action, target], ...]', optional: true },
    { name: 'firstOption', type: 'string', toolTip: 'First option [value, label]', optional: true },
    { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
    { name: 'required', type: 'checkbox', toolTip: 'Whether this select is required', optional: false },
    { name: 'disabled', type: 'checkbox', toolTip: 'Disable this select', optional: false },
    { name: 'data-gate', type: 'string', toolTip: 'Gate group identifier', optional: true },
    { name: 'data-lock', type: 'checkbox', toolTip: 'Lock page navigation', optional: true },
    { name: 'data-call', type: 'string', toolTip: 'Additional functions to call', optional: true },
    { name: 'data-preset', type: 'string', toolTip: 'Preset value for this select', optional: true },
    { name: 'data-submit', type: 'string', toolTip: 'Submit target for this select', optional: true },
  ],
  renderPreview: (name, id) => (
    <>
      <div>
        <label htmlFor={`${id}_select`}>{name}</label>
        <span className="errormessage"></span>
      </div>
      <select className="dropdown h-drop">
        <option value="">Bitte Auswählen</option>
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
      </select>
    </>
  )
}

export default function GatekeeperSelectCard({ id }: { id: string }) {
  return <BaseCard id={id} config={gatekeeperSelectConfig} />
}
