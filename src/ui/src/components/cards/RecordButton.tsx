import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const recordButtonConfig: CardConfig = {
  defaultName: 'RecordButton',
  codegenName: 'RecordButton',
  canBeParent: false,
  attributes: [
    { name: 'showInfo', type: 'checkbox', toolTip: 'Info-Text anzeigen ("Aufnahme läuft nur für Sie")', optional: true },
    { name: 'centered', type: 'checkbox', toolTip: 'Zentrierte Darstellung (--centered Klasse)', optional: true },
    { name: 'txt_info', type: 'string', toolTip: 'Eigener Info-Text (Standard: "Aufnahme läuft nur für Sie")', optional: true },
    { name: 'txt_btn', type: 'string', toolTip: 'Eigener Button-Text (Standard: "Kunden aufnehmen")', optional: true },
    { name: 'callState', type: 'string', toolTip: 'CallState-Parameter für recordBtn-Funktion (Standard: "3")', optional: true },
  ],
  renderPreview: (name, id) => (
    <div
      id={id}
      className="input_form recordDisplay grid-col_center"
    >
      <div className="recordDisplay__info d-none">
        <i className="glyph glyph-record"></i>
        Aufnahme läuft nur für Sie
      </div>

      <div
        className="go"
        id="recordDisplay_Btn"
      >
        <button
          type="button"
          onClick={() => {}}
        >
          <i className="glyph glyph-circle"></i>
          Kunden aufnehmen
        </button>
      </div>
    </div>
  )
}

export default function RecordButtonCard({ id }: { id: string }) {
  return <BaseCard id={id} config={recordButtonConfig} />
}
