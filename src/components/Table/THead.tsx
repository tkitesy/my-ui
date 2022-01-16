import * as React from 'react';
import { ColumnType } from './interfaces';

interface THeadProps {
  cols: ColumnType[];
  getFixedStyle: (index: number) => React.CSSProperties;
  getFixedClass: (index: number) => string;
}

export function THead({ cols, getFixedStyle, getFixedClass }: THeadProps) {
  return (
    <thead>
      <tr>
        {cols.map((col, index) => (
          <td style={getFixedStyle(index)} className={getFixedClass(index)}>
            <HeadCell col={col} index={index} />
          </td>
        ))}
        <td />
      </tr>
    </thead>
  );
}

interface HeadCellProps {
  col: ColumnType;
  index: number;
}

function HeadCell({ col, index }: HeadCellProps) {
  return <div>{col.title}</div>;
}
