/**
 * ConBlock Card Component
 * Container-Block (kann Children haben)
 */

import React from 'react';

export default function ConBlock({ title = 'Block', preview = false }) {
  if (preview) {
    return <span>Container: {title}</span>;
  }

  return (
    <div className="con-block">
      <h3>{title}</h3>
    </div>
  );
}

// Palette Metadata
ConBlock.paletteEntry = {
  type: 'ConBlock',
  label: 'Container Block',
  canBeParent: true,
  codeGen: '<ConBlock title="" />',
  Component: ConBlock,
  defaultProps: {
    title: 'Block',
  },
};
