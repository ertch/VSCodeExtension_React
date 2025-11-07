import { useNamedElements } from '../../contexts/NamedElementsContext';

/**
 * Select_NamedElements - Named element selector component
 *
 * Provides dropdown populated with registered named elements from NamedElementsContext.
 * Used by Input_TrippleList for selecting target elements.
 */
export default function Select_NamedElements(props: { name: string }) {
  const { namedElements } = useNamedElements();

  return (
    <select name={props.name}>
      <option value="">--Bitte wählen--</option>
      {namedElements.map((element) => (
        <option key={element.id} value={element.id}>
          {element.name}
        </option>
      ))}
    </select>
  );
}
