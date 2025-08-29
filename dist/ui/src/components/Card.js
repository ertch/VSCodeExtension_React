"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Card;
const React = require("react");
const react_1 = require("react");
require("../index.css");
function Card() {
    const [snippets, setSnippets] = (0, react_1.useState)([]);
    (0, react_1.useEffect)(() => {
        // Listen for messages from VS Code extension
        const handleMessage = (event) => {
            const message = event.data;
            if (message.command === 'insertSnippet') {
                const newSnippet = {
                    id: Date.now().toString() + Math.random().toString(36),
                    content: message.content,
                    tool: message.tool
                };
                setSnippets(prev => [...prev, newSnippet]);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    const clearAllSnippets = () => {
        setSnippets([]);
    };
    const removeSnippet = (id) => {
        setSnippets(prev => prev.filter(snippet => snippet.id !== id));
    };
    return (React.createElement("div", { className: 'mainCanvas' },
        React.createElement("div", { style: { padding: '20px' } },
            React.createElement("h1", null, "Code Snippet Generator"),
            React.createElement("p", null, "Use the sidebar buttons to insert code snippets!"),
            snippets.length > 0 && (React.createElement("div", { style: { marginBottom: '20px' } },
                React.createElement("button", { onClick: clearAllSnippets, style: {
                        padding: '8px 16px',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    } }, "Clear All Snippets"))),
            React.createElement("div", { className: "snippets-container" }, snippets.map((snippet) => (React.createElement("div", { key: snippet.id, style: {
                    position: 'relative',
                    marginBottom: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    overflow: 'hidden'
                } },
                React.createElement("div", { style: {
                        backgroundColor: '#f5f5f5',
                        padding: '8px 12px',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    } },
                    React.createElement("span", null,
                        "Generated from: ",
                        snippet.tool),
                    React.createElement("button", { onClick: () => removeSnippet(snippet.id), style: {
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px'
                        } }, "\u2715")),
                React.createElement("div", { dangerouslySetInnerHTML: { __html: snippet.content } }))))),
            snippets.length === 0 && (React.createElement("div", { style: {
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                    border: '2px dashed #ddd',
                    borderRadius: '8px',
                    marginTop: '20px'
                } }, "No snippets yet. Click Tool 1 or Tool 2 in the sidebar to insert code snippets!")))));
}
