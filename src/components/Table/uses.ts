import * as React from 'react';
import { ColumnType } from './interfaces';

export type Updater<State> = (prev: State) => State;

export function useLayoutState<T>(defaultState: T) {
  const stateRef = React.useRef(defaultState);
  const [_, forceUpdate] = React.useState({});

  const lastPromiseRef = React.useRef<Promise<void> | null>(null);
  const batchedUpdaterRef = React.useRef<Updater<T>[]>([]);

  const updateState = React.useCallback((updater: Updater<T>) => {
    batchedUpdaterRef.current.push(updater);
    const promise = Promise.resolve();
    lastPromiseRef.current = promise;

    promise.then(() => {
      if (promise === lastPromiseRef.current) {
        lastPromiseRef.current = null;
        const prevState = stateRef.current;
        batchedUpdaterRef.current.forEach((updater) => {
          stateRef.current = updater(stateRef.current);
        });
        batchedUpdaterRef.current = [];
        if (prevState !== stateRef.current) {
          forceUpdate({});
        }
      }
    });
  }, []);

  React.useEffect(
    () => () => {
      lastPromiseRef.current = null;
    },
    [],
  );

  return [stateRef.current, updateState] as const;
}

export function useFixedInfo(
  columns: ColumnType[],
  widths: number[],
  windowSize: number,
  contentSize: number,
  offset: number,
) {
  const stickyInfo = React.useMemo(() => {
    const len = columns.length;
    let left = 0;
    let right = 0;
    const stickyInfo = {
      left: new Array<number>(len).fill(-1),
      right: new Array<number>(len).fill(-1),
    };
    columns.forEach((leftCol, start) => {
      const end = len - start - 1;
      const rightCol = columns[end];
      if (leftCol.fixed === 'left' || leftCol.fixed === true) {
        stickyInfo.left[start] = left;
        left += widths[start];
      }
      if (rightCol.fixed === 'right' || rightCol.fixed === true) {
        stickyInfo.right[end] = right;
        right += widths[end];
      }
    });
    return stickyInfo;
  }, [widths, columns]);

  const fixedIndex = React.useMemo(() => {
    const len = columns.length;
    let leftFixedSize = 0;
    let offsetLeft = offset;
    const leftFixedIndexStack: number[] = [];
    for (let start = 0; start < len; start++) {
      const leftCol = columns[start];
      if (leftCol.fixed === 'left' || leftCol.fixed === true) {
        if (offsetLeft > leftFixedSize) {
          leftFixedIndexStack.unshift(start);
          offsetLeft += widths[start];
        }else {
          break;
        }
      }
      leftFixedSize += widths[start];
    }
    let rightFixedSize = 0;
    let offsetRight = contentSize - (windowSize + offset);
    
    const rightFixedIndexStack: number[] = [];
    for (let end = len - 1; end > -1; end--) {
      const rightCol = columns[end];
      if (rightCol.fixed === 'right' || rightCol.fixed === true) {
        if (offsetRight > rightFixedSize) {
          rightFixedIndexStack.unshift(end);
          offsetRight += widths[end];
        }else {
          break;
        }
      }
      rightFixedSize += widths[end];
    }

    return {
      left: leftFixedIndexStack,
      right: rightFixedIndexStack,
    };
  }, [contentSize, windowSize, offset]);

  return [stickyInfo, fixedIndex];
}
