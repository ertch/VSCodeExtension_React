interface CanvasToolbarProps {
  onExport: () => void;
  onClear: () => void;
}

export default function CanvasToolbar({ onExport, onClear }: CanvasToolbarProps) {
  return (
    <div className="canvas-toolbar">
      <button
        type="submit"
        className="canvas-btn canvas-btn--primary"
        onClick={onExport}
      >
        JSON exportieren
      </button>
      <button
        type="button"
        className="canvas-btn canvas-btn--secondary"
        onClick={onClear}
      >
        Aktuellen Tab leeren
      </button>
    </div>
  );
}
