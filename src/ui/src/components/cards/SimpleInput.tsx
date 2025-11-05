import * as React from 'react'
import { useState, useEffect } from 'react'
import { useNamedElements } from '../../contexts/NamedElementsContext'
import Input_TrippleList from '../inputs/Input_TrippleList';

export default function Card(props: { id: string }) {
    const attributes = [
        { name: 'type', type: 'string', toolTip: ' ', optional: false },
        { name: 'class', type: 'string', toolTip: ' ', optional: false },
        { name: 'value', type: 'string', toolTip: ' ', optional: false },
        { name: 'required', type: 'checkbox', toolTip: ' ', optional: false  },
        { name: 'disabled', type: 'checkbox', toolTip: ' ', optional: false  },
        { name: 'maxlength', type: 'string', toolTip: ' ', optional: true },
        { name: 'pattern', type: 'string', toolTip: 'regExP', optional: true },
        { name: 'data-preset', type: 'string', toolTip: ' ', optional: true },
        { name: 'onchange', type: 'function', toolTip: ' ', optional: true },
        { name: 'onblur', type: 'function', toolTip: ' ', optional: true },
        { name: 'data-vali', type: 'string', toolTip: ' ', optional: true },
        { name: 'data-submit', type: 'tripple_list', toolTip: ' Hallo Ich blockiere dich', optional: true },
        { name: 'data-call', type: 'string', toolTip: ' ', optional: true },
        { name: 'min', type: 'string', toolTip: ' ', optional: true },
        { name: 'max', type: 'string', toolTip: ' ', optional: true },
    ];

    const [name, setName] = useState('SimpleInput');
    const { updateElementName, unregisterElement } = useNamedElements();

    const handleNewName = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setName(newName);
        updateElementName(props.id, newName);
    };

    // Cleanup beim Unmount (Card wird gelöscht)
    useEffect(() => {
        return () => {
            unregisterElement(props.id);
        };
    }, [props.id, unregisterElement]);

    return (
        <div className='mainCanvas'
         data-codegen="SimpeInput"
         id={props.id}
        >
           <div className='preview'>
                <div>
                    <label htmlFor={props.id + '_input'}>{name}</label>
                </div>
                <input className='input-text'/>
            </div>

            <details>
                <summary>Attributes</summary>
                <div id={props.id + '_attributes'}>
                    <div className='attribute-input' id={`${props.id}_name`} key={`${props.id}_name`}>
                        <label>name (required)</label>
                        <input type="text" name="name" onChange={handleNewName}/>
                        <div>Name der Komponente</div>
                    </div>

                    {attributes.map((attr) => {
                        let inputElement;
                        let toolTipElement;
                        switch (attr.type) {
                            case 'checkbox':
                                inputElement = <input type="checkbox" name={attr.name}/>;
                                toolTipElement = <span>{attr.toolTip}</span>
                                break;
                            case 'string':
                                inputElement = <input type="text" name={attr.name} />;
                                toolTipElement = <span>{attr.toolTip}</span>
                                break;
                            case 'function':
                                inputElement = <input type="text" name={attr.name} />;
                                toolTipElement = <span>{attr.toolTip}</span>
                                break;
                            case 'double_single':
                                inputElement = <input type="text" name={attr.name} />;
                                toolTipElement = <span>{attr.toolTip}</span>
                                break;
                            case 'double_list':
                                inputElement = <input type="text" name={attr.name} />;
                                <span className='d-none'>{attr.toolTip}</span>
                                break;
                            case 'tripple_single':
                                inputElement = <input type="text" name={attr.name} />;
                                <span className='d-none'>{attr.toolTip}</span>
                                break;
                            case 'tripple_list':
                                inputElement = <Input_TrippleList id={attr.name} />;
                                <span className='d-none'>{attr.toolTip}</span>
                                break;
                            default:
                                inputElement = <input type="text" name={attr.name} />;
                                toolTipElement = <span>{attr.toolTip}</span>
                                break;
                        }
                        return (
                            <div className='attribute-input' id={`${props.id}_${attr.name}`} key={`${props.id}_${attr.name}`}>
                                <label>
                                    {attr.name} {attr.optional ? ' (optional)' : ' (required)'}
                                </label>
                                {inputElement}
                                {toolTipElement}
                            </div>
                        );
                    })}
                </div>
            </details>
        </div>
    );
}