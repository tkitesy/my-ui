import * as React from 'react';
import { ColGroup } from './ColGroup';
import { ColumnKey, TableProps } from './interfaces';
import { MeasureCell } from './MeasureCell';
import { useFixedInfo, useLayoutState } from './uses';
import './style.css';
import classNames from 'classnames';
import { useMeasure } from '../../utils';
import { THead } from './THead';
import { TBody } from './TBody';

export function Table<DataType>({ cols, data }: TableProps<DataType>) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const headRef = React.useRef<HTMLDivElement>(null);
  const [colsWidths, updateColsWidths] = useLayoutState(
    {} as Record<ColumnKey, number>,
  );
  const onColumnResize = React.useCallback(
    (colKey: ColumnKey, width: number) => {
      updateColsWidths((widths) => {
        return {
          ...widths,
          [colKey]: width,
        };
      });
    },
    [updateColsWidths],
  );

  const syncScrollLeft = React.useCallback((scrollLeft: number) => {
    if (headRef.current && headRef.current.scrollLeft !== scrollLeft) {
      headRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  const [size, setSize] = React.useState({
    offset: 0,
    contentSize: 0,
  });

  const onScroll = React.useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const scrollLeft = target.scrollLeft;
      syncScrollLeft(scrollLeft);
      setSize({
        offset: scrollLeft,
        contentSize: target.scrollWidth,
      });
    },
    [syncScrollLeft],
  );

  const headCols = cols;
  const headWidths = cols.map((col) => (col.key ? colsWidths[col.key] : 0));
  const [windowSize, _] = useMeasure(bodyRef);

  const [stickyInfo, fixedIndex] = useFixedInfo(
    headCols,
    headWidths,
    windowSize - 17,
    size.contentSize,
    size.offset,
  );

  const getFixedStyle = React.useCallback(
    (index: number) => {
      const style: React.CSSProperties = {};
      if (
        fixedIndex.left.indexOf(index) !== -1 &&
        stickyInfo.left[index] !== -1
      ) {
        style.position = 'sticky';
        style.left = stickyInfo.left[index] + 'px';
      }
      if (
        fixedIndex.right.indexOf(index) !== -1 &&
        stickyInfo.right[index] !== -1
      ) {
        style.position = 'sticky';
        style.right = stickyInfo.right[index] + 'px';
      }
      return style;
    },
    [stickyInfo, fixedIndex],
  );

  const getFixedClass = React.useCallback(
    (index: number) => {
      if (index === fixedIndex.left[0]) {
        return 'fixed-left-last';
      }
      if (index === fixedIndex.right[0]) {
        return 'fixed-right-last';
      }
      return '';
    },
    [fixedIndex],
  );

  return (
    <div className={classNames('my-table')}>
      <div ref={headRef} className='my-table-head-wrapper'>
        <TableComponent>
          <ColGroup cols={headCols} colWidths={headWidths} />
          <THead
            cols={cols}
            getFixedStyle={getFixedStyle}
            getFixedClass={getFixedClass}
          />
        </TableComponent>
      </div>
      <div ref={bodyRef} className='my-table-body-wrapper' onScroll={onScroll}>
        <TableComponent>
          <ColGroup
            cols={cols}
            colWidths={cols.map((col) => col.width || -1)}
          />
          <TBody
            data={data}
            cols={cols}
            getFixedClass={getFixedClass}
            getFixedStyle={getFixedStyle}
            onColumnResize={onColumnResize}
          />
        </TableComponent>
      </div>
    </div>
  );
}

const TableComponent: React.FC = ({ children }) => (
  <table style={{ tableLayout: 'fixed', width: '100%', height: '100%' }}>
    {children}
  </table>
);
