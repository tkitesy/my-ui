import * as React from 'react';
import List from '../List';
import { FlattenTreeNode, NodeKey, TreeProps } from './interfaces';
import { useExpanded, useSelection } from './uses';
export function Tree<NodeType = unknown>({
  rootNodes,
  getChildren,
  getKey,
  getLabel,
  getIcon,
  getCheckable,
  defaultExpand: expand = false,
}: TreeProps<NodeType>) {
  // 树节点预处理
  const treeRootNodes = React.useMemo(() => {
    function traverse(
      node: NodeType,
      parent: FlattenTreeNode<NodeType> | null,
      level: number,
      position: number[],
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
        label,
      };
      const children = getChildren(node);
      if (children) {
        flattenNode.children = children.map((child, i) =>
          traverse(child, flattenNode, level + 1, [...position, i]),
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

  const { isSelected, unselect, select, selectShifted } = useSelection(
    finalTreeNodes,
  );

  const handleNodeClick = React.useCallback(
    (key: NodeKey, e: React.MouseEvent) => {
      const left = e.button === 0;
      if (left) {
        // const ctrl = e.ctrlKey;
        const shift = e.shiftKey;
        const selected = isSelected(key);
        if (shift) {
          selectShifted(key);
          e.preventDefault();
          return;
        }

        if (selected) {
          unselect(key);
        } else {
          select(key);
        }
      }
    },
    [isSelected, unselect, select, selectShifted],
  );

  return (
    <List
      itemHeight={24}
      items={finalTreeNodes}
      renderItem={(node) => {
        const { key, label, isLeaf, level } = node;
        const expanded = isExpanded(key);
        const selected = isSelected(key);
        return (
          <div key={key} id={key + ''}>
            <Indent level={level} />
            <Switcher
              isLeaf={isLeaf}
              onOpen={open}
              onClose={fold}
              expanded={expanded}
              nodeKey={key}
            />
            <span
              onMouseDown={(e: React.MouseEvent) => handleNodeClick(key, e)}
              style={{ background: selected ? 'red' : 'white' }}
            >
              {label}
            </span>
          </div>
        );
      }}
    />
  );
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
  isLeaf,
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
