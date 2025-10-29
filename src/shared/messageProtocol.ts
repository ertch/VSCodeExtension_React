/**
 * Message Protocol für Extension ↔ Canvas Kommunikation
 * Definiert alle Nachrichtentypen zwischen VS Code Extension und React Webview
 */

// ============================================================================
// EXTENSION → CANVAS
// ============================================================================

export type ExtensionToCanvasMessage =
  | {
      type: 'INIT';
      payload: {
        projectName: string;
        config: ProjectConfig | null;
        isValidProject: boolean;
      };
    }
  | {
      type: 'LOAD_RESPONSE';
      payload: ProjectConfig;
    }
  | {
      type: 'SAVE_SUCCESS';
      filePath: string;
    }
  | {
      type: 'ERROR';
      message: string;
    };

// ============================================================================
// CANVAS → EXTENSION
// ============================================================================

export type CanvasToExtensionMessage =
  | {
      type: 'READY';
    }
  | {
      type: 'SAVE';
      payload: ProjectConfig;
    }
  | {
      type: 'LOAD_REQUEST';
    };

// ============================================================================
// SHARED DATA STRUCTURES
// ============================================================================

/**
 * Hauptkonfiguration des Canvas-Projekts
 * Gespeichert in .ttEditor.json im Workspace Root
 */
export interface ProjectConfig {
  version: '1.0';
  projectName: string;
  lastModified: string; // ISO 8601 Timestamp
  tree: ComponentNode[];
  metadata: {
    author?: string;
    description?: string;
    [key: string]: any;
  };
}

/**
 * Einzelne Komponente im Canvas-Baum
 */
export interface ComponentNode {
  id: string; // Unique ID: "node_abc123"
  type: string; // Component Type: "SimpleInput", "ConBlock", etc.
  props: Record<string, any>; // Component Properties
  children: ComponentNode[]; // Nested Children
  codeGen: CodeGenConfig; // Code-Generierung Config
}

/**
 * Konfiguration für Astro-Code-Generierung
 */
export interface CodeGenConfig {
  component: string; // Name der Astro-Komponente
  attributes?: Record<string, any>; // Zusätzliche Attribute
}
