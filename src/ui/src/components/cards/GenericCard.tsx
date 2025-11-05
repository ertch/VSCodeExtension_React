import * as React from 'react'
import { useState, useEffect } from 'react'
import { useNamedElements } from '../../contexts/NamedElementsContext'
import Input_TrippleList from '../inputs/Input_TrippleList'

export interface CardAttribute {
  name: string
  type: 'string' | 'checkbox' | 'function' | 'double_single' | 'double_list' | 'tripple_single' | 'tripple_list' | 'tripple_submit'
  toolTip: string
  optional: boolean
}

export interface CardConfig {
  defaultName: string
  attributes: CardAttribute[]
  canBeParent?: boolean
  codegenName: string
  renderPreview: (name: string, id: string) => React.ReactNode
}

interface GenericCardProps {
  id: string
  config: CardConfig
}

export default function GenericCard({ id, config }: GenericCardProps) {
  const [name, setName] = useState(config.defaultName)
  const { updateElementName, unregisterElement } = useNamedElements()

  const handleNewName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newName = event.target.value
    setName(newName)
    updateElementName(id, newName)
  }

  useEffect(() => {
    return () => {
      unregisterElement(id)
    }
  }, [id, unregisterElement])

  const renderInput = (attr: CardAttribute) => {
    switch (attr.type) {
      case 'checkbox':
        return <input type="checkbox" name={attr.name} />
      case 'tripple_list':
        return <Input_TrippleList id={attr.name} />
      case 'string':
      case 'function':
      case 'double_single':
      case 'double_list':
      case 'tripple_single':
      case 'tripple_submit':
      default:
        return <input type="text" name={attr.name} />
    }
  }

  return (
    <div 
      className='mainCanvas'
      data-codegen={config.codegenName}
      data-can-be-parent={config.canBeParent}
      id={id}
    >
      <div className='preview'>
        {config.renderPreview(name, id)}
      </div>

      <details>
        <summary>Attributes</summary>
        <div id={`${id}_attributes`}>
          <div className='attribute-input' id={`${id}_name`} key={`${id}_name`}>
            <label>name (required)</label>
            <input type="text" name="name" onChange={handleNewName} value={name} />
            <div>Name der Komponente</div>
          </div>

          {config.attributes.map((attr) => (
            <div 
              className='attribute-input' 
              id={`${id}_${attr.name}`} 
              key={`${id}_${attr.name}`}
            >
              <label>
                {attr.name} {attr.optional ? '(optional)' : '(required)'}
              </label>
              {renderInput(attr)}
              {attr.toolTip && <span>{attr.toolTip}</span>}
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}