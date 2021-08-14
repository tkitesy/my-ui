import * as React from 'react';
import { useMaybeControlled } from '../../utils';
import {
  FlattenTreeNode,
  NodeKey,
  TreeNodeFilterFn,
  TreeProps,
} from './interfaces';

const Empty_Set = new Set<NodeKey>();

export function useExpanded(
  props: TreeProps,
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

  const [expandedKeys, setExpandedKeys] = useMaybeControlled(
    props,
    defaultExpandedKeys,
    'expandedKeys',
    'onExpandedKeysChange',
  );

  const isExpanded = React.useCallback(
    (key: NodeKey) => expandedKeys.indexOf(key) !== -1,
    [expandedKeys],
  );

  const open = React.useCallback(
    (key: NodeKey) => setExpandedKeys([...expandedKeys, key]),
    [expandedKeys],
  );

  const fold = React.useCallback(
    (key: NodeKey) => setExpandedKeys(expandedKeys.filter((k) => key !== k)),
    [expandedKeys],
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

export function useSelection(props: TreeProps, treeNodes: FlattenTreeNode[]) {
  const [selectedKeys, setSelectedKeys] = useMaybeControlled(
    props,
    [] as NodeKey[],
    'selectedKeys',
    'onSelectedKeysChange',
  );
  const lastSelectedKey = React.useRef<NodeKey | null>(null);

  const isSelected = React.useCallback(
    (key: NodeKey) => selectedKeys.indexOf(key) !== -1,
    [selectedKeys],
  );

  const select = React.useCallback(
    (key: NodeKey) => {
      setSelectedKeys([...selectedKeys, key]);
      lastSelectedKey.current = key;
    },
    [setSelectedKeys, selectedKeys],
  );

  const unselect = React.useCallback(
    (key: NodeKey) => setSelectedKeys(selectedKeys.filter((k) => key !== k)),
    [setSelectedKeys, selectedKeys],
  );

  const selectAll = React.useCallback(
    () => setSelectedKeys(treeNodes.map((node) => node.key)),
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
        setSelectedKeys([key]);
      }
      const endIndex = treeNodes.findIndex((node) => node.key === key);
      if (endIndex < 0) {
        return;
      }

      setSelectedKeys(
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

export function useCheck(
  props: TreeProps,
  treeNodesMap: Map<NodeKey, FlattenTreeNode>,
) {
  const [_checkedKeys, setCheckedKeys] = useMaybeControlled(
    props,
    [] as NodeKey[],
    'checkedKeys',
    'onExpandedKeysChange',
  );
  const [halfCheckedKeys, setHalfCheckedKeys] = React.useState(
    new Set<NodeKey>(),
  );

  const checkedKeys = React.useMemo(() => new Set(_checkedKeys), [
    _checkedKeys,
  ]);

  const isChecked = React.useCallback((key: NodeKey) => checkedKeys.has(key), [
    checkedKeys,
  ]);

  const isHalfChecked = React.useCallback(
    (key: NodeKey) => halfCheckedKeys.has(key),
    [halfCheckedKeys],
  );

  const check = React.useCallback(
    (key: NodeKey) => {
      const node = treeNodesMap.get(key);
      if (!node) return;
      const newCheckedKeys = new Set(checkedKeys);
      const newHalfCheckedKeys = new Set(halfCheckedKeys);
      // check all children
      function checkChildren(node: FlattenTreeNode) {
        newCheckedKeys.add(node.key);
        newHalfCheckedKeys.delete(node.key);
        node.children
          .filter((child) => child.checkable)
          .forEach((child) => checkChildren(child));
      }
      // check parent
      function checkParent(node: FlattenTreeNode) {
        const parent = node.parent;
        if (parent) {
          const allChildrenChecked = parent.children
            .filter((child) => child.checkable)
            .every((child) => newCheckedKeys.has(child.key));

          if (parent.checkable) {
            if (allChildrenChecked) {
              newCheckedKeys.add(parent.key);
              newHalfCheckedKeys.delete(parent.key);
            } else {
              const someChildrenChecked = parent.children
                .filter((child) => child.checkable)
                .some(
                  (child) =>
                    newCheckedKeys.has(child.key) ||
                    newHalfCheckedKeys.has(child.key),
                );
              if (someChildrenChecked) newHalfCheckedKeys.add(parent.key);
            }
          }

          checkParent(parent);
        }
      }
      checkChildren(node);
      checkParent(node);
      setCheckedKeys(Array.from(newCheckedKeys));
      setHalfCheckedKeys(newHalfCheckedKeys);
    },
    [
      treeNodesMap,
      setCheckedKeys,
      checkedKeys,
      setHalfCheckedKeys,
      halfCheckedKeys,
    ],
  );

  const uncheck = React.useCallback(
    (key: NodeKey) => {
      const node = treeNodesMap.get(key);
      if (!node) return;
      const newCheckedKeys = new Set(checkedKeys);
      const newHalfCheckedKeys = new Set(halfCheckedKeys);
      // uncheck all children
      function uncheckChildren(node: FlattenTreeNode) {
        newCheckedKeys.delete(node.key);
        newHalfCheckedKeys.delete(node.key);
        node.children
          .filter((child) => child.checkable)
          .forEach((child) => uncheckChildren(child));
      }

      function uncheckParent(node: FlattenTreeNode) {
        const parent = node.parent;
        if (parent) {
          if (parent.checkable) {
            newCheckedKeys.delete(parent.key);
            newHalfCheckedKeys.delete(parent.key);
            const someChildrenChecked = parent.children
              .filter((child) => child.checkable)
              .some(
                (child) =>
                  newCheckedKeys.has(child.key) ||
                  newHalfCheckedKeys.has(child.key),
              );
            if (someChildrenChecked) newHalfCheckedKeys.add(parent.key);
          }
          uncheckParent(parent);
        }
      }
      uncheckChildren(node);
      uncheckParent(node);
      setCheckedKeys(Array.from(newCheckedKeys));
      setHalfCheckedKeys(newHalfCheckedKeys);
    },
    [
      treeNodesMap,
      setCheckedKeys,
      checkedKeys,
      setHalfCheckedKeys,
      halfCheckedKeys,
    ],
  );

  const checkAll = React.useCallback(() => {
    setHalfCheckedKeys(Empty_Set);
    setCheckedKeys(Array.from(treeNodesMap.keys()));
  }, [setHalfCheckedKeys, setCheckedKeys]);

  const uncheckAll = React.useCallback(() => {
    setHalfCheckedKeys(Empty_Set);
    setCheckedKeys([]);
  }, [setCheckedKeys, setHalfCheckedKeys]);

  return {
    isChecked,
    check,
    checkAll,
    uncheckAll,
    uncheck,
    isHalfChecked,
  };
}

export function useFilter<NodeType = unknown>(
  treeRootNodes: FlattenTreeNode<NodeType>[],
) {
  const [remainKeys, setRemainKeys] = React.useState<Set<NodeKey>>(Empty_Set);
  const [filtering, setFiltering] = React.useState(false);
  const filter = React.useCallback(
    (fn: TreeNodeFilterFn<NodeType>) => {
      setFiltering(true);
      const newRemainKeys = new Set<NodeKey>();
      function traverse(node: FlattenTreeNode<NodeType>) {
        if (fn(node.data)) {
          newRemainKeys.add(node.key);
          while (true) {
            let parent = node.parent;
            if (parent && !newRemainKeys.has(parent.key)) {
              newRemainKeys.add(parent.key);
            } else {
              break;
            }
          }
        }
        node.children.forEach((child) => traverse(child));
      }
      treeRootNodes.forEach((node) => traverse(node));
      setRemainKeys(newRemainKeys);
    },
    [treeRootNodes, setRemainKeys, setFiltering],
  );

  const cancelFilter = React.useCallback(() => setFiltering(false), [
    setFiltering,
  ]);

  const isRemain = React.useCallback(
    (key: NodeKey) => !filtering || remainKeys.has(key),
    [remainKeys, filtering],
  );

  return {
    filter,
    isRemain,
    cancelFilter,
  };
}
