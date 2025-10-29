/**
 * RadioButton Card Component
 */

import React from 'react';

export default function RadioButton({ label = 'Option', name = 'radio', preview = false }) {
  if (preview) {
    return <span>Radio: {label}</span>;
  }

  return (
    <label>
      <input type="radio" name={name} />
      {label}
    </label>
  );
}

// Palette Metadata
RadioButton.paletteEntry = {
  type: 'RadioButton',
  label: 'Radio Button',
  canBeParent: false,
  codeGen: '<RadioButton label="" name="" />',
  Component: RadioButton,
  defaultProps: {
    label: 'Option',
    name: 'radio',
  },
};
