import * as React from 'react';
import { FlattenTreeNode, NodeKey } from './interfaces';

export function useExpanded(
  treeRootNodes: FlattenTreeNode[],
  expandLevel: number,
) {
  const [allKeys, defaultExpandedKeys] = React.useMemo(() => {
    const allKeys: NodeKey[] = [];
    const defaultExpandedKeys: NodeKey[] = [];
    function traverse(node: FlattenTreeNode) {
      const { children, key, level, isLeaf } = node;
      if (!isLeaf) {
        return;
      }
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
    defaultExpandedKeys,
  );

  const isExpanded = React.useCallback(
    (key: NodeKey) => expandedKeys.indexOf(key) !== -1,
    [expandedKeys],
  );

  const open = React.useCallback(
    (key: NodeKey) => setExpandedKeys((old) => [...old, key]),
    [],
  );

  const fold = React.useCallback(
    (key: NodeKey) => setExpandedKeys((old) => old.filter((k) => key !== k)),
    [],
  );

  const foldAll = React.useCallback(() => setExpandedKeys(allKeys), [allKeys]);

  return {
    open,
    fold,
    isExpanded,
    foldAll,
    setExpandedKeys,
  };
}

export function useSelection(treeNodes: FlattenTreeNode[]) {
  const [selectedKeys, setSelectedKeys] = React.useState<NodeKey[]>([]);
  const lastSelectedKey = React.useRef<NodeKey | null>(null);

  const isSelected = React.useCallback(
    (key: NodeKey) => selectedKeys.indexOf(key) !== -1,
    [selectedKeys],
  );

  const select = React.useCallback(
    (key: NodeKey) => {
      setSelectedKeys((old) => [...old, key]);
      lastSelectedKey.current = key;
    },
    [setSelectedKeys],
  );

  const unselect = React.useCallback(
    (key: NodeKey) => setSelectedKeys((old) => old.filter((k) => key !== k)),
    [setSelectedKeys],
  );

  const selectAll = React.useCallback(
    () => setSelectedKeys(() => treeNodes.map((node) => node.key)),
    [treeNodes, setSelectedKeys],
  );

  const unselectAll = React.useCallback(() => setSelectedKeys([]), [
    setSelectedKeys,
  ]);

  const selectShifted = React.useCallback(
    (key: NodeKey) => {
      const startIndex =
        lastSelectedKey.current === null
          ? -1
          : treeNodes.findIndex((node) => node.key === lastSelectedKey.current);

      if (startIndex < 0) {
        setSelectedKeys(() => [key]);
      }
      const endIndex = treeNodes.findIndex((node) => node.key === key);
      if (endIndex < 0) {
        return;
      }

      setSelectedKeys(() =>
        treeNodes
          .slice(
            Math.min(startIndex, endIndex),
            Math.max(startIndex, endIndex) + 1,
          )
          .map((node) => node.key),
      );
    },
    [treeNodes, setSelectedKeys, lastSelectedKey],
  );

  return {
    select,
    unselect,
    selectAll,
    unselectAll,
    selectShifted,
    isSelected,
    setSelectedKeys,
  };
}

export function useCheck(treeNodesMap: Map<NodeKey, FlattenTreeNode>) {
  const [checkedKeys, setCheckedKeys] = React.useState<NodeKey[]>([]);

  const isChecked = React.useCallback(
    (key: NodeKey) => checkedKeys.indexOf(key) !== -1,
    [checkedKeys],
  );

  const check = React.useCallback(
    (key: NodeKey) => {
      const node = treeNodesMap.get(key);
      if (!node) return;
    },
    [treeNodesMap],
  );

  return {
    isChecked,
    check,
  };
}
