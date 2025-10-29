/**
 * FinishButton Card Component
 */

import React from 'react';

export default function FinishButton({ label = 'Fertig', preview = false }) {
  if (preview) {
    return <span>Button: {label}</span>;
  }

  return <button type="submit">{label}</button>;
}

// Palette Metadata
FinishButton.paletteEntry = {
  type: 'FinishButton',
  label: 'Finish Button',
  canBeParent: false,
  codeGen: '<FinishButton label="Fertig" />',
  Component: FinishButton,
  defaultProps: {
    label: 'Fertig',
  },
};
