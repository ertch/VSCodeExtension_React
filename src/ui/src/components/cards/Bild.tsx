import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const bildConfig: CardConfig = {
  defaultName: 'Bild',
  codegenName: 'Bild',
  canBeParent: false,
  attributes: [
    { name: 'dateiname', 
      type: 'string', 
      toolTip: 'Filename of the image (path will be added automatically)', 
      optional: false },
  ],
  renderPreview: (name) => (
    <>
      <div>
        <img src="placeholder.png" alt={name} style={{ maxWidth: '100%', height: 'auto' }} />
      </div>
    </>
  )
}

export default function BildCard({ id }: { id: string }) {
  return <BaseCard id={id} config={bildConfig} />
}
