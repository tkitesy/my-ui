import * as React from 'react';
import { useMeasure } from '../../utils';
import { ColumnKey } from './interfaces';

export interface MeasureCellProps {
  colKey: ColumnKey;
  onColumnResize: (key: ColumnKey, width: number) => void;
}

export function MeasureCell({ colKey, onColumnResize }: MeasureCellProps) {
  const cellRef = React.useRef<HTMLDivElement>(null);
  const [width, _] = useMeasure(cellRef);

  React.useMemo(() => {
    onColumnResize(colKey, width);
  }, [colKey, width, onColumnResize]);

  return (
    <div ref={cellRef} style={{ height: 0 }}>
      {' '}
    </div>
  );
}
