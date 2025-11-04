// src/shared/messageProtocol.ts

import type { CONFIG_VERSION } from './constants';

// ============================================================================
// COMPONENT NODE STRUCTURE
// ============================================================================

/**
 * Represents a single component node in the tree
 *
 * @property id - Unique identifier (generated via crypto.randomUUID() or genId())
 * @property type - Component type matching the Astro component name (e.g., 'SimpleInput')
 * @property props - Component-specific properties (flexible object)
 * @property children - Optional array of child nodes (only present if canBeParent: true)
 * @property compName - Component name for code generation (stored in data-comp-name attribute)
 */
export interface ComponentNode {
  id: string;
  type: string;
  props: Record<string, any>;
  children?: ComponentNode[];
  compName: string;
}

// ============================================================================
// PROJECT CONFIGURATION
// ============================================================================

/**
 * Complete project configuration structure
 *
 * @property version - Schema version for future migrations
 * @property projectName - Name derived from workspace folder basename
 * @property lastModified - ISO 8601 timestamp of last modification
 * @property tree - Array of root-level component nodes
 * @property metadata - Extensible metadata object for future use
 */
export interface ProjectConfig {
  version: typeof CONFIG_VERSION;
  projectName: string;
  lastModified: string;
  tree: ComponentNode[];
  metadata: Record<string, any>;
}

// ============================================================================
// MESSAGE TYPES: WEBVIEW → EXTENSION
// ============================================================================

/**
 * Messages sent from the webview to the extension host
 */
export type CanvasToExtensionMessage =
  | {
      /**
       * Signals that the webview has finished initializing and is ready to receive messages
       */
      type: 'READY';
    }
  | {
      /**
       * Requests saving the current project configuration to .ttEditor.json
       */
      type: 'SAVE';
      payload: ProjectConfig;
    }
  | {
      /**
       * Requests loading the saved project configuration from .ttEditor.json
       */
      type: 'LOAD_REQUEST';
    }
  | {
      /**
       * Requests generation of Astro code file (index.astro)
       */
      type: 'GENERATE_CODE';
      payload: string;
    };

// ============================================================================
// MESSAGE TYPES: EXTENSION → WEBVIEW
// ============================================================================

/**
 * Messages sent from the extension host to the webview
 */
export type ExtensionToCanvasMessage =
  | {
      /**
       * Initial message sent after webview loads, contains project info and saved config
       */
      type: 'INIT';
      payload: {
        projectName: string;
        config: ProjectConfig | null;
        isValidProject: boolean;
      };
    }
  | {
      /**
       * Response to LOAD_REQUEST containing the loaded project configuration
       */
      type: 'LOAD_RESPONSE';
      payload: ProjectConfig;
    }
  | {
      /**
       * Confirmation that the configuration was successfully saved
       */
      type: 'SAVE_SUCCESS';
      filePath: string;
    }
  | {
      /**
       * Error notification with descriptive message
       */
      type: 'ERROR';
      message: string;
    };
