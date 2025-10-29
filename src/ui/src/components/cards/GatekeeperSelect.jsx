/**
 * GatekeeperSelect Card Component
 */

import React from 'react';

export default function GatekeeperSelect({ label = 'Gatekeeper', preview = false }) {
  if (preview) {
    return <span>Gatekeeper: {label}</span>;
  }

  return (
    <div>
      <label>{label}</label>
      <select>
        <option>Option 1</option>
        <option>Option 2</option>
      </select>
    </div>
  );
}

// Palette Metadata
GatekeeperSelect.paletteEntry = {
  type: 'GatekeeperSelect',
  label: 'Gatekeeper Select',
  canBeParent: false,
  codeGen: '<GatekeeperSelect label="" />',
  Component: GatekeeperSelect,
  defaultProps: {
    label: 'Gatekeeper',
  },
};
