"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ConfirmDialog;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function ConfirmDialog({ isOpen, title, message, confirmText = 'Bestätigen', cancelText = 'Abbrechen', type = 'warning', onConfirm, onCancel }) {
    const dialogRef = (0, react_1.useRef)(null);
    const confirmButtonRef = (0, react_1.useRef)(null);
    // Focus trap and Escape key handler
    (0, react_1.useEffect)(() => {
        if (!isOpen)
            return;
        // Focus confirm button when dialog opens
        confirmButtonRef.current?.focus();
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onCancel();
            }
            // Tab focus trap
            if (e.key === 'Tab') {
                const dialog = dialogRef.current;
                if (!dialog)
                    return;
                const focusableElements = dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusableElements.length === 0)
                    return;
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                if (e.shiftKey) {
                    // Shift+Tab: moving backwards
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                }
                else {
                    // Tab: moving forwards
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onCancel]);
    if (!isOpen)
        return null;
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "confirm-dialog-backdrop", onClick: onCancel }), (0, jsx_runtime_1.jsxs)("div", { className: "confirm-dialog", ref: dialogRef, role: "dialog", "aria-modal": "true", "aria-labelledby": "dialog-title", children: [(0, jsx_runtime_1.jsx)("div", { className: "confirm-dialog__header", children: (0, jsx_runtime_1.jsx)("h3", { id: "dialog-title", className: "confirm-dialog__title", children: title }) }), (0, jsx_runtime_1.jsx)("div", { className: "confirm-dialog__body", children: (0, jsx_runtime_1.jsx)("p", { className: "confirm-dialog__message", children: message }) }), (0, jsx_runtime_1.jsxs)("div", { className: "confirm-dialog__footer", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: onCancel, className: "confirm-dialog__btn confirm-dialog__btn--cancel", children: cancelText }), (0, jsx_runtime_1.jsx)("button", { ref: confirmButtonRef, type: "button", onClick: onConfirm, className: `confirm-dialog__btn confirm-dialog__btn--${type}`, children: confirmText })] })] })] }));
}
//# sourceMappingURL=ConfirmDialog.js.map