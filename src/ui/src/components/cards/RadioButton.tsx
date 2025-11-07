import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const radioButtonConfig: CardConfig = {
  defaultName: 'RadioButton',
  codegenName: 'RadioButton',
  canBeParent: false,
  attributes: [
    { name: 'name', type: 'string', toolTip: 'Radio button group name', optional: false },
    { name: 'required', type: 'checkbox', toolTip: 'Whether this radio button is required', optional: false },
    { name: 'value', type: 'string', toolTip: 'Value of this radio button option', optional: false },
    { name: 'data-submit', type: 'string', toolTip: 'Submit target for this radio button', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'Hide this radio button', optional: false },
  ],
  renderPreview: (name, id) => (
    <>
      <div className="radio-option">
        <input
          className="radio-option__input"
          type="radio"
        />
        <label className="radio-option__label" htmlFor={`${id}_input`}>{name}</label>
      </div>
    </>
  )
}

export default function RadioButtonCard({ id }: { id: string }) {
  return <BaseCard id={id} config={radioButtonConfig} />
}
