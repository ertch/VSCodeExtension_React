import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const simpleTextfieldConfig: CardConfig = {
  defaultName: 'SimpleTextfield',
  codegenName: 'SimpleTextfield',
  canBeParent: false,
  attributes: [
    { name: 'row', type: 'string', toolTip: 'Anzahl der Zeilen', optional: false },
    { name: 'col', type: 'string', toolTip: 'Anzal der Spalten', optional: false },
    { name: 'class', type: 'string', toolTip: 'zusätzliche CSS-Klassen', optional: true },
    { name: 'value', type: 'string', toolTip: 'Startwert (standard = "" )', optional: true },
    { name: 'required', type: 'checkbox', toolTip: 'Pflichtangabe', optional: false },
    { name: 'maxlength', type: 'string', toolTip: 'Maximale Zeichenanzahl', optional: true },
    { name: 'data-call', type: 'string', toolTip: 'onBlur Funktion aufrufen', optional: true },
    { name: 'data-vali', type: 'string', toolTip: 'Validations-Funktion', optional: true },
    { name: 'data-submit', type: 'string', toolTip: 'Übertragungs-Funktion', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'True = Standardmäßig Ausblenden', optional: false },
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
