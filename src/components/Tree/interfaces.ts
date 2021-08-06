import * as React from 'react';
export type NodeKey = string | number;

export interface TreeProps<NodeType = unknown> {
  rootNodes: NodeType[];
  getChildren: (node: NodeType) => NodeType[] | null | undefined;
  getLabel: (node: NodeType) => React.ReactNode;
  getKey?: (node: NodeType) => NodeKey;
  getIcon?: (node: NodeType) => React.ReactNode;
  getCheckable?: (node: NodeType) => boolean;
  defaultExpand?: boolean | number;
}

export interface FlattenTreeNode<NodeType = unknown> {
  children: FlattenTreeNode[];
  parent: FlattenTreeNode | null;
  key: NodeKey;
  data: NodeType;
  level: number;
  isLeaf: boolean;
  position: number[];
  checkable: boolean;
  icon: React.ReactNode;
  label: React.ReactNode;
}