import { Column, ColumnKey } from './interfaces';
const InnerKey = "__my_inner_key";

export function getColumnKeys(cols: Column[]) {
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
