/**
 * Component Auto-Loader
 * Verwendet Vite's glob import um Komponenten dynamisch zu laden
 */

export interface PaletteEntry {
  type: string;
  label: string;
  info: string;
  canBeParent: boolean;
  codeGen: any;
  Component: React.ComponentType<any>;
}

/**
 * Lädt alle Komponenten aus /components/cards/ automatisch
 */
export function loadComponents(): PaletteEntry[] {
  // Vite's glob import
  const componentModules = import.meta.glob('../components/cards/*.{tsx,jsx}', {
    eager: true,
  });

  const components: PaletteEntry[] = [];

  for (const [path, module] of Object.entries(componentModules)) {
    const component = (module as any).default;
    const meta = component?.paletteEntry || component?.paletteMetadata;

    if (!meta) {
      const filename = path.split('/').pop()?.replace(/\.(tsx|jsx)$/, '');
      console.warn(`Component ${filename} missing paletteEntry - skipping`);
      continue;
    }

    components.push({
      type: meta.type,
      label: meta.label || meta.type,
      info: meta.info || `${meta.label} component`,
      canBeParent: meta.canBeParent ?? false,
      codeGen: meta.codeGen,
      Component: component,
    });
  }

  return components;
}

/**
 * Extrahiert Komponentenname aus Pfad
 */
function extractName(path: string): string {
  const filename = path.split('/').pop();
  return filename?.replace(/\.(tsx|jsx)$/, '') || 'Unknown';
}
