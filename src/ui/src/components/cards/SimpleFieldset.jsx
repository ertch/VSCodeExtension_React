/**
 * SimpleFieldset Card Component
 */

import React from 'react';

export default function SimpleFieldset({ legend = 'Fieldset', preview = false }) {
  if (preview) {
    return <span>Fieldset: {legend}</span>;
  }

  return (
    <fieldset>
      <legend>{legend}</legend>
    </fieldset>
  );
}

// Palette Metadata
SimpleFieldset.paletteEntry = {
  type: 'SimpleFieldset',
  label: 'Simple Fieldset',
  canBeParent: true,
  codeGen: '<SimpleFieldset legend="" />',
  Component: SimpleFieldset,
  defaultProps: {
    legend: 'Fieldset',
  },
};
