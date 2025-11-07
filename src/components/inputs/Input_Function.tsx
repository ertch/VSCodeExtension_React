/**
 * Input_Function - Function name input component
 *
 * Used for function reference attributes (e.g., onchange, onblur callbacks).
 * Accepts function names that will be validated during code generation.
 */
export default function Input_Function({ name }: { name: string }) {
  return (
    <input
      type="text"
      name={name}
      className="input-text"
      placeholder="functionName"
      pattern="[a-zA-Z_][a-zA-Z0-9_]*"
      title="Function name (letters, numbers, underscore)"
    />
  );
}
