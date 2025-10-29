/**
 * GateGroup Card Component
 */

import React from 'react';

export default function GateGroup({ logic = 'AND', preview = false }) {
  if (preview) {
    return <span>Gate Group: {logic}</span>;
  }

  return (
    <div className="gate-group">
      <span>Logic: {logic}</span>
    </div>
  );
}

// Palette Metadata
GateGroup.paletteEntry = {
  type: 'GateGroup',
  label: 'Gate Group',
  canBeParent: true,
  codeGen: '<GateGroup logic="AND" />',
  Component: GateGroup,
  defaultProps: {
    logic: 'AND',
  },
};
