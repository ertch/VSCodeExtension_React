// src/ui/src/utils/componentPalette.tsx

import React from 'react';

/**
 * COMPONENT PALETTE
 *
 * KRITISCH (DEUTSCH):
 * - Definiert ALLE verfuegbaren Canvas-Komponenten
 * - Jede Component hat: type, label, canBeParent, defaultProps, compName, PreviewComponent
 * - compName ist der Astro-Komponenten-Name fuer Code-Generierung
 * - PreviewComponent ist React-Komponente fuer Canvas-Preview
 * - canBeParent bestimmt ob Children erlaubt sind
 *
 * STRUKTUR:
 * {
 *   type: string,              // Muss mit Astro-Komponente uebereinstimmen
 *   label: string,             // Display-Name in Toolbar
 *   canBeParent: boolean,      // Kann Children haben?
 *   defaultProps: object,      // Initiale Prop-Werte
 *   compName: string,          // Astro-Tag-Name
 *   PreviewComponent: Function // React-Komponente fuer Preview
 * }
 */

export interface ComponentPaletteEntry {
  type: string;
  label: string;
  canBeParent: boolean;
  defaultProps: Record<string, any>;
  compName: string;
  PreviewComponent: React.FC<any>;
}

export const COMPONENT_PALETTE: ComponentPaletteEntry[] = [
  // ==========================================================================
  // INPUT COMPONENTS (LEAFS - NO CHILDREN)
  // ==========================================================================

  {
    type: 'SimpleInput',
    label: 'SimpleInput',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      type: 'text',
      klasse: '',
      value: '',
      required: false,
      hidden: false,
      maxlength: '',
      disabled: false,
      submitTo: '',
      validate: '',
    },
    compName: 'SimpleInput',
    PreviewComponent: ({ id, label, type, value, required, hidden, maxlength, disabled, klasse }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SimpleInput'}</label>
        <input
          id={id}
          type={type || 'text'}
          className={klasse}
          defaultValue={value}
          required={required}
          maxLength={maxlength}
          disabled={disabled}
          style={{ width: '100%', padding: '4px', marginTop: '2px' }}
        />
      </div>
    ),
  },

  {
    type: 'SimpleTextfield',
    label: 'SimpleTextfield',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      row: '3',
      col: '50',
      value: '',
      required: false,
      maxlength: '',
      submitTo: '',
      klasse: '',
      hidden: false,
    },
    compName: 'SimpleTextfield',
    PreviewComponent: ({ id, label, row, col, value, required, maxlength, klasse, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SimpleTextfield'}</label>
        <textarea
          className={klasse}
          id={id}
          rows={parseInt(row) || 3}
          cols={parseInt(col) || 50}
          defaultValue={value}
          required={required}
          maxLength={maxlength}
          style={{ width: '100%', padding: '4px', marginTop: '2px' }}
        />
      </div>
    ),
  },

  {
    type: 'SimpleSelect',
    label: 'SimpleSelect',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      name: '',
      klasse: '',
      hidden: false,
      required: false,
      submitTo: '',
    },
    compName: 'SimpleSelect',
    PreviewComponent: ({ id, label, klasse, hidden, required }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SimpleSelect'}</label>
        <select id={id} className={klasse} required={required} style={{ width: '100%', padding: '4px', marginTop: '2px' }}>
          <option value="">-- Bitte waehlen --</option>
        </select>
      </div>
    ),
  },

  {
    type: 'RadioButton',
    label: 'RadioButton',
    canBeParent: false,
    defaultProps: {
      id: '',
      name: '',
      value: '',
      label: '',
      required: false,
      submitTo: '',
      hidden: false,
    },
    compName: 'RadioButton',
    PreviewComponent: ({ id, name, value, label, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input type="radio" id={id} name={name} value={value} />
          {label || 'RadioButton'}
        </label>
      </div>
    ),
  },

  {
    type: 'SuggestionInput',
    label: 'SuggestionInput',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      hidden: false,
      klasse: '',
    },
    compName: 'SuggestionInput',
    PreviewComponent: ({ id, label, hidden, klasse }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SuggestionInput'}</label>
        <input type="text" id={id} list={`${id}List`} className={klasse} style={{ width: '100%', padding: '4px', marginTop: '2px' }} />
        <datalist id={`${id}List`}>
          <option value="Option 1" />
          <option value="Option 2" />
        </datalist>
      </div>
    ),
  },

  {
    type: 'GatekeeperSelect',
    label: 'GatekeeperSelect',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      hidden: false,
    },
    compName: 'GatekeeperSelect',
    PreviewComponent: ({ id, label, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'GatekeeperSelect'}</label>
        <select id={id} style={{ width: '100%', padding: '4px', marginTop: '2px' }}>
          <option value="">-- Bitte waehlen --</option>
        </select>
      </div>
    ),
  },

  {
    type: 'SQLinjectionSelect',
    label: 'SQLinjectionSelect',
    canBeParent: false,
    defaultProps: {
      id: '',
      label: '',
      hidden: false,
    },
    compName: 'SQLinjectionSelect',
    PreviewComponent: ({ id, label, hidden }) => (
      <div className={hidden ? 'd-none' : ''}>
        <label htmlFor={id}>{label || 'SQLinjectionSelect'}</label>
        <select id={id} style={{ width: '100%', padding: '4px', marginTop: '2px' }}>
          <option value="">-- Bitte waehlen --</option>
        </select>
      </div>
    ),
  },

  // ==========================================================================
  // CONTAINER COMPONENTS (PARENTS - CAN HAVE CHILDREN)
  // ==========================================================================

  {
    type: 'SimpleFieldset',
    label: 'SimpleFieldset',
    canBeParent: true,
    defaultProps: {
      legend: '',
      id: '',
      klasse: '',
      hidden: false,
    },
    compName: 'SimpleFieldset',
    PreviewComponent: ({ legend, id, klasse, hidden }) => (
      <fieldset id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', marginTop: '8px', padding: '8px', border: '1px solid #ddd' }}>
        <legend>{legend || 'SimpleFieldset'}</legend>
        <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>[Children werden hier angezeigt]</div>
      </fieldset>
    ),
  },

  {
    type: 'ConBlock',
    label: 'ConBlock',
    canBeParent: true,
    defaultProps: {
      id: '',
      If: '',
      klasse: '',
      hidden: false,
    },
    compName: 'ConBlock',
    PreviewComponent: ({ id, klasse, hidden }) => (
      <div id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', border: '2px dashed #ccc', padding: '8px', marginTop: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px' }}>ConBlock [Conditional Container]</div>
        <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>[Children werden hier angezeigt]</div>
      </div>
    ),
  },

  {
    type: 'Gate',
    label: 'Gate',
    canBeParent: true,
    defaultProps: {
      id: '',
      klasse: '',
      hidden: false,
    },
    compName: 'Gate',
    PreviewComponent: ({ id, klasse, hidden }) => (
      <div id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', border: '2px solid #4a90e2', padding: '8px', marginTop: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#4a90e2' }}>Gate [Container]</div>
        <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>[Children werden hier angezeigt]</div>
      </div>
    ),
  },

  {
    type: 'GateGroup',
    label: 'GateGroup',
    canBeParent: true,
    defaultProps: {
      id: '',
      klasse: '',
      hidden: false,
    },
    compName: 'GateGroup',
    PreviewComponent: ({ id, klasse, hidden }) => (
      <div id={id} className={klasse} style={{ display: hidden ? 'none' : 'block', border: '2px solid #27ae60', padding: '8px', marginTop: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#27ae60' }}>GateGroup [Container]</div>
        <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>[Children werden hier angezeigt]</div>
      </div>
    ),
  },

  {
    type: 'TabWrapper',
    label: 'TabWrapper',
    canBeParent: true,
    defaultProps: {
      id: '',
      hidden: false,
    },
    compName: 'TabWrapper',
    PreviewComponent: ({ id, hidden }) => (
      <form id={id} style={{ display: hidden ? 'none' : 'block', border: '2px solid #e74c3c', padding: '8px', marginTop: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#e74c3c' }}>TabWrapper [Form Container]</div>
        <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>[Children werden hier angezeigt]</div>
      </form>
    ),
  },

  {
    type: 'TabPage',
    label: 'TabPage',
    canBeParent: true,
    defaultProps: {
      id: '',
      title: '',
      hidden: false,
    },
    compName: 'TabPage',
    PreviewComponent: ({ id, title, hidden }) => (
      <section id={id} style={{ display: hidden ? 'none' : 'block', border: '2px dashed #9b59b6', padding: '8px', marginTop: '8px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '4px', color: '#9b59b6' }}>TabPage: {title || 'Untitled'}</div>
        <div style={{ color: '#999', fontSize: '12px', fontStyle: 'italic' }}>[Children werden hier angezeigt]</div>
      </section>
    ),
  },

  // ==========================================================================
  // BUTTON COMPONENTS
  // ==========================================================================

  {
    type: 'WeiterButton',
    label: 'WeiterButton',
    canBeParent: false,
    defaultProps: {
      id: 'weiterBtn',
      label: 'Weiter',
      hidden: false,
    },
    compName: 'WeiterButton',
    PreviewComponent: ({ label, hidden }) => (
      <button type="button" style={{ display: hidden ? 'none' : 'inline-block', padding: '6px 12px', marginTop: '8px' }}>
        {label || 'Weiter'}
      </button>
    ),
  },

  {
    type: 'FinishButton',
    label: 'FinishButton',
    canBeParent: false,
    defaultProps: {
      id: 'finishBtn',
      label: 'Abschliessen',
      hidden: false,
    },
    compName: 'FinishButton',
    PreviewComponent: ({ label, hidden }) => (
      <button type="button" style={{ display: hidden ? 'none' : 'inline-block', padding: '6px 12px', marginTop: '8px' }}>
        {label || 'Abschliessen'}
      </button>
    ),
  },

  {
    type: 'RecordButton',
    label: 'RecordButton',
    canBeParent: false,
    defaultProps: {
      id: 'recordBtn',
      label: 'Aufzeichnen',
      hidden: false,
    },
    compName: 'RecordButton',
    PreviewComponent: ({ label, hidden }) => (
      <button type="button" style={{ display: hidden ? 'none' : 'inline-block', padding: '6px 12px', marginTop: '8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '3px' }}>
        {label || 'Aufzeichnen'}
      </button>
    ),
  },

  // ==========================================================================
  // DISPLAY COMPONENTS
  // ==========================================================================

  {
    type: 'Bild',
    label: 'Bild',
    canBeParent: false,
    defaultProps: {
      dateiname: '',
    },
    compName: 'Bild',
    PreviewComponent: ({ dateiname }) => (
      <div style={{ border: '1px dashed #ccc', padding: '8px', textAlign: 'center', marginTop: '8px', background: '#f9f9f9' }}>
        [Bild: {dateiname || 'kein-bild.png'}]
      </div>
    ),
  },

  {
    type: 'NavTabs',
    label: 'NavTabs',
    canBeParent: false,
    defaultProps: {
      id: 'navigation',
      tabs: '',
    },
    compName: 'NavTabs',
    PreviewComponent: () => (
      <div style={{ border: '1px solid #4a90e2', padding: '8px', marginTop: '8px', background: '#f0f8ff' }}>
        [NavTabs: Tab-Navigation]
      </div>
    ),
  },

  {
    type: 'CustomerCells',
    label: 'CustomerCells',
    canBeParent: false,
    defaultProps: {
      id: 'customerCells',
      data: '',
    },
    compName: 'CustomerCells',
    PreviewComponent: () => (
      <div style={{ border: '1px solid #27ae60', padding: '8px', marginTop: '8px', background: '#f0fff4' }}>
        [CustomerCells: Kunden-Informationen]
      </div>
    ),
  },

  {
    type: 'DebugLog',
    label: 'DebugLog',
    canBeParent: false,
    defaultProps: {
      id: 'debugLog',
      hidden: false,
    },
    compName: 'DebugLog',
    PreviewComponent: ({ hidden }) => (
      <div style={{ display: hidden ? 'none' : 'block', border: '1px solid #999', padding: '8px', marginTop: '8px', fontFamily: 'monospace', background: '#f5f5f5' }}>
        [DebugLog: Debug-Ausgabe]
      </div>
    ),
  },

  {
    type: 'FootButtons',
    label: 'FootButtons',
    canBeParent: false,
    defaultProps: {
      id: 'footer',
    },
    compName: 'FootButtons',
    PreviewComponent: () => (
      <div style={{ border: '1px solid #333', padding: '8px', marginTop: '8px', background: '#f5f5f5' }}>
        [FootButtons: Footer-Buttons]
      </div>
    ),
  },

  {
    type: 'Popups',
    label: 'Popups',
    canBeParent: false,
    defaultProps: {
      id: 'popups',
    },
    compName: 'Popups',
    PreviewComponent: () => (
      <div style={{ border: '1px dashed #e74c3c', padding: '8px', marginTop: '8px', background: '#fff5f5' }}>
        [Popups: Modal-Dialoge]
      </div>
    ),
  },
];

/**
 * Helper: Create a Map for O(1) lookups by type
 *
 * USAGE (DEUTSCH):
 * const paletteMap = createPaletteMap();
 * const entry = paletteMap.get('SimpleInput');
 */
export function createPaletteMap(): Map<string, ComponentPaletteEntry> {
  return new Map(COMPONENT_PALETTE.map((entry) => [entry.type, entry]));
}
