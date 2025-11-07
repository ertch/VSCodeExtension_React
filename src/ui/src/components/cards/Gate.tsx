import BaseCard, { CardConfig } from './CardLayout/BaseCard'
import { Slot } from '../canvas/Slot'

const gateConfig: CardConfig = {
  defaultName: 'Gate',
  codegenName: 'Gate',
  canBeParent: true,
  attributes: [
    { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das Gate-Element', optional: true },
    { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Gates', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'Gate initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
  ],
  renderPreview: (name, id, slotProps) => (
    <section id={id} style={{ border: '1px solid #ddd', padding: '8px', borderRadius: '4px' }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555', marginBottom: '8px' }}>{name}</div>
      {slotProps && <Slot innerRef={slotProps.ref} isEmpty={slotProps.isEmpty}>{slotProps.children}</Slot>}
    </section>
  )
}

export default function GateCard({ id, slotProps }: { id: string, slotProps?: import('./CardLayout/BaseCard').SlotProps }) {
  return <BaseCard id={id} config={gateConfig} slotProps={slotProps} />
}
