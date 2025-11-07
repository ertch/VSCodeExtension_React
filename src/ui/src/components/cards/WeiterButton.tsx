import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const weiterButtonConfig: CardConfig = {
  defaultName: 'WeiterButton',
  codegenName: 'WeiterButton',
  canBeParent: false,
  attributes: [],
  renderPreview: (name, id) => (
    <div className="go nextpage grid-col_center">
      <div id={id} className="d-none">
        <button
          onClick={() => {}}
          type="button"
          className="nextpage--btn"
        >
          <i className="glyph glyph-outro"></i>
          Weiter
        </button>
      </div>
    </div>
  )
}

export default function WeiterButtonCard({ id }: { id: string }) {
  return <BaseCard id={id} config={weiterButtonConfig} />
}
