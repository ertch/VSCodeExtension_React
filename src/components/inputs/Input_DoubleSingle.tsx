/**
 * Input_DoubleSingle - Double value input (comma-separated pair)
 *
 * Used for attributes that require two related values (e.g., value-label pairs).
 * Format: "value, label" or "key, value"
 */
export default function Input_DoubleSingle({ name }: { name: string }) {
  return (
    <input
      type="text"
      name={name}
      className="input-text"
      placeholder="value, label"
      title="Format: value, label (comma-separated)"
    />
  );
}
