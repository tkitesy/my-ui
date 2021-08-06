import * as React from 'react';

type NodeKey = string | number;

interface TreeProps<NodeType = unknown> {
  rootNodes: NodeType[];
  getChildren: (node: NodeType) => NodeType[] | null | undefined;
  getLabel: (node: NodeType) => React.ReactNode;
  getKey?: (node: NodeType) => NodeKey;
  getIcon?: (node: NodeType) => React.ReactNode;
  getCheckable?: (node: NodeType) => boolean;
  expand?: boolean | number;
}

interface FlattenTreeNode<NodeType = unknown> {
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

export function Tree<NodeType = unknown>({
  rootNodes,
  getChildren,
  getKey,
  getLabel,
  getIcon,
  getCheckable,
  expand = false
}: TreeProps<NodeType>) {
  // 树节点预处理
  const treeRootNodes = React.useMemo(() => {
    function traverse(
      node: NodeType,
      parent: FlattenTreeNode<NodeType> | null,
      level: number,
      position: number[]
    ) {
      const key = getKey ? getKey(node) : position.join('-');
      const label = getLabel(node);
      const icon = getIcon ? getIcon(node) : null;
      const checkable = getCheckable ? getCheckable(node) : true;
      const flattenNode: FlattenTreeNode<NodeType> = {
        children: [],
        parent,
        key,
        level,
        isLeaf: false,
        position,
        data: node,
        checkable,
        icon,
        label
      };
      const children = getChildren(node);
      if (children) {
        flattenNode.children = children.map((child, i) =>
          traverse(child, flattenNode, level + 1, [...position, i])
        );
      } else {
        flattenNode.isLeaf = true;
      }
      return flattenNode;
    }

    return rootNodes.map((node, i) => traverse(node, null, 0, [i]));
  }, [rootNodes, getChildren, getKey, getIcon, getCheckable, getLabel]);

  const expandLevel =
    expand === true
      ? Number.POSITIVE_INFINITY
      : typeof expand === 'number'
      ? expand
      : -1;
  const { isExpanded, open, fold } = useExpanded(treeRootNodes, expandLevel);

  // 最终显示的树节点
  const finalTreeNodes = React.useMemo(() => {
    const treeNodes: FlattenTreeNode[] = [];

    function traverse(node: FlattenTreeNode) {
      treeNodes.push(node);
      const { children, key } = node;
      const expanded = isExpanded(key);
      if (expanded) {
        children.forEach((child) => traverse(child));
      }
    }
    treeRootNodes.forEach((node) => traverse(node));
    return treeNodes;
  }, [treeRootNodes, isExpanded]);

  return (
    <div>
      {finalTreeNodes.map((node) => (
        <div key={node.key} id={node.key + ''}>
          <Indent level={node.level} />
          <Switcher
            isLeaf={node.isLeaf}
            onOpen={open}
            onClose={fold}
            expanded={isExpanded(node.key)}
            nodeKey={node.key}
          />
          <span>{node.label}</span>
        </div>
      ))}
    </div>
  );
}

function useExpanded(treeRootNodes: FlattenTreeNode[], expandLevel: number) {
  const [allKeys, defaultExpandedKeys] = React.useMemo(() => {
    const allKeys: NodeKey[] = [];
    const defaultExpandedKeys: NodeKey[] = [];
    function traverse(node: FlattenTreeNode) {
      const { children, key, level } = node;
      if (level < expandLevel) {
        defaultExpandedKeys.push(key);
      }
      allKeys.push(key);
      if (children) {
        children.forEach((child) => traverse(child));
      }
    }
    treeRootNodes.forEach((node) => traverse(node));
    return [allKeys, defaultExpandedKeys];
  }, [treeRootNodes]);

  const [expandedKeys, setExpandedKeys] = React.useState<NodeKey[]>(
    defaultExpandedKeys
  );

  const isExpanded = React.useCallback(
    (key: NodeKey) => expandedKeys.indexOf(key) !== -1,
    [expandedKeys]
  );

  const open = React.useCallback(
    (key: NodeKey) => setExpandedKeys((old) => [...old, key]),
    []
  );

  const fold = React.useCallback(
    (key: NodeKey) => setExpandedKeys((old) => old.filter((k) => key !== k)),
    []
  );

  const foldAll = React.useCallback(() => setExpandedKeys(allKeys), [allKeys]);

  return {
    open,
    fold,
    isExpanded,
    foldAll,
    setExpandedKeys
  };
}

function Indent({ level }: { level: number }) {
  return (
    <span>
      {new Array(level).fill(0).map((_, i) => (
        <span key={i} style={{ padding: `4px` }}>
          {' '}
        </span>
      ))}
    </span>
  );
}

function Switcher({
  expanded,
  onOpen,
  onClose,
  nodeKey,
  isLeaf
}: {
  expanded: boolean;
  nodeKey: NodeKey;
  isLeaf: boolean;
  onOpen: (key: NodeKey) => void;
  onClose: (key: NodeKey) => void;
}) {
  return !isLeaf ? (
    <span onClick={() => (expanded ? onClose(nodeKey) : onOpen(nodeKey))}>
      {expanded ? '-' : '+'}
    </span>
  ) : (
    <span> </span>
  );
}
