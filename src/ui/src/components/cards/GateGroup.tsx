import BaseCard, { CardConfig } from './CardLayout/BaseCard'
import { Slot } from '../canvas/Slot'

const gateGroupConfig: CardConfig = {
  defaultName: 'GateGroup',
  codegenName: 'GateGroup',
  canBeParent: true,
  attributes: [
    { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung - definiert zu welcher Gruppe dieses GateGroup gehört', optional: false },
    { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das GateGroup-Element', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'GateGroup initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
  ],
  renderPreview: (name, id, slotProps) => (
    <div id={id} style={{ border: '2px dashed #aaa', padding: '12px', borderRadius: '6px', backgroundColor: '#f9f9f9' }}>
      <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>{name}</div>
      {slotProps && <Slot innerRef={slotProps.ref} isEmpty={slotProps.isEmpty}>{slotProps.children}</Slot>}
    </div>
  )
}

export default function GateGroupCard({ id, slotProps }: { id: string, slotProps?: import('./CardLayout/BaseCard').SlotProps }) {
  return <BaseCard id={id} config={gateGroupConfig} slotProps={slotProps} />
}
