import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const simpleTextfieldConfig: CardConfig = {
  defaultName: 'SimpleTextfield',
  codegenName: 'SimpleTextfield',
  canBeParent: false,
  attributes: [
    { name: 'row', type: 'string', toolTip: 'Number of rows for the textarea', optional: false },
    { name: 'col', type: 'string', toolTip: 'Number of columns for the textarea', optional: false },
    { name: 'class', type: 'string', toolTip: 'CSS class for styling', optional: true },
    { name: 'value', type: 'string', toolTip: 'Default value of the textarea', optional: true },
    { name: 'required', type: 'checkbox', toolTip: 'Whether this field is required', optional: false },
    { name: 'maxlength', type: 'string', toolTip: 'Maximum character length', optional: true },
    { name: 'data-call', type: 'string', toolTip: 'JavaScript function to call', optional: true },
    { name: 'data-vali', type: 'string', toolTip: 'Validation function name', optional: true },
    { name: 'data-submit', type: 'string', toolTip: 'Submit target for this field', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'Hide this textarea', optional: false },
  ],
  renderPreview: (name, id) => (
    <>
      <div>
        <label htmlFor={`${id}_input`}>{name}</label>
        <span className="errormessage"></span>
      </div>
      <textarea
        className="input-text"
        rows={3}
        cols={30}
      />
    </>
  )
}

export default function SimpleTextfieldCard({ id }: { id: string }) {
  return <BaseCard id={id} config={simpleTextfieldConfig} />
}
