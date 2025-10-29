/**
 * Toolbar Component
 * Rechte Sidebar mit draggable Komponenten
 */

import React from 'react';
import styles from './toolbar.module.css';

export default function Toolbar({ components, onDragStart }) {
  const handleDragStart = (e, type) => {
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart?.(e, type);
  };

  return (
    <aside className={styles.toolbar}>
      <div className={styles.toolbarHeader}>
        <h2 className={styles.toolbarTitle}>Komponenten</h2>
      </div>

      <div className={styles.componentList}>
        {components.map((entry) => (
          <div
            key={entry.type}
            className={styles.paletteItem}
            draggable
            onDragStart={(e) => handleDragStart(e, entry.type)}
          >
            <div className={styles.paletteIcon}>
              {entry.canBeParent ? '📦' : '📄'}
            </div>
            <div className={styles.paletteInfo}>
              <div className={styles.paletteLabel}>{entry.label}</div>
              <div className={styles.paletteType}>{entry.type}</div>
            </div>
          </div>
        ))}
      </div>

      {components.length === 0 && (
        <div className={styles.emptyToolbar}>
          <p>Keine Komponenten gefunden</p>
        </div>
      )}
    </aside>
  );
}
