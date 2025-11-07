import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const footButtonsConfig: CardConfig = {
  defaultName: 'FootButtons',
  codegenName: 'FootButtons',
  canBeParent: false,
  attributes: [],
  renderPreview: (name, id) => (
    <div id={id} className="footer">
      <div id="footer_button">
        <div className="go" id="div_go_negativ">
          <button
            id="go_negativ"
            type="button"
            data-id="freedial"
            className="calldialog"
          >
            <i className="glyph glyph-telephone"></i>
            Freedial
          </button>
        </div>

        <div className="go" id="div_go_wiedervorlage">
          <button
            id="go_wiedervorlage"
            type="button"
            data-id="recall"
            className="calldialog"
          >
            <i className="glyph glyph-calendar"></i>
            Wiedervorlage
          </button>
        </div>

        <div className="go" id="div_go_ane">
          <button
            id="go_ane"
            type="button"
            data-id="apne"
            className="calldialog"
          >
            <i className="glyph glyph-apne"></i>
            APNE
          </button>
        </div>

        <form action="#" method="POST" id="finish_abfax">
          <div className="go" id="div_go_abfax">
            <button id="go_abfax" onClick={() => {}}>
              <i className="glyph glyph-abfax"></i>
              AB/Fax/Modem
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function FootButtonsCard({ id }: { id: string }) {
  return <BaseCard id={id} config={footButtonsConfig} />
}
