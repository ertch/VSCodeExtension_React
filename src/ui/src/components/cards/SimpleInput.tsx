import * as React from 'react'
import { useState } from 'react'


export default function Card() {
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
        { name: 'data-submit', type: 'tripple_single', toolTip: ' ', optional: true },
        { name: 'data-call', type: 'string', toolTip: ' ', optional: true },
        { name: 'min', type: 'string', toolTip: ' ', optional: true },
        { name: 'max', type: 'string', toolTip: ' ', optional: true },
    ];

    const [name, setName] = useState('SimpleInput');
    const component_Id = 'SimpleInput_' + Math.random().toString(36).substring(2, 9);
    const handleNewName = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    return (
        <div className='mainCanvas'
         data-codegen="SimpeInput"
         id={component_Id}
        >
           <div className='preview'>
                <div>
                    <label htmlFor={component_Id + '_input'}>{name}</label>
                </div>
                <input className='input-text'/>
            </div>

            <details>
                <summary>Attributes</summary>
                <form id={component_Id + '_attributes_form'}>
                    <div className='attribute-input' id={`${component_Id}_name`} key={`${component_Id}_name`}>
                        <label>name (required)</label>
                        <input type="text" onChange={handleNewName}/>
                        <div>Name der Komponente</div>
                    </div>
                
                    {attributes.map((attr) => {
                        let inputElement;
                        switch (attr.type) {
                            case 'checkbox':
                                inputElement = <input type="checkbox"/>;
                                break;
                            case 'string':
                                inputElement = <input type="text" />;
                                break;
                            case 'function':
                                inputElement = <input type="text" />;
                                break;
                            case 'double_single':
                                inputElement = <input type="text" />;
                                break;
                            case 'double_list':
                                inputElement = <input type="text" />;
                                break;
                            case 'tripple_single':
                                inputElement = <input type="text" />;
                                break;
                            case 'tripple_list':
                                inputElement = <input type="text" />;
                                break;
                            default:
                                inputElement = <input type="text" />;
                                break;
                        }
                        return (
                            <div className='attribute-input' id={`${component_Id}_${attr.name}`} key={`${component_Id}_${attr.name}`}>
                                <label>
                                    {attr.name} {attr.optional ? ' (optional)' : ' (required)'}
                                </label>
                                {inputElement}
                                <div>{attr.toolTip}</div>
                            </div>
                        );
                    })}
                </form>
            </details>
        </div>
    );
}