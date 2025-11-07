import BaseCard, { CardConfig } from './CardLayout/BaseCard'
import { Slot } from '../canvas/Slot'

const conBlockConfig: CardConfig = {
  defaultName: 'ConBlock',
  codegenName: 'ConBlock',
  canBeParent: true,
  attributes: [
    { name: 'If', type: 'string', toolTip: 'JSON-Array für bedingte Logik (z.B. [["field1", "value1"]])', optional: false },
    { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das ConBlock-Element', optional: true },
    { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Elemente', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'ConBlock initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
    { name: 'required', type: 'checkbox', toolTip: 'Markiert das Element als erforderlich', optional: true },
    { name: 'setPosSale', type: 'checkbox', toolTip: 'Aktiviert POS-Sale-Modus für diesen Block', optional: true },
  ],
  renderPreview: (name, id, slotProps) => (
    <div id={id} className="ifDiv">
      <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '4px' }}>{name}</div>
      {slotProps && <Slot innerRef={slotProps.ref} isEmpty={slotProps.isEmpty}>{slotProps.children}</Slot>}
    </div>
  )
}

export default function ConBlockCard({ id, slotProps }: { id: string, slotProps?: import('./CardLayout/BaseCard').SlotProps }) {
  return <BaseCard id={id} config={conBlockConfig} slotProps={slotProps} />
}
