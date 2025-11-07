// types/canvas.ts
import { ReactNode } from 'react';
import { PaletteEntry } from './palette';
import { EntityInputs } from '../generator/types'; // From Domain 1

/**
 * TreeNode with type-safe props (reuses EntityInputs from Domain 1)
 */
export interface TreeNode {
  id: string;
  type: string;
  canHaveChildren: boolean;
  props: EntityInputs;  // ✅ Domain 1 integration (instead of Record<string, unknown>)
  children: TreeNode[];
}

/**
 * Canvas Props
 */
export interface CanvasProps {
  palette?: PaletteEntry[];
  initialNodes?: TreeNode[];
}

/**
 * Root Drop Area Props
 */
export interface RootDropAreaProps {
  tree: TreeNode[];
  renderNode: (node: TreeNode) => ReactNode;
  uniqueContextId: symbol;
}

/**
 * Sidebar Props
 */
export interface SidebarProps {
  palette: PaletteEntry[];
  onAddClick: (type: string) => void;
  uniqueContextId: symbol;
}

/**
 * Palette Button Props
 */
export interface PaletteButtonProps {
  entry: PaletteEntry;
  onAddClick: (type: string) => void;
  uniqueContextId: symbol;
}

/**
 * Node Wrapper Props
 */
export interface NodeWrapperProps {
  node: TreeNode;
  meta: PaletteEntry;
  onDelete: (id: string) => void;
  uniqueContextId: symbol;
  children?: ReactNode;
}

/**
 * Discriminated Union for Drag & Drop Payload
 */
export type DropPayload =
  | { kind: 'NEW'; type: string; contextId: symbol }
  | { kind: 'MOVE'; nodeId: string; contextId: symbol };

/**
 * Perform Drop Parameters
 */
export interface PerformDropParams {
  dropTargetId: string | null;
  zone: string;
  payload: DropPayload;
}
