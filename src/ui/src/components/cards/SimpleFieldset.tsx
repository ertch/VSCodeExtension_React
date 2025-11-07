import BaseCard, { CardConfig } from './CardLayout/BaseCard'
import { Slot } from '../canvas/Slot'

const simpleFieldsetConfig: CardConfig = {
  defaultName: 'SimpleFieldset',
  codegenName: 'SimpleFieldset',
  canBeParent: true,
  attributes: [
    { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das Fieldset', optional: true },
    { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Fieldsets', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'Fieldset initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
  ],
  renderPreview: (name, id, slotProps) => (
    <fieldset id={id}>
      <legend>{name}</legend>
      {slotProps && <Slot innerRef={slotProps.ref} isEmpty={slotProps.isEmpty}>{slotProps.children}</Slot>}
    </fieldset>
  )
}

export default function SimpleFieldsetCard({ id, slotProps }: { id: string, slotProps?: import('./CardLayout/BaseCard').SlotProps }) {
  return <BaseCard id={id} config={simpleFieldsetConfig} slotProps={slotProps} />
}
