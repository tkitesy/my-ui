import * as React from 'react';

export type ColumnKey = string | number;
export type RowKey = string | number;

export interface Column<DataType = unknown> {
  key?: ColumnKey;
  width?: number | string;
  title?: React.ReactNode;
  dataIndex?: keyof DataType;
  renderHeader?(): React.ReactNode;
  render?(data: DataType): React.ReactNode;
  sortable?: boolean;
  visible?: boolean;
  filterable?: boolean;
}

export interface TableProps<DataType = unknown> {
  rowKey?: keyof DataType | ((row: DataType) => RowKey);
  data?: DataType[];
  cols: Column<DataType>;
}
