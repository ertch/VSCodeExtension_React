/**
 * Input_TrippleSingle - Triple value input (comma-separated)
 *
 * Used for attributes that require three related values (e.g., trigger-action-target).
 * Format: "value1, value2, value3"
 */
export default function Input_TrippleSingle({ name }: { name: string }) {
  return (
    <input
      type="text"
      name={name}
      className="input-text"
      placeholder="trigger, action, target"
      title="Format: trigger, action, target (comma-separated)"
    />
  );
}
