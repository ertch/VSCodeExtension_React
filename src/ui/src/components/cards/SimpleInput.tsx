import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const simpleInputConfig: CardConfig = {
  defaultName: 'SimpleInput',
  codegenName: 'SimpleInput',
  canBeParent: false,
  attributes: [
    { name: 'type', type: 'string', toolTip: '', optional: false },
    { name: 'class', type: 'string', toolTip: '', optional: false },
    { name: 'value', type: 'string', toolTip: '', optional: false },
    { name: 'required', type: 'checkbox', toolTip: '', optional: false },
    { name: 'disabled', type: 'checkbox', toolTip: '', optional: false },
    { name: 'maxlength', type: 'string', toolTip: '', optional: true },
    { name: 'pattern', type: 'string', toolTip: 'regExP', optional: true },
    { name: 'data-preset', type: 'string', toolTip: '', optional: true },
    { name: 'onchange', type: 'function', toolTip: '', optional: true },
    { name: 'onblur', type: 'function', toolTip: '', optional: true },
    { name: 'data-vali', type: 'string', toolTip: '', optional: true },
    { name: 'data-submit', type: 'tripple_submit', toolTip: 'Hallo Ich blockiere dich', optional: true },
    { name: 'data-call', type: 'string', toolTip: '', optional: true },
    { name: 'min', type: 'string', toolTip: '', optional: true },
    { name: 'max', type: 'string', toolTip: '', optional: true },
  ],
  renderPreview: (name, id) => (
    <>
      <div>
        <label htmlFor={`${id}_input`}>{name}</label>
      </div>
      <input className='input-text' />
    </>
  )
}

export default function SimpleInputCard({ id }: { id: string }) {
  return <BaseCard id={id} config={simpleInputConfig} />
}