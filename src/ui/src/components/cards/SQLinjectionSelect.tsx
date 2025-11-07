import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const sqlInjectionSelectConfig: CardConfig = {
  defaultName: 'SQLinjectionSelect',
  codegenName: 'SQLinjectionSelect',
  canBeParent: false,
  attributes: [
    { name: 'data-injection', type: 'string', toolTip: 'SQL injection loader function', optional: true },
    { name: 'required', type: 'checkbox', toolTip: 'Whether this select is required', optional: false },
    { name: 'data-required', type: 'string', toolTip: 'Required value validation', optional: true },
    { name: 'onchange', type: 'function', toolTip: 'Function to call on change', optional: true },
    { name: 'data-trigger', type: 'string', toolTip: 'Trigger actions array', optional: true },
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
        <option value="" disabled>[Bitte Auswählen]</option>
      </select>
    </>
  )
}

export default function SQLinjectionSelectCard({ id }: { id: string }) {
  return <BaseCard id={id} config={sqlInjectionSelectConfig} />
}
