/**
 * CardDropZone Component
 * Drop-Zone für Children (nur für canBeParent)
 */

import React from 'react';
import styles from './card.module.css';

export default function CardDropZone({ nodeId, children, onDragOver, onDrop }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e, nodeId);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e, nodeId);
  };

  return (
    <div
      className={styles.dropZone}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children && children.length > 0 ? (
        <div className={styles.childrenList}>
          {children}
        </div>
      ) : (
        <div className={styles.dropZonePlaceholder}>
          Komponenten hier ablegen
        </div>
      )}
    </div>
  );
}
