/**
 * Canvas Component
 * Haupt-Canvas für Drag & Drop Editor
 */

import React, { useState, useRef, useEffect } from 'react';
import { loadComponents } from '../utils/componentLoader';
import { useExtensionBridge } from '../hooks/useExtensionBridge';
import { useTreeOperations } from '../hooks/useTreeOperations';
import { useDragAndDrop } from '../hooks/useDragAndDrop';
import Toolbar from './Toolbar';
import CanvasArea from './CanvasArea';
import ButtonBar from './ButtonBar';
import styles from './canvas.module.css';

export default function Canvas() {
  const [tree, setTree] = useState([]);
  const [paletteMap, setPaletteMap] = useState(new Map());
  const formRef = useRef(null);

  // Extension Bridge
  const {
    config,
    projectName,
    isReady,
    isValidProject,
    saveToExtension,
    loadFromExtension,
  } = useExtensionBridge();

  // Tree Operations
  const {
    handleDelete,
    addNodeAtRoot,
    clearCanvas,
    serializeCanvas,
    updateNodeProps,
  } = useTreeOperations(tree, setTree, formRef, paletteMap);

  // Drag & Drop
  const {
    dragging,
    hover,
    setHover,
    handlePaletteDragStart,
    handleNodeDragStart,
    computeZone,
    performDrop,
  } = useDragAndDrop(tree, setTree, paletteMap);

  // Load palette components
  useEffect(() => {
    const components = loadComponents();
    const map = new Map(
      components.map((entry) => [entry.type, entry])
    );
    setPaletteMap(map);
    console.log('Palette loaded:', components.length, 'components');
  }, []);

  // Load config from extension
  useEffect(() => {
    if (config?.tree) {
      setTree(config.tree);
      console.log('Canvas: Config loaded from extension');
    }
  }, [config]);

  // Handle Save
  const handleSave = () => {
    const serialized = serializeCanvas();
    saveToExtension(serialized);
  };

  // Handle Load
  const handleLoad = () => {
    loadFromExtension();
  };

  // Handle Generate Code
  const handleGenerateCode = () => {
    const serialized = serializeCanvas();
    console.log('Generate code for:', serialized);
    alert('Code-Generierung noch nicht implementiert');
  };

  // DnD Handlers
  const handleCanvasDragOver = (e, targetId) => {
    e.preventDefault();
    if (!dragging) return;

    const target = targetId ? tree.find((n) => n.id === targetId) : null;
    const zone = target ? computeZone(e, target) : null;

    setHover({ targetId, zone });
  };

  const handleCanvasDrop = (e, targetId) => {
    e.preventDefault();

    let payload = null;
    try {
      const data = e.dataTransfer.getData('application/x-canvas');
      payload = JSON.parse(data);
    } catch (err) {
      console.error('Invalid drop data:', err);
      return;
    }

    performDrop({
      dropTargetId: targetId,
      zone: hover.zone,
      payload,
    });

    setHover({ targetId: null, zone: null });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+S / Ctrl+S: Save
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }

      // Delete: Remove selected (not implemented yet - would need selection state)
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tree]);

  // Autosave (2s debounce)
  useEffect(() => {
    if (!isReady || tree.length === 0) return;

    const timer = setTimeout(() => {
      console.log('Autosave triggered');
      const serialized = serializeCanvas();
      saveToExtension(serialized);
    }, 2000);

    return () => clearTimeout(timer);
  }, [tree, isReady]);

  if (!isReady) {
    return (
      <div className={styles.loading}>
        <p>Lade Canvas...</p>
      </div>
    );
  }

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasHeader}>
        <h1 className={styles.title}>ttEditor Canvas</h1>
        <span className={styles.projectName}>{projectName}</span>
      </div>

      <div className={styles.canvasMain}>
        <CanvasArea
          tree={tree}
          paletteMap={paletteMap}
          formRef={formRef}
          hover={hover}
          dragging={dragging}
          onNodeDragStart={handleNodeDragStart}
          onDragOver={handleCanvasDragOver}
          onDrop={handleCanvasDrop}
          onDelete={handleDelete}
          onUpdateProps={updateNodeProps}
        />

        <Toolbar
          components={Array.from(paletteMap.values())}
          onDragStart={handlePaletteDragStart}
        />
      </div>

      <ButtonBar
        onSave={handleSave}
        onLoad={handleLoad}
        onGenerate={handleGenerateCode}
        onClear={clearCanvas}
        isValidProject={isValidProject}
      />
    </div>
  );
}
