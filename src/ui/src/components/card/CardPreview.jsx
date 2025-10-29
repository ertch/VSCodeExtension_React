/**
 * CardPreview Component
 * Zeigt Preview-Inhalt einer Card
 */

import React from 'react';
import styles from './card.module.css';

export default function CardPreview({ content }) {
  if (!content) {
    return (
      <div className={styles.preview}>
        <span className={styles.previewEmpty}>Keine Vorschau</span>
      </div>
    );
  }

  // Content can be string or React element
  return (
    <div className={styles.preview}>
      {typeof content === 'string' ? (
        <span>{content}</span>
      ) : (
        content
      )}
    </div>
  );
}
