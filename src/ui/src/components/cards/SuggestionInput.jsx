/**
 * SuggestionInput Card Component
 */

import React from 'react';

export default function SuggestionInput({ label = 'Suggestion', preview = false }) {
  if (preview) {
    return <span>Suggestion: {label}</span>;
  }

  return (
    <div>
      <label>{label}</label>
      <input type="text" placeholder="Tippe für Vorschläge..." />
    </div>
  );
}

// Palette Metadata
SuggestionInput.paletteEntry = {
  type: 'SuggestionInput',
  label: 'Suggestion Input',
  canBeParent: false,
  codeGen: '<SuggestionInput label="" />',
  Component: SuggestionInput,
  defaultProps: {
    label: 'Suggestion',
  },
};
