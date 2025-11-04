import * as React from 'react'
import '../../index.css'

export default function ContainerCard() {
    return (
        <div className='containerCard'
         data-codegen="ContainerCard"
         style={{
            padding: '12px',
            background: '#f0f4f8',
            border: '2px dashed #94a3b8',
            borderRadius: '8px',
            minHeight: '60px'
         }}
        >
            <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '14px', color: '#475569' }}>📦 Container</strong>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>(kann Kinder enthalten)</span>
            </div>
            <details style={{ marginTop: '8px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#64748b' }}>
                    Attribute
                </summary>
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <input
                        id='containerName'
                        name='containerName'
                        type="text"
                        placeholder="Container-Name"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                    />
                    <input
                        id='containerClass'
                        name='containerClass'
                        type="text"
                        placeholder="CSS-Klasse"
                        style={{ padding: '4px 8px', fontSize: '12px' }}
                    />
                </div>
            </details>
        </div>
    );
}
