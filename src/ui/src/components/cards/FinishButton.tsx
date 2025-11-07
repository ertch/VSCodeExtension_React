import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const finishButtonConfig: CardConfig = {
  defaultName: 'FinishButton',
  codegenName: 'FinishButton',
  canBeParent: false,
  attributes: [
    { name: 'auto', type: 'checkbox', toolTip: 'Automatisch abschließen mit "auto" Parameter', optional: true },
    { name: 'queryLib', type: 'checkbox', toolTip: 'QueryLib-Modus verwenden (sonst "auto")', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'Initial versteckt (d-none Klasse)', optional: true },
  ],
  renderPreview: (name, id) => (
    <div
      className="absenden"
      id={id}
    >
      <button
        className="absenden__Btn"
        type="button"
        onClick={() => {}}
      >
        <i className="glyph glyph-final"></i>
        &nbsp; Auftrag abschließen
      </button>
    </div>
  )
}

export default function FinishButtonCard({ id }: { id: string }) {
  return <BaseCard id={id} config={finishButtonConfig} />
}
