/**
 * Bild Card Component
 */

import React from 'react';

export default function Bild({ src = '', alt = 'Bild', preview = false }) {
  if (preview) {
    return <span>Bild: {alt}</span>;
  }

  return <img src={src} alt={alt} />;
}

// Palette Metadata
Bild.paletteEntry = {
  type: 'Bild',
  label: 'Bild (Image)',
  canBeParent: false,
  codeGen: '<Bild src="" alt="" />',
  Component: Bild,
  defaultProps: {
    src: '',
    alt: 'Bild',
  },
};
