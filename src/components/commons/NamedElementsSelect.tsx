import { useNamedElements } from '../../contexts/NamedElementsContext';

/**
 * NamedElementsSelect - Controlled named element selector
 *
 * Enhanced version of Select_NamedElements with controlled component pattern.
 * Supports value, onChange, placeholder, and className props for flexible usage.
 *
 * Use this when you need programmatic control over the selection.
 * Use Select_NamedElements for simple form inputs.
 */
interface NamedElementsSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function NamedElementsSelect({
  value,
  onChange,
  placeholder = "Element auswählen...",
  className,
}: NamedElementsSelectProps) {
  const { namedElements } = useNamedElements();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <select value={value} onChange={handleChange} className={className}>
      <option value="">{placeholder}</option>
      {namedElements.map((element) => (
        <option key={element.id} value={element.id}>
          {element.name}
        </option>
      ))}
    </select>
  );
}
