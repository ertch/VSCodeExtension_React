/**
 * Input_String - Simple text input component
 *
 * Used for basic string attributes in card components.
 * Wraps native HTML input for consistency with other input components.
 */
export default function Input_String({ name }: { name: string }) {
  return (
    <input
      type="text"
      name={name}
      className="input-text"
      placeholder="Enter text..."
    />
  );
}
