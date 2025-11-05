interface CanvasPreviewProps {
  exportJson: string;
}

export default function CanvasPreview({ exportJson }: CanvasPreviewProps) {
  return (
    <div className="canvas-preview">
      <div className="canvas-preview__header">
        Vorschau (wird beim Export ignoriert, id="preview")
      </div>
      <textarea
        id="preview"
        readOnly
        className="canvas-preview__area"
        value={exportJson}
        placeholder="Exportiere, um die JSON-Struktur hier zu sehen…"
      />
    </div>
  );
}
