import * as React from 'react'
import '../index.css'

export default function Card() {
    return (
        <div className='mainCanvas'
         data-codegen="Card"
        >
            <h1>Test</h1>
            <input id="preview" type="text" />
            <details>
                <summary>Attribute</summary>
                <input id='id' type="text" />
            </details>
        </div>
    );
}