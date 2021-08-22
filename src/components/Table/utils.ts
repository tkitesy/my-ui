import { ColumnType, ColumnKey } from './interfaces';
const InnerKey = "__inner_key";

export function getColumnKeys<DataType>(cols: ColumnType<DataType>[]) {
  const keys = new Set<ColumnKey>();
  cols.forEach((column) => {
    let { key = InnerKey } = column;
    while (keys.has(key)) {
        key = `${key}_next`;
    }
    keys.add(key);
  });
  return Array.from(keys);
}
