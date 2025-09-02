import * as React from 'react'
import { Component, DropPos, DropIndicator, DropTargetId, wouldCreateCycle } from './treeOperations'

export interface DragDropState {
  draggedId: string | null
  dropIndicator: DropIndicator | null
}

export interface DragDropHandlers {
  handleDragStart: (e: React.DragEvent, id: string) => void
  handleDragEnd: () => void
  handleNodeDragOver: (e: React.DragEvent, comp: Component, canBeParent: boolean) => void
  handleRootDragOver: (e: React.DragEvent, listRef: React.RefObject<HTMLDivElement | null>, componentsLength: number) => void
  handleDrop: (e: React.DragEvent) => void
}

/**
 * Computes the drop position based on mouse position within the element
 */
export const computeNodeDropPos = (
  e: React.DragEvent,
  canBeParent: boolean
): DropPos => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const offsetY = e.clientY - rect.top
  const third = rect.height / 3
  if (offsetY < third) return 'before'
  if (offsetY > 2 * third) return 'after'
  return canBeParent ? 'inside' : offsetY < rect.height / 2 ? 'before' : 'after'
}

/**
 * Creates drag and drop handlers for the component tree
 */
export const createDragDropHandlers = (
  dragDropState: DragDropState,
  setDraggedId: (id: string | null) => void,
  setDropIndicator: (indicator: DropIndicator | null) => void,
  onDrop: (draggedId: string, dropIndicator: DropIndicator) => void,
  components: Component[]
): DragDropHandlers => {
  
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    setDropIndicator(null)
    e.dataTransfer.effectAllowed = 'move'
    // Optional: eigenes Drag-Image vermeiden, damit die Karte sichtbar bleibt
    // e.dataTransfer.setDragImage(new Image(), 0, 0)
  }

  const handleNodeDragOver = (e: React.DragEvent, comp: Component, canBeParent: boolean) => {
    if (!dragDropState.draggedId) return
    e.preventDefault()
    e.stopPropagation()

    const pos = computeNodeDropPos(e, canBeParent)

    const invalid =
      dragDropState.draggedId === comp.id || 
      wouldCreateCycle(components, dragDropState.draggedId, comp.id)

    e.dataTransfer.dropEffect = invalid ? 'none' : 'move'
    setDropIndicator({ targetId: comp.id, position: pos })
  }

  const handleRootDragOver = (
    e: React.DragEvent, 
    listRef: React.RefObject<HTMLDivElement | null>, 
    componentsLength: number
  ) => {
    if (!dragDropState.draggedId) return
    if (!listRef.current) return
    e.preventDefault()

    const rect = listRef.current.getBoundingClientRect()
    const offsetY = e.clientY - rect.top
    const pos: DropPos = offsetY < rect.height / 2 ? 'before' : 'after'
    e.dataTransfer.dropEffect = 'move'
    setDropIndicator({ targetId: 'ROOT', position: pos })
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!dragDropState.draggedId || !dragDropState.dropIndicator) {
      setDraggedId(null)
      setDropIndicator(null)
      return
    }
    
    onDrop(dragDropState.draggedId, dragDropState.dropIndicator)
    setDraggedId(null)
    setDropIndicator(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDropIndicator(null)
  }

  return {
    handleDragStart,
    handleDragEnd,
    handleNodeDragOver,
    handleRootDragOver,
    handleDrop
  }
}

/**
 * Gets styling for drop indicators
 */
export const getDropIndicatorStyles = (
  comp: Component,
  dropIndicator: DropIndicator | null,
  draggedId: string | null
) => {
  const isBefore = dropIndicator?.targetId === comp.id && dropIndicator.position === 'before'
  const isInside = dropIndicator?.targetId === comp.id && dropIndicator.position === 'inside'
  const isAfter = dropIndicator?.targetId === comp.id && dropIndicator.position === 'after'

  return {
    backgroundColor: isInside ? '#e3f2fd' : '#f8f9fa',
    opacity: draggedId === comp.id ? 0.5 : 1,
    boxShadow: [
      isBefore ? 'inset 0 3px 0 0 #1976d2' : '',
      isAfter ? 'inset 0 -3px 0 0 #1976d2' : '',
    ]
      .filter(Boolean)
      .join(', '),
  }
}

/**
 * Gets styling for root drop area
 */
export const getRootDropIndicatorStyles = (
  dropIndicator: DropIndicator | null,
  componentsLength: number
) => {
  return {
    boxShadow:
      dropIndicator?.targetId === 'ROOT'
        ? dropIndicator.position === 'before'
          ? 'inset 0 3px 0 0 #1976d2'
          : 'inset 0 -3px 0 0 #1976d2'
        : undefined,
  }
}