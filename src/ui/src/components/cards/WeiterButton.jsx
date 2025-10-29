/**
 * WeiterButton Card Component
 */

import React from 'react';

export default function WeiterButton({ label = 'Weiter', preview = false }) {
  if (preview) {
    return <span>Button: {label}</span>;
  }

  return <button type="button">{label}</button>;
}

// Palette Metadata
WeiterButton.paletteEntry = {
  type: 'WeiterButton',
  label: 'Weiter Button',
  canBeParent: false,
  codeGen: '<WeiterButton label="Weiter" />',
  Component: WeiterButton,
  defaultProps: {
    label: 'Weiter',
  },
};
