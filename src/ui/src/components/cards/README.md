# Cards Ordner

Hier werden alle Card-Komponenten verwaltet, die in der Palette erscheinen sollen.

## Neue Card hinzufügen

### Schritt 1: Card-Komponente erstellen

Erstelle eine neue `.tsx` Datei in diesem Ordner, z.B. `Card3.tsx`:

```tsx
import * as React from 'react'
import '../../index.css'

export default function Card3() {
    return (
        <div className='mainCanvas' data-codegen="Card3">
            <h1>Meine neue Card</h1>
            <input id="preview" type="text" />
            <details>
                <summary>Attribute</summary>
                <input id='id' type="text" />
                <input id='name' type="text" placeholder="Name" />
            </details>
        </div>
    );
}
```

### Schritt 2: In index.ts registrieren

Öffne `index.ts` in diesem Ordner und füge deine Card hinzu:

```typescript
// 1. Import hinzufügen
import Card3 from "./Card3";

// 2. Zum cardComponents Array hinzufügen
export const cardComponents: PaletteEntry[] = [
  // ... bestehende Cards ...
  {
    type: "Card3",                    // Eindeutiger Bezeichner
    label: "Card 3",                  // Name in der Sidebar-Palette
    canHaveChildren: false,           // true = kann andere Komponenten enthalten
    codeGen: {                        // Metadaten für den Export
      component: "Card3",
      variant: "default"
    },
    Component: Card3,                 // Die React-Komponente
  },
];

// 3. Optional: Export für direkten Import
export { Card, Card2, Card3 };
```

### Schritt 3: UI neu bauen

```bash
cd src/ui && npm run build
```

Oder vom Projekt-Root:

```bash
npm run build
```

## Hinweise

- **CSS-Import**: Verwende immer `import '../../index.css'` (zwei Ebenen nach oben)
- **type**: Muss eindeutig sein für jede Card
- **label**: Text, der in der Sidebar angezeigt wird
- **canHaveChildren**:
  - `false` = Standalone-Komponente
  - `true` = Container, der andere Komponenten aufnehmen kann
- **codeGen**: Beliebige Metadaten, die beim JSON-Export mitgeliefert werden
- **data-codegen**: Optionales Attribut im JSX, wird beim Export ausgelesen

## Struktur

```
cards/
├── README.md           # Diese Datei
├── index.ts            # Zentrale Registrierung aller Cards
├── Card.tsx            # Card-Komponente 1
├── Card2.tsx           # Card-Komponente 2
└── Card3.tsx           # Card-Komponente 3 (Beispiel)
```

Die Cards werden automatisch in die Palette aufgenommen über:
`src/utils/componentPalette/index.ts`
