/**
 * ButtonBar Component
 * Action-Buttons unterhalb des Canvas
 */

import React from 'react';
import styles from './canvas.module.css';

export default function ButtonBar({ onSave, onLoad, onGenerate, onClear, isValidProject }) {
  return (
    <div className={styles.buttonBar}>
      <button className={styles.btn} onClick={onLoad}>
        Laden
      </button>
      <button className={styles.btnPrimary} onClick={onSave}>
        Speichern
      </button>
      <button
        className={styles.btn}
        onClick={onGenerate}
        disabled={!isValidProject}
        title={!isValidProject ? 'Code-Generator nur in ttEditor-Projekten verfügbar' : 'Code generieren'}
      >
        Code generieren
      </button>
      <button className={styles.btnDanger} onClick={onClear}>
        Canvas leeren
      </button>
    </div>
  );
}
