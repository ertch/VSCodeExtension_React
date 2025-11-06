import { forwardRef } from 'react';

interface SlotProps {
  children?: React.ReactNode;
  isEmpty?: boolean;
}

export const Slot = forwardRef<HTMLDivElement, SlotProps>(
  ({ children, isEmpty }, ref) => {
    return (
      <div
        ref={ref}
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
);

Slot.displayName = 'Slot';
