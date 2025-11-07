/**
 * Input_Checkbox - Checkbox input component
 *
 * Used for boolean attributes in card components.
 */
export default function Input_Checkbox({ name }: { name: string }) {
  return (
    <input
      type="checkbox"
      name={name}
      className="input-checkbox"
    />
  );
}
