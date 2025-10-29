/**
 * TabPage Card Component
 */

import React from 'react';

export default function TabPage({ title = 'Tab', preview = false }) {
  if (preview) {
    return <span>Tab: {title}</span>;
  }

  return (
    <div className="tab-page">
      <h4>{title}</h4>
    </div>
  );
}

// Palette Metadata
TabPage.paletteEntry = {
  type: 'TabPage',
  label: 'Tab Page',
  canBeParent: true,
  codeGen: '<TabPage title="" />',
  Component: TabPage,
  defaultProps: {
    title: 'Tab',
  },
};
