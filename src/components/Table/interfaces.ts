import * as React from 'react';

export type ColumnKey = string | number;
export type RowKey = string | number;

export interface ColumnType<DataType = unknown> {
  key?: ColumnKey;
  width?: number | string;
  title?: React.ReactNode;
  renderTitle?(): React.ReactNode;
  dataIndex?: string | number;
  render?(data: DataType): React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  fixed?: 'left' | 'right' | boolean;
}

export interface TableProps<DataType = unknown> {
  rowKey?: keyof DataType | ((row: DataType) => RowKey);
  data?: DataType[];
  cols: ColumnType<DataType>[];
}
