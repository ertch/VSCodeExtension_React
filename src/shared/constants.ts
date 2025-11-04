// src/shared/constants.ts

// ============================================================================
// TREE CONFIGURATION
// ============================================================================

/**
 * Maximum tree depth (0-indexed)
 *
 * Defines the maximum nesting level for components.
 * Value of 5 means: levels 0, 1, 2, 3, 4 (5 total levels)
 */
export const MAX_TREE_DEPTH = 5;

/**
 * Maximum nesting level (for UI validation)
 *
 * Used in drag-and-drop validation to prevent exceeding depth limits.
 * Equal to MAX_TREE_DEPTH - 1 (last valid index)
 */
export const MAX_NESTING_LEVEL = 4;

// ============================================================================
// DRAG & DROP CONFIGURATION
// ============================================================================

/**
 * Percentage of card height for "drop before" zone
 *
 * Top 25% of a card triggers "insert before target" behavior
 */
export const DND_ZONE_TOP_PERCENT = 0.25;

/**
 * Percentage of card height for "drop after" zone
 *
 * Bottom 25% of a card triggers "insert after target" behavior
 * Middle 50% triggers "insert as child" (if target allows children)
 */
export const DND_ZONE_BOTTOM_PERCENT = 0.25;

// ============================================================================
// TIMING CONFIGURATION
// ============================================================================

/**
 * Auto-save debounce delay in milliseconds
 *
 * Configuration is automatically saved 2 seconds after last tree modification
 */
export const AUTOSAVE_DELAY_MS = 2000;

/**
 * Webview initialization delay in milliseconds
 *
 * Delay before sending INIT message to ensure webview is ready
 * Note: This is a workaround for race conditions - ideally should wait for READY message
 */
export const WEBVIEW_INIT_DELAY_MS = 100;

// ============================================================================
// PROJECT STRUCTURE
// ============================================================================

/**
 * Directory name that identifies ttEditor projects
 *
 * Presence of this directory enables code generation features
 */
export const ASTRO_DIR = '.astro';

/**
 * Subdirectory for Astro component files
 *
 * Located inside ASTRO_DIR, contains reusable Astro components
 */
export const ASTRO_COMPONENTS_DIR = 'Componenten';

/**
 * Configuration file name
 *
 * JSON file storing the component tree and project metadata
 */
export const CONFIG_FILENAME = '.ttEditor.json';

/**
 * Configuration schema version
 *
 * Used for validation and future migration logic
 */
export const CONFIG_VERSION = '1.0';

// ============================================================================
// UI TEXT CONSTANTS (German)
// ============================================================================

/**
 * User-facing text messages
 *
 * All UI strings centralized for easy translation and maintenance
 */
export const UI_TEXT = {
  NO_WORKSPACE: 'Kein Workspace',
  VALID_PROJECT: '[OK] ttEditor Projekt',
  STANDARD_WORKSPACE: '[ ] Standard Workspace',
  CANVAS_LOADING: 'Lade Canvas...',
  CANVAS_EMPTY: 'Canvas ist leer',
  CANVAS_EMPTY_HINT: 'Ziehe Komponenten aus der Toolbar hierher',
  NO_COMPONENTS: 'Keine Komponenten gefunden',
  COMPONENT_PALETTE_TITLE: 'Komponenten',
  DELETE_CONFIRM: 'wirklich loeschen?',
  CLEAR_CANVAS_CONFIRM: 'Canvas wirklich leeren? Alle Aenderungen gehen verloren.',
  SAVE_SUCCESS: 'Konfiguration gespeichert',
  SAVE_ERROR: 'Fehler beim Speichern',
  LOAD_ERROR: 'Fehler beim Laden',
  NO_CONFIG_FOUND: 'Keine gespeicherte Konfiguration gefunden',
  INVALID_CONFIG: 'Korrupte Konfigurationsdatei',
  MAX_DEPTH_REACHED: 'Maximale Verschachtelungstiefe erreicht',
  CIRCULAR_DEPENDENCY: 'Parent-Komponente kann nicht in eigenes Child verschoben werden',
  CODE_GEN_NOT_AVAILABLE: 'Code-Generator nur in ttEditor-Projekten verfuegbar',
  OPEN_FOLDER_FIRST: 'Bitte oeffne zuerst einen Ordner/Workspace',
} as const;

// ============================================================================
// COMPONENT ICONS (Text-based, NO EMOJIS)
// ============================================================================

/**
 * Text-based icons for UI elements
 *
 * Simple ASCII/text representations to avoid emoji usage
 */
export const COMPONENT_ICONS = {
  PARENT: '[P]',
  CHILD: '[C]',
  DRAG_HANDLE: '::',
  DELETE: 'X',
} as const;

// ============================================================================
// BUTTON LABELS
// ============================================================================

/**
 * Labels for action buttons
 *
 * Centralized button text for consistency across UI
 */
export const BUTTON_LABELS = {
  OPEN_FOLDER: 'Ordner oeffnen',
  OPEN_CANVAS: 'Canvas oeffnen',
  GENERATE_CODE: 'Code generieren',
  SAVE: 'Speichern',
  LOAD: 'Laden',
  CLEAR: 'Canvas leeren',
} as const;
