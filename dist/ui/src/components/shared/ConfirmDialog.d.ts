interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
    onCancel: () => void;
}
export default function ConfirmDialog({ isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel }: ConfirmDialogProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=ConfirmDialog.d.ts.map