# Named Elements Context

## Beschreibung
Zentrales System zum Tracking von benannten Elementen (Cards) im Canvas.

## Funktionsweise

### 1. Provider
Der `NamedElementsProvider` umschließt den Canvas und verwaltet die Liste aller benannten Elemente.

### 2. In Cards verwenden
Jede Card die einen Namen hat, registriert sich automatisch:

```tsx
import { useNamedElements } from '../../contexts/NamedElementsContext';

function MyCard({ id }: { id: string }) {
  const { updateElementName, unregisterElement } = useNamedElements();
  const [name, setName] = useState('');

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setName(newName);
    updateElementName(id, newName); // Registriert oder updated
  };

  // Cleanup beim Löschen
  useEffect(() => {
    return () => unregisterElement(id);
  }, [id, unregisterElement]);

  return <input value={name} onChange={handleNameChange} />;
}
```

### 3. Liste in anderen Komponenten verwenden
Verwende `NamedElementsSelect` oder baue eigene Komponenten:

```tsx
import NamedElementsSelect from '../components/NamedElementsSelect';

function MyComponent() {
  const [selectedId, setSelectedId] = useState('');

  return (
    <NamedElementsSelect
      value={selectedId}
      onChange={setSelectedId}
      placeholder="Element auswählen..."
    />
  );
}
```

### 4. Direkter Zugriff auf die Liste
```tsx
import { useNamedElements } from '../contexts/NamedElementsContext';

function MyComponent() {
  const { namedElements } = useNamedElements();

  return (
    <ul>
      {namedElements.map(el => (
        <li key={el.id}>{el.name} ({el.id})</li>
      ))}
    </ul>
  );
}
```

## Verhalten
- ✅ Nur Elemente mit Namen werden getrackt (leere Namen werden ignoriert)
- ✅ Beim Löschen einer Card wird sie automatisch aus der Liste entfernt (useEffect cleanup)
- ✅ Namen-Updates erfolgen sofort
- ✅ Kein kompletter Rerender - nur die Komponenten die `useNamedElements` verwenden werden neu gerendert
