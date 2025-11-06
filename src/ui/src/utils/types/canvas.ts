// types/canvas.ts
import { ReactNode } from 'react';
import { PaletteEntry } from './palette';

export interface TreeNode {
  id: string;
  type: string;
  canHaveChildren: boolean;
  props: Record<string, unknown>;
  children: TreeNode[];
}

export interface CanvasProps {
  palette?: PaletteEntry[];
  initialNodes?: TreeNode[];
}

export interface RootDropAreaProps {
  tree: TreeNode[];
  renderNode: (node: TreeNode) => ReactNode;
  uniqueContextId: symbol;
}

export interface SidebarProps {
  palette: PaletteEntry[];
  onAddClick: (type: string) => void;
  uniqueContextId: symbol;
}

export interface PaletteButtonProps {
  entry: PaletteEntry;
  onAddClick: (type: string) => void;
  uniqueContextId: symbol;
}

export interface NodeWrapperProps {
  node: TreeNode;
  meta: PaletteEntry;
  onDelete: (id: string) => void;
  uniqueContextId: symbol;
  children?: ReactNode;
}

export type DropPayload =
  | { kind: 'NEW'; type: string; contextId: symbol }
  | { kind: 'MOVE'; nodeId: string; contextId: symbol };

export interface PerformDropParams {
  dropTargetId: string | null;
  zone: string;
  payload: DropPayload;
}
