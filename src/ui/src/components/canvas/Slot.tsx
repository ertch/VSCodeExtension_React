interface SlotProps {
  children?: React.ReactNode;
  isEmpty?: boolean;
  innerRef?: React.RefObject<HTMLDivElement>;
}

export function Slot({ children, isEmpty, innerRef }: SlotProps) {
  return (
    <div
      ref={innerRef}
      className={`canvas-children-column ${isEmpty ? '' : 'has-children'}`}
    >
      {isEmpty ? (
        <div className="canvas-children-empty">
          Drop hier hinein...
        </div>
      ) : (
        children
      )}
    </div>
  );
}
