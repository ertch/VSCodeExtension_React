/**
 * Select_Actions - Action selector component
 *
 * Provides dropdown for selecting actions in tripple inputs (trigger-action-target).
 * Used by Input_TrippleList for selecting what action to perform.
 */
export default function Select_Actions(props: { id: string }) {
  return (
    <select name={props.id}>
      <option value="">-- Bitte Wählen --</option>
      <option value="open">Open</option>
      <option value="openOnly">open Only</option>
      <option value="close">Close</option>
      {/* <option value="setValue">Set Value to X</option> */}
      {/* <option value="trigger">Trigger X</option> */}
      <option value="all">All (in Gate)</option>
      <option value="disable">Disable</option>
    </select>
  );
}
