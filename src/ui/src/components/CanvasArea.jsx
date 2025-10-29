/**
 * CanvasArea Component
 * Rendert den Tree rekursiv mit CardBase
 */

import React from 'react';
import CardBase from './card/CardBase';
import styles from './canvas.module.css';

export default function CanvasArea({
  tree,
  paletteMap,
  formRef,
  hover,
  dragging,
  onNodeDragStart,
  onDragOver,
  onDrop,
  onDelete,
  onUpdateProps,
}) {
  const renderNode = (node) => {
    const paletteEntry = paletteMap.get(node.type);
    if (!paletteEntry) {
      console.warn('Unknown component type:', node.type);
      return null;
    }

    const { Component, canBeParent } = paletteEntry;

    // Render preview content
    const previewContent = Component ? (
      <Component {...node.props} preview />
    ) : (
      node.type
    );

    // Render children recursively
    const childrenElements =
      node.children?.map((child) => (
        <React.Fragment key={child.id}>{renderNode(child)}</React.Fragment>
      )) || [];

    return (
      <CardBase
        key={node.id}
        nodeId={node.id}
        type={node.type}
        canBeParent={canBeParent}
        previewContent={previewContent}
        attributes={node.props}
        children={childrenElements}
        onDragStart={onNodeDragStart}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDelete={onDelete}
        onUpdateProps={onUpdateProps}
        hover={hover}
        dragging={dragging}
      />
    );
  };

  const handleRootDragOver = (e) => {
    e.preventDefault();
    onDragOver?.(e, null);
  };

  const handleRootDrop = (e) => {
    e.preventDefault();
    onDrop?.(e, null);
  };

  return (
    <div
      ref={formRef}
      className={styles.canvasArea}
      onDragOver={handleRootDragOver}
      onDrop={handleRootDrop}
    >
      {tree.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Canvas ist leer</p>
          <p className={styles.emptyHint}>
            Ziehe Komponenten aus der Toolbar hierher
          </p>
        </div>
      ) : (
        tree.map((node) => renderNode(node))
      )}
    </div>
  );
}
