/**
 * TabWrapper Card Component
 */

import React from 'react';

export default function TabWrapper({ preview = false }) {
  if (preview) {
    return <span>Tab Wrapper</span>;
  }

  return (
    <div className="tab-wrapper">
      <div>Tab Container</div>
    </div>
  );
}

// Palette Metadata
TabWrapper.paletteEntry = {
  type: 'TabWrapper',
  label: 'Tab Wrapper',
  canBeParent: true,
  codeGen: '<TabWrapper />',
  Component: TabWrapper,
  defaultProps: {},
};
