/**
 * Gate Card Component
 */

import React from 'react';

export default function Gate({ condition = '', preview = false }) {
  if (preview) {
    return <span>Gate: {condition || '(condition)'}</span>;
  }

  return (
    <div className="gate">
      <span>If: {condition}</span>
    </div>
  );
}

// Palette Metadata
Gate.paletteEntry = {
  type: 'Gate',
  label: 'Gate (Condition)',
  canBeParent: true,
  codeGen: '<Gate condition="" />',
  Component: Gate,
  defaultProps: {
    condition: '',
  },
};
