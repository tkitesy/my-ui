import * as React from 'react';
import { ColumnType } from './interfaces';

export function ColGroup({
  cols,
  colWidths,
}: {
  cols: ColumnType[];
  colWidths: (number | string)[];
}) {
  return (
    <colgroup>
      {cols.map((col, index) => (
        <col key={col.key ?? index} style={{ width: colWidths[index] }} />
      ))}
    </colgroup>
  );
}
