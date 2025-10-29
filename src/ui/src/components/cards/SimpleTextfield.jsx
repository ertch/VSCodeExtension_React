/**
 * SimpleTextfield Card Component
 */

import React from 'react';

export default function SimpleTextfield({ label = 'Textfeld', required = false, preview = false }) {
  if (preview) {
    return <span>{label}{required ? ' *' : ''}</span>;
  }

  return (
    <div>
      <label>{label}{required && <span style={{ color: 'red' }}> *</span>}</label>
      <textarea rows="4" />
    </div>
  );
}

// Palette Metadata
SimpleTextfield.paletteEntry = {
  type: 'SimpleTextfield',
  label: 'Simple Textfield',
  canBeParent: false,
  codeGen: '<SimpleTextfield label="" required={false} />',
  Component: SimpleTextfield,
  defaultProps: {
    label: 'Textfeld',
    required: false,
  },
};
