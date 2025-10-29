/**
 * SimpleSelect Card Component
 */

import React from 'react';

export default function SimpleSelect({ label = 'Auswahl', required = false, preview = false }) {
  if (preview) {
    return <span>{label}{required ? ' *' : ''}</span>;
  }

  return (
    <div>
      <label>{label}{required && <span style={{ color: 'red' }}> *</span>}</label>
      <select>
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
    </div>
  );
}

// Palette Metadata
SimpleSelect.paletteEntry = {
  type: 'SimpleSelect',
  label: 'Simple Select',
  canBeParent: false,
  codeGen: '<SimpleSelect label="" required={false} />',
  Component: SimpleSelect,
  defaultProps: {
    label: 'Auswahl',
    required: false,
  },
};
