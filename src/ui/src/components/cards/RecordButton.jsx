/**
 * RecordButton Card Component
 */

import React from 'react';

export default function RecordButton({ label = 'Aufnehmen', preview = false }) {
  if (preview) {
    return <span>Record: {label}</span>;
  }

  return <button type="button">{label}</button>;
}

// Palette Metadata
RecordButton.paletteEntry = {
  type: 'RecordButton',
  label: 'Record Button',
  canBeParent: false,
  codeGen: '<RecordButton label="Aufnehmen" />',
  Component: RecordButton,
  defaultProps: {
    label: 'Aufnehmen',
  },
};
