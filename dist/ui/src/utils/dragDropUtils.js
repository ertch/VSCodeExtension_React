"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRootDropIndicatorStyles = exports.getDropIndicatorStyles = exports.createDragDropHandlers = exports.computeNodeDropPos = void 0;
const treeOperations_1 = require("./treeOperations");
/**
 * Computes the drop position based on mouse position within the element
 */
const computeNodeDropPos = (e, canBeParent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const third = rect.height / 3;
    if (offsetY < third)
        return 'before';
    if (offsetY > 2 * third)
        return 'after';
    return canBeParent ? 'inside' : offsetY < rect.height / 2 ? 'before' : 'after';
};
exports.computeNodeDropPos = computeNodeDropPos;
/**
 * Creates drag and drop handlers for the component tree
 */
const createDragDropHandlers = (dragDropState, setDraggedId, setDropIndicator, onDrop, components) => {
    const handleDragStart = (e, id) => {
        setDraggedId(id);
        setDropIndicator(null);
        e.dataTransfer.effectAllowed = 'move';
        // Optional: eigenes Drag-Image vermeiden, damit die Karte sichtbar bleibt
        // e.dataTransfer.setDragImage(new Image(), 0, 0)
    };
    const handleNodeDragOver = (e, comp, canBeParent) => {
        if (!dragDropState.draggedId)
            return;
        e.preventDefault();
        e.stopPropagation();
        const pos = (0, exports.computeNodeDropPos)(e, canBeParent);
        const invalid = dragDropState.draggedId === comp.id ||
            (0, treeOperations_1.wouldCreateCycle)(components, dragDropState.draggedId, comp.id);
        e.dataTransfer.dropEffect = invalid ? 'none' : 'move';
        setDropIndicator({ targetId: comp.id, position: pos });
    };
    const handleRootDragOver = (e, listRef, componentsLength) => {
        if (!dragDropState.draggedId)
            return;
        if (!listRef.current)
            return;
        e.preventDefault();
        const rect = listRef.current.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const pos = offsetY < rect.height / 2 ? 'before' : 'after';
        e.dataTransfer.dropEffect = 'move';
        setDropIndicator({ targetId: 'ROOT', position: pos });
    };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragDropState.draggedId || !dragDropState.dropIndicator) {
            setDraggedId(null);
            setDropIndicator(null);
            return;
        }
        onDrop(dragDropState.draggedId, dragDropState.dropIndicator);
        setDraggedId(null);
        setDropIndicator(null);
    };
    const handleDragEnd = () => {
        setDraggedId(null);
        setDropIndicator(null);
    };
    return {
        handleDragStart,
        handleDragEnd,
        handleNodeDragOver,
        handleRootDragOver,
        handleDrop
    };
};
exports.createDragDropHandlers = createDragDropHandlers;
/**
 * Gets styling for drop indicators
 */
const getDropIndicatorStyles = (comp, dropIndicator, draggedId) => {
    const isBefore = (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === comp.id && dropIndicator.position === 'before';
    const isInside = (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === comp.id && dropIndicator.position === 'inside';
    const isAfter = (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === comp.id && dropIndicator.position === 'after';
    return {
        backgroundColor: isInside ? '#e3f2fd' : '#f8f9fa',
        opacity: draggedId === comp.id ? 0.5 : 1,
        boxShadow: [
            isBefore ? 'inset 0 3px 0 0 #1976d2' : '',
            isAfter ? 'inset 0 -3px 0 0 #1976d2' : '',
        ]
            .filter(Boolean)
            .join(', '),
    };
};
exports.getDropIndicatorStyles = getDropIndicatorStyles;
/**
 * Gets styling for root drop area
 */
const getRootDropIndicatorStyles = (dropIndicator, componentsLength) => {
    return {
        boxShadow: (dropIndicator === null || dropIndicator === void 0 ? void 0 : dropIndicator.targetId) === 'ROOT'
            ? dropIndicator.position === 'before'
                ? 'inset 0 3px 0 0 #1976d2'
                : 'inset 0 -3px 0 0 #1976d2'
            : undefined,
    };
};
exports.getRootDropIndicatorStyles = getRootDropIndicatorStyles;
