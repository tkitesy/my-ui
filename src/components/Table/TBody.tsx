import * as React from 'react';
import { ColumnKey, ColumnType } from './interfaces';
import { MeasureCell } from './MeasureCell';

interface TBodyProps {
  cols: ColumnType[];
  getFixedStyle: (index: number) => React.CSSProperties;
  getFixedClass: (index: number) => string;
  data?: unknown[];
  onColumnResize: (colKey: ColumnKey, width: number) => void;
}

export function TBody({
  cols,
  getFixedStyle,
  getFixedClass,
  onColumnResize,
  data,
}: TBodyProps) {
  return (
    <tbody>
      <tr>
        {cols.map((col, index) => (
          <td
            key={col.key ?? index}
            style={getFixedStyle(index)}
            className={getFixedClass(index)}
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
                style={getFixedStyle(index)}
                className={getFixedClass(index)}
              >
                <DataCell data={row} col={col} index={index} />
              </td>
            ))}
          </tr>
        ))}
    </tbody>
  );
}

interface DataCellProps {
  col: ColumnType;
  data: any;
  index: number;
}

function DataCell({ col, data }: DataCellProps) {
  return <div> {col.dataIndex ? data[col.dataIndex] : ''}</div>;
}
