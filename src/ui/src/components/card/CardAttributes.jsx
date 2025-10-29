/**
 * CardAttributes Component
 * Collapsible Attributes (nur Text + Checkbox)
 */

import React, { useState } from 'react';
import styles from './card.module.css';

export default function CardAttributes({ attributes, onChange }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleInputChange = (key, value) => {
    onChange?.(key, value);
  };

  return (
    <details className={styles.attributes} open={isOpen} onToggle={(e) => setIsOpen(e.target.open)}>
      <summary className={styles.attributesSummary}>
        Attribute ({Object.keys(attributes).length})
      </summary>
      <div className={styles.attributesContent}>
        {Object.entries(attributes).map(([key, value]) => {
          const attrType = typeof value === 'boolean' ? 'checkbox' : 'text';

          return (
            <div key={key} className={styles.attributeRow}>
              <label className={styles.attributeLabel} htmlFor={`attr-${key}`}>
                {key}
              </label>
              {attrType === 'checkbox' ? (
                <input
                  id={`attr-${key}`}
                  type="checkbox"
                  className={styles.attributeCheckbox}
                  checked={value}
                  onChange={(e) => handleInputChange(key, e.target.checked)}
                />
              ) : (
                <input
                  id={`attr-${key}`}
                  type="text"
                  className={styles.attributeInput}
                  value={value || ''}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  placeholder={`Wert für ${key}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </details>
  );
}
