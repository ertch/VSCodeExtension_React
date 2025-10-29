/**
 * CustomerCells Card Component
 */

import React from 'react';

export default function CustomerCells({ cellCount = 2, preview = false }) {
  if (preview) {
    return <span>Customer Cells: {cellCount}</span>;
  }

  return (
    <div className="customer-cells">
      {Array.from({ length: cellCount }, (_, i) => (
        <div key={i}>Cell {i + 1}</div>
      ))}
    </div>
  );
}

// Palette Metadata
CustomerCells.paletteEntry = {
  type: 'CustomerCells',
  label: 'Customer Cells',
  canBeParent: false,
  codeGen: '<CustomerCells cellCount={2} />',
  Component: CustomerCells,
  defaultProps: {
    cellCount: 2,
  },
};
