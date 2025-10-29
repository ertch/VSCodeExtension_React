/**
 * SimpleInput Card Component
 */

import React from 'react';

export default function SimpleInput({ label = 'Input', required = false, preview = false }) {
  if (preview) {
    return <span>{label}{required ? ' *' : ''}</span>;
  }

  return (
    <div>
      <label>{label}{required && <span style={{ color: 'red' }}> *</span>}</label>
      <input type="text" />
    </div>
  );
}

// Palette Metadata
SimpleInput.paletteEntry = {
  type: 'SimpleInput',
  label: 'Simple Input',
  canBeParent: false,
  codeGen: '<SimpleInput label="" required={false} />',
  Component: SimpleInput,
  defaultProps: {
    label: 'Input',
    required: false,
  },
};
