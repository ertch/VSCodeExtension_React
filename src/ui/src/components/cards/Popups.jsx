/**
 * Popups Card Component
 */

import React from 'react';

export default function Popups({ title = 'Popup', preview = false }) {
  if (preview) {
    return <span>Popup: {title}</span>;
  }

  return (
    <div className="popup">
      <h4>{title}</h4>
    </div>
  );
}

// Palette Metadata
Popups.paletteEntry = {
  type: 'Popups',
  label: 'Popups',
  canBeParent: true,
  codeGen: '<Popups title="" />',
  Component: Popups,
  defaultProps: {
    title: 'Popup',
  },
};
