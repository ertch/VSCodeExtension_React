# Card-Komponenten: Astro → React Übersetzungs-Guide

Dieses Dokument beschreibt, wie Astro-Komponenten in das React-basierte Card-System übersetzt werden.

## System-Architektur

### Komponenten-Hierarchie
1. **BaseCard** (`src/ui/src/components/cards/CardLayout/BaseCard.tsx`)
   - Verwaltet `name`-State (wird als Label/Legend angezeigt)
   - Rendert automatisch Name-Input-Feld
   - Ruft `config.renderPreview(name, id, slotProps)` auf
   - **NEU:** Übergibt `slotProps` für Kinder-Rendering im Preview

2. **NodeWrapper** (`src/ui/src/components/canvas/NodeWrapper.tsx`)
   - Rendert die Card-Komponente
   - Erstellt `slotProps` für Komponenten mit `canBeParent: true`
   - Übergibt `slotProps` an BaseCard
   - **WICHTIG:** Kinder können jetzt IM `renderPreview` erscheinen (via `<Slot />`)!

3. **Slot-Komponente** (`src/ui/src/components/canvas/Slot.tsx`)
   - Ermöglicht Kinder-Rendering innerhalb des Preview-HTML
   - Verwendet `forwardRef` um Drop-Target-Ref weiterzugeben
   - Zeigt "Drop hier hinein..." wenn leer
   - **Wie `<slot />` in Astro!**

4. **Attribute → Input-Felder**
   - Jedes Attribut in `attributes` erzeugt ein Input-Feld
   - Werte werden via `extractInputsFromElement` extrahiert
   - Code-Generator verarbeitet diese Werte

## Standard-Template

### Komponente OHNE Kinder (canBeParent: false)

```tsx
import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const componentConfig: CardConfig = {
  defaultName: 'ComponentName',      // Name in der Palette
  codegenName: 'ComponentName',      // Name für Code-Generierung
  canBeParent: false,                // Keine Kinder erlaubt
  attributes: [
    { name: 'attributeName', type: 'string', toolTip: 'Beschreibung', optional: true },
    // Weitere Attribute...
  ],
  renderPreview: (name, id) => (
    // Preview-HTML hier (slotProps ist undefined)
    <div>{name}</div>
  )
}

export default function ComponentCard({ id }: { id: string }) {
  return <BaseCard id={id} config={componentConfig} />
}
```

### Komponente MIT Kindern (canBeParent: true)

```tsx
import BaseCard, { CardConfig } from './CardLayout/BaseCard'
import { Slot } from '../canvas/Slot'

const componentConfig: CardConfig = {
  defaultName: 'ComponentName',
  codegenName: 'ComponentName',
  canBeParent: true,                 // Kinder erlaubt!
  attributes: [
    { name: 'attributeName', type: 'string', toolTip: 'Beschreibung', optional: true },
  ],
  renderPreview: (name, id, slotProps) => (
    <div id={id}>
      <h3>{name}</h3>
      {slotProps && <Slot ref={slotProps.ref} isEmpty={slotProps.isEmpty}>
        {slotProps.children}
      </Slot>}
    </div>
  )
}

export default function ComponentCard({ id }: { id: string }) {
  return <BaseCard id={id} config={componentConfig} />
}
```

## Übersetzungs-Regeln

### 1. Component Name
- **Wichtig**: Name muss mit `Simple` beginnen, z.B. `SimpleFieldset`, `SimpleInput`
- `defaultName` = `codegenName` = Component-Dateiname (ohne `.tsx`)

### 2. Props/Attributes

#### Astro → React Mapping
| Astro | React | Bemerkung |
|-------|-------|-----------|
| `legend: string` | `name` (BaseCard) | **NICHT** als Attribut definieren! |
| `id?: string` | `id` (Parameter) | **NICHT** als Attribut definieren! |
| `klasse?: string` | `class` | Standard HTML-Attribut |
| `hidden?: boolean` | `hidden` (checkbox) | Logik im CodeGenerator |
| `group?: string` | `data-grp` | Data-Attribute beibehalten |

#### Attribut-Definition
```tsx
attributes: [
  {
    name: 'attributeName',           // HTML-Attributname
    type: 'string' | 'checkbox' | 'function' | 'tripple_submit',
    toolTip: 'Beschreibender Text',  // Hilfetext für User
    optional: true | false           // Pflichtfeld?
  },
]
```

### 3. canBeParent Flag
- `canBeParent: true` → Komponente kann Kinder haben (Astro: `<slot />`)
- `canBeParent: false` → Keine Kinder erlaubt

**Wichtig**: `<slot />` wird **NICHT** im `renderPreview` verwendet!

### 4. renderPreview

#### Signatur
```tsx
// OHNE Kinder (canBeParent: false)
renderPreview: (name: string, id: string) => React.ReactNode

// MIT Kindern (canBeParent: true)
renderPreview: (name: string, id: string, slotProps?: SlotProps) => React.ReactNode
```

#### Regeln
- **Parameter verwenden:**
  - `name` - Komponenten-Name (vom BaseCard verwaltet)
  - `id` - Automatisch vergebene ID
  - `slotProps` - Nur vorhanden wenn `canBeParent: true`
- **Für Kinder:** Nutze `<Slot />` Komponente statt `<slot />`
- **Fragment** (`<>...</>`) nur bei mehreren Root-Elementen

#### SlotProps Interface
```tsx
interface SlotProps {
  children: React.ReactNode    // Die gerenderten Kinder
  ref: React.RefObject<HTMLDivElement>  // Ref für Drop-Target
  isEmpty: boolean              // true wenn keine Kinder vorhanden
}
```

#### Beispiele

**Astro Original (OHNE Kinder):**
```astro
<div>
  <label for={id}>{label}</label>
</div>
<input id={id} />
```

**React Translation:**
```tsx
renderPreview: (name, id) => (
  <>
    <div>
      <label htmlFor={`${id}_input`}>{name}</label>
    </div>
    <input className='input-text' />
  </>
)
```

**Astro Original (MIT Kindern):**
```astro
<fieldset id={id} class={setClass}>
  <legend>{legend}</legend>
  <slot />
</fieldset>
```

**React Translation:**
```tsx
import { Slot } from '../canvas/Slot'

renderPreview: (name, id, slotProps) => (
  <fieldset id={id}>
    <legend>{name}</legend>
    {slotProps && <Slot ref={slotProps.ref} isEmpty={slotProps.isEmpty}>
      {slotProps.children}
    </Slot>}
  </fieldset>
)
```

**Wichtig:** Die `<Slot />` Komponente:
- Muss importiert werden: `import { Slot } from '../canvas/Slot'`
- Verwendet `ref={slotProps.ref}` für Drop-Target-Registrierung
- Zeigt automatisch "Drop hier hinein..." wenn `isEmpty: true`
- Rendert `slotProps.children` wenn vorhanden
```

### 5. CSS-Klassen & Logik

**Wichtig**: Komplexe Logik gehört **NICHT** ins `renderPreview`!

#### Astro Beispiel:
```astro
let setClass = hidden ? `${klasse ? klasse : ''} d-none` : klasse;
```

#### React:
- `renderPreview` zeigt **statische** Vorschau
- Logik wird im **CodeGenerator** implementiert
- Attribute wie `hidden` und `class` werden als Inputs definiert

#### CodeGenerator (Pseudocode):
```typescript
case 'SimpleFieldset':
  const className = inputs.hidden
    ? `${inputs.class || ''} d-none`.trim()
    : inputs.class;

  return `<fieldset class="${className}">${children}</fieldset>`;
```

### 6. Registrierung in Palette

Nach dem Erstellen der Komponente in `index.ts` registrieren:

```tsx
import ComponentName from "./ComponentName";

export const cardComponents: PaletteEntry<any>[] = [
  // ... bestehende Komponenten
  {
    type: "ComponentName",
    label: "ComponentName",
    canHaveChildren: true,  // Muss mit canBeParent übereinstimmen!
    Component: ComponentName,
  },
];

export { ComponentName };
```

## Häufige Fehler

### ❌ `<slot />` in JSX verwenden
```tsx
// FALSCH - <slot /> existiert nicht in React!
renderPreview: (name, id) => (
  <div>
    <slot />
  </div>
)

// RICHTIG - Nutze <Slot /> Komponente
import { Slot } from '../canvas/Slot'

renderPreview: (name, id, slotProps) => (
  <div>
    {slotProps && <Slot ref={slotProps.ref} isEmpty={slotProps.isEmpty}>
      {slotProps.children}
    </Slot>}
  </div>
)
```

### ❌ Falsche Signatur
```tsx
// FALSCH - fehlender Parameter
renderPreview: (name) => (...)

// RICHTIG - Ohne Kinder
renderPreview: (name, id) => (...)

// RICHTIG - Mit Kindern
renderPreview: (name, id, slotProps) => (...)
```

### ❌ Legend/Label als Attribut
```tsx
// FALSCH - erzeugt doppeltes Input-Feld
attributes: [
  { name: 'legend', type: 'string', optional: false },
]

// RICHTIG - name vom BaseCard verwenden
renderPreview: (name, id) => (
  <legend>{name}</legend>
)
```

### ❌ ID als Attribut
```tsx
// FALSCH
attributes: [
  { name: 'id', type: 'string', optional: true },
]

// RICHTIG - id aus Parameter verwenden
renderPreview: (name, id) => (
  <div id={id}>...</div>
)
```

### ❌ Logik im renderPreview
```tsx
// FALSCH - Logik gehört in CodeGenerator
renderPreview: (name, id) => {
  const className = hidden ? 'd-none' : '';  // Woher kommt hidden?
  return <div className={className}></div>
}

// RICHTIG - statische Vorschau
renderPreview: (name, id) => (
  <div></div>
)
```

## Checkliste für neue Komponenten

- [ ] Datei erstellt: `src/ui/src/components/cards/ComponentName.tsx`
- [ ] Name beginnt mit `Simple`
- [ ] `defaultName` = `codegenName` = Dateiname
- [ ] `canBeParent` korrekt gesetzt
- [ ] Keine `id` oder `legend`/`label` in `attributes`
- [ ] `renderPreview` hat korrekte Parameter:
  - Ohne Kinder: `(name, id)`
  - Mit Kindern: `(name, id, slotProps)`
- [ ] Wenn `canBeParent: true`:
  - [ ] `Slot` importiert: `import { Slot } from '../canvas/Slot'`
  - [ ] `<Slot />` korrekt verwendet mit `ref` und `isEmpty`
  - [ ] Conditional Rendering: `{slotProps && <Slot ...>}`
- [ ] Tooltips für alle Attribute ausgefüllt
- [ ] In `index.ts` importiert und registriert
- [ ] `canHaveChildren` in `index.ts` = `canBeParent`
- [ ] Export in `index.ts` hinzugefügt

## Beispiel-Komponenten

### SimpleFieldset (mit Kindern)
```tsx
import BaseCard, { CardConfig } from './CardLayout/BaseCard'
import { Slot } from '../canvas/Slot'

const simpleFieldsetConfig: CardConfig = {
  defaultName: 'SimpleFieldset',
  codegenName: 'SimpleFieldset',
  canBeParent: true,
  attributes: [
    { name: 'class', type: 'string', toolTip: 'CSS-Klassen für das Fieldset', optional: true },
    { name: 'data-grp', type: 'string', toolTip: 'Gruppierungskennung für zusammengehörige Fieldsets', optional: true },
    { name: 'hidden', type: 'checkbox', toolTip: 'Fieldset initial verstecken (fügt "d-none" Klasse hinzu)', optional: true },
  ],
  renderPreview: (name, id, slotProps) => (
    <fieldset id={id}>
      <legend>{name}</legend>
      {slotProps && <Slot ref={slotProps.ref} isEmpty={slotProps.isEmpty}>
        {slotProps.children}
      </Slot>}
    </fieldset>
  )
}

export default function SimpleFieldsetCard({ id }: { id: string }) {
  return <BaseCard id={id} config={simpleFieldsetConfig} />
}
```

### SimpleInput (ohne Kinder)
```tsx
import BaseCard, { CardConfig } from './CardLayout/BaseCard'

const simpleInputConfig: CardConfig = {
  defaultName: 'SimpleInput',
  codegenName: 'SimpleInput',
  canBeParent: false,
  attributes: [
    { name: 'type', type: 'string', toolTip: '', optional: false },
    { name: 'class', type: 'string', toolTip: '', optional: false },
    { name: 'value', type: 'string', toolTip: '', optional: false },
    { name: 'required', type: 'checkbox', toolTip: '', optional: false },
    { name: 'disabled', type: 'checkbox', toolTip: '', optional: false },
    // ... weitere Attribute
  ],
  renderPreview: (name, id) => (
    <>
      <div>
        <label htmlFor={`${id}_input`}>{name}</label>
      </div>
      <input className='input-text' />
    </>
  )
}

export default function SimpleInputCard({ id }: { id: string }) {
  return <BaseCard id={id} config={simpleInputConfig} />
}
```

## Code-Generator Integration

Nach dem Erstellen der Card-Komponente muss ein Handler im CodeGenerator hinzugefügt werden:

**Datei**: `src/generator/CodeGenerator.ts`

```typescript
case 'SimpleFieldset':
  const className = inputs.hidden
    ? `${inputs.class || ''} d-none`.trim()
    : inputs.class;

  return `
<fieldset
  id="${inputs.id || ''}"
  class="${className || ''}"
  data-grp="${inputs['data-grp'] || ''}"
>
  <legend>${inputs.name}</legend>
  ${children}
</fieldset>`.trim();
```

## Nützliche Ressourcen

- BaseCard: `src/ui/src/components/cards/CardLayout/BaseCard.tsx`
- NodeWrapper: `src/ui/src/components/canvas/NodeWrapper.tsx`
- Palette: `src/ui/src/components/cards/index.ts`
- CodeGenerator: `src/generator/CodeGenerator.ts`
- Beispiele: `src/ui/src/components/cards/SimpleInput.tsx`
