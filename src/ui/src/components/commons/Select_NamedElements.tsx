import { useNamedElements } from '../../contexts/NamedElementsContext';

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
