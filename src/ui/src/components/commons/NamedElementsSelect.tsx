import React from 'react';
import { useNamedElements } from '../../contexts/NamedElementsContext';

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
