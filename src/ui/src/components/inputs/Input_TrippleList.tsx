import * as React from 'react'
import { useState } from 'react'
import Select_Actions from '../commons/Select_Actions';
import Select_NamedElements from '../commons/Select_NamedElements';

export default function Input_Tipple(props: { id: string }) {

    const [Amount, setAmount] = useState(2);

    return (
        <div className='attribute-input_tripple' id={`${props.id}_name`} key={`${props.id}_name`}>
            <span>Tiggerwert</span><span>Aktion</span><span>Ziel (Name)</span>
            {[...Array(Amount)].map((_, index) => (
                <React.Fragment key={index}>
                    <input
                        type="text"
                        name={`${props.id}_trigger_${index}`}
                    />
                    <Select_Actions id={`${props.id}_action_${index}`} />
                    <Select_NamedElements name={`${props.id}_target_id_${index}`} />
                </React.Fragment>
            ))}
            <button type="button" onClick={() => setAmount(Amount + 1)}>+</button>
            {Amount > 1 && <button type="button" onClick={() => setAmount(Amount - 1)}>-</button>}

        </div>
    )
}