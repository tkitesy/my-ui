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
        stickyInfo.right[start] = right;
        right += widths[start];
      }
    });
    return stickyInfo;
  }, [widths, columns]);

  const fixedIndex = React.useMemo(() => {
    const offsetLeft = offset;
    const len = columns.length;
    let leftFixedSize = 0;
    const leftFixedIndexStack: number[] = [];
    for (let start = 0; start < len; start++) {
      const leftCol = columns[start];
      if (leftCol.fixed === 'left' || leftCol.fixed === true) {
        if (offsetLeft >= leftFixedSize) {
          leftFixedIndexStack.push(start);
        }else {
          break;
        }
      }
      leftFixedSize += widths[start];
    }
    let rightFixedSize = 0;
    const rightFixedIndexStack: number[] = [];
    const offsetRight = contentSize - (windowSize + offsetLeft);
    for (let end = len - 1; end > -1; end--) {
      const rightCol = columns[end];
      if (rightCol.fixed === 'right' || rightCol.fixed === true) {
        if (offsetRight >= rightFixedSize) {
          rightFixedSize += widths[end];
        }else {
          break;
        }
      }
      rightFixedIndexStack.push(end);
    }

    return {
      left: leftFixedIndexStack,
      right: rightFixedIndexStack,
    };
  }, []);

  return [stickyInfo, fixedIndex];
}
