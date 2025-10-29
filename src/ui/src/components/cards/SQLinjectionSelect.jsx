/**
 * SQLinjectionSelect Card Component
 */

import React from 'react';

export default function SQLinjectionSelect({ label = 'SQL Select', preview = false }) {
  if (preview) {
    return <span>SQL: {label}</span>;
  }

  return (
    <div>
      <label>{label}</label>
      <select>
        <option>Query Result 1</option>
        <option>Query Result 2</option>
      </select>
    </div>
  );
}

// Palette Metadata
SQLinjectionSelect.paletteEntry = {
  type: 'SQLinjectionSelect',
  label: 'SQL Injection Select',
  canBeParent: false,
  codeGen: '<SQLinjectionSelect label="" />',
  Component: SQLinjectionSelect,
  defaultProps: {
    label: 'SQL Select',
  },
};
