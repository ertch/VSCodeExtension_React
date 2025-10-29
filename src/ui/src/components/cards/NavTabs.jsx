/**
 * NavTabs Card Component
 */

import React from 'react';

export default function NavTabs({ preview = false }) {
  if (preview) {
    return <span>Navigation Tabs</span>;
  }

  return (
    <nav className="nav-tabs">
      <button>Tab 1</button>
      <button>Tab 2</button>
    </nav>
  );
}

// Palette Metadata
NavTabs.paletteEntry = {
  type: 'NavTabs',
  label: 'Navigation Tabs',
  canBeParent: false,
  codeGen: '<NavTabs />',
  Component: NavTabs,
  defaultProps: {},
};
