/**
 * CardBase Component
 * Basis-Komponente für alle Cards auf dem Canvas
 */

import React from 'react';
import styles from './card.module.css';
import CardPreview from './CardPreview';
import CardAttributes from './CardAttributes';
import CardDropZone from './CardDropZone';

export default function CardBase({
  nodeId,
  type,
  canBeParent,
  previewContent,
  attributes,
  children,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDelete,
  onUpdateProps,
  hover,
  dragging,
}) {
  const handleDragStart = (e) => {
    e.stopPropagation();
    onDragStart?.(e, nodeId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDragOver?.(e, nodeId);
  };

  const handleDragLeave = (e) => {
    e.stopPropagation();
    onDragLeave?.(e);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop?.(e, nodeId);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Komponente "${type}" wirklich löschen?`)) {
      onDelete?.(nodeId);
    }
  };

  const handleAttributeChange = (attrKey, value) => {
    onUpdateProps?.(nodeId, { [attrKey]: value });
  };

  // Determine drop zone indicator
  const isHoverTarget = hover?.targetId === nodeId;
  const zoneClass = isHoverTarget && hover.zone ? styles[`zone-${hover.zone}`] : '';

  return (
    <div
      className={`${styles.cardWrapper} ${zoneClass}`}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-node-id={nodeId}
    >
      <div className={styles.cardHeader}>
        <span className={styles.dragHandle} title="Verschieben">
          ⋮⋮
        </span>
        <span className={styles.cardType}>{type}</span>
        <button
          className={styles.deleteBtn}
          onClick={handleDelete}
          title="Löschen"
        >
          ×
        </button>
      </div>

      {/* Preview Section */}
      <CardPreview content={previewContent} />

      {/* Attributes Section */}
      {attributes && Object.keys(attributes).length > 0 && (
        <CardAttributes
          attributes={attributes}
          onChange={handleAttributeChange}
        />
      )}

      {/* Children Drop Zone */}
      {canBeParent && (
        <CardDropZone
          nodeId={nodeId}
          children={children}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        />
      )}
    </div>
  );
}
