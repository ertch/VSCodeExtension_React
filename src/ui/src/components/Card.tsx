import * as React from 'react'
import { useState, useEffect } from 'react'
import '../index.css'

export default function Card() {
    const [snippets, setSnippets] = useState<Array<{id: string, content: string, tool: string}>>([])

    useEffect(() => {
        // Listen for messages from VS Code extension
        const handleMessage = (event: MessageEvent) => {
            const message = event.data
            if (message.command === 'insertSnippet') {
                const newSnippet = {
                    id: Date.now().toString() + Math.random().toString(36),
                    content: message.content,
                    tool: message.tool
                }
                setSnippets(prev => [...prev, newSnippet])
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    const clearAllSnippets = () => {
        setSnippets([])
    }

    const removeSnippet = (id: string) => {
        setSnippets(prev => prev.filter(snippet => snippet.id !== id))
    }

    return (
        <div className='mainCanvas'>
            <div style={{ padding: '20px' }}>
                <h1>Code Snippet Generator</h1>
                <p>Use the sidebar buttons to insert code snippets!</p>
                
                {snippets.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                        <button 
                            onClick={clearAllSnippets}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#ff6b6b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                            }}
                        >
                            Clear All Snippets
                        </button>
                    </div>
                )}

                <div className="snippets-container">
                    {snippets.map((snippet) => (
                        <div key={snippet.id} style={{ 
                            position: 'relative',
                            marginBottom: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                backgroundColor: '#f5f5f5',
                                padding: '8px 12px',
                                fontSize: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span>Generated from: {snippet.tool}</span>
                                <button
                                    onClick={() => removeSnippet(snippet.id)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    ✕
                                </button>
                            </div>
                            <div 
                                dangerouslySetInnerHTML={{ __html: snippet.content }}
                            />
                        </div>
                    ))}
                </div>

                {snippets.length === 0 && (
                    <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: '#666',
                        border: '2px dashed #ddd',
                        borderRadius: '8px',
                        marginTop: '20px'
                    }}>
                        No snippets yet. Click Tool 1 or Tool 2 in the sidebar to insert code snippets!
                    </div>
                )}
            </div>
        </div>
    );
}