import * as React from 'react';
import { ColGroup } from './ColGroup';
import { ColumnKey, TableProps } from './interfaces';
import { MeasureCell } from './MeasureCell';
import { useFixedInfo, useLayoutState } from './uses';
import './style.css';
import classNames from 'classnames';
import { useMeasure } from '../../utils';

export function Table<DataType>({ cols, data }: TableProps<DataType>) {
  const bodyRef = React.useRef<HTMLDivElement>(null);
  const headRef = React.useRef<HTMLDivElement>(null);
  const [colsWidths, updateColsWidths] = useLayoutState(
    {} as Record<ColumnKey, number>,
  );
  const onColumnResize = React.useCallback(
    (colKey: ColumnKey, width: number) => {
      console.log(colKey, width);

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

  const headCols = [...cols, { key: '_INNER_SCROLLBAR' }];
  const headWidths = [
    ...cols.map((col) => (col.key ? colsWidths[col.key] : 0)),
    17,
  ];

  const [windowSize, _] = useMeasure(bodyRef);

  const [stickyInfo, fixedIndex] = useFixedInfo(
    headCols,
    headWidths,
    windowSize,
    size.contentSize,
    size.offset,
  );

  return (
    <div className={classNames('my-table')}>
      <div ref={headRef} className='my-table-head-wrapper'>
        <TableComponent>
          <ColGroup cols={headCols} colWidths={headWidths} />
          <thead>
            <tr>
              {cols.map((col, index) => (
                <td
                  style={
                    stickyInfo.left[index] > -1
                      ? {
                          position: 'sticky',
                          left: stickyInfo.left[index],
                          backgroundColor: '#fff',
                        }
                      : {}
                  }
                >
                  {col.title}
                </td>
              ))}
              <td />
            </tr>
          </thead>
        </TableComponent>
      </div>
      <div ref={bodyRef} className='my-table-body-wrapper' onScroll={onScroll}>
        <TableComponent>
          <ColGroup
            cols={cols}
            colWidths={cols.map((col) => col.width || -1)}
          />
          <tbody>
            <tr>
              {cols.map((col, index) => (
                <td
                  key={col.key ?? index}
                  style={
                    stickyInfo.left[index] > -1
                      ? {
                          position: 'sticky',
                          left: stickyInfo.left[index],
                          backgroundColor: '#fff',
                        }
                      : {}
                  }
                >
                  <MeasureCell
                    colKey={col.key ?? index}
                    onColumnResize={onColumnResize}
                  />
                </td>
              ))}
            </tr>
            {data &&
              data.map((row) => (
                <tr>
                  {cols.map((col, index) => (
                    <td
                      key={col.key ?? index}
                      style={
                        stickyInfo.left[index] > -1
                          ? {
                              position: 'sticky',
                              left: stickyInfo.left[index],
                              backgroundColor: '#fff',
                            }
                          : {}
                      }
                    >
                      {col.dataIndex ? row[col.dataIndex] : ''}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </TableComponent>
      </div>
    </div>
  );
}

const TableComponent: React.FC = ({ children }) => (
  <table style={{ tableLayout: 'fixed', width: '100%' }}>{children}</table>
);
