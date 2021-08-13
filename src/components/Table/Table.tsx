import * as React from 'react';
import { TableProps } from './interfaces';

export function Table<DataType>({}: TableProps<DataType>) {
  
  
  return (
    <div>
      <div>
        <table>
          <thead>
            <tr></tr>
          </thead>
        </table>
      </div>
      <div>
        <table></table>
      </div>
    </div>
  );
}

function Colgroup() {
  return <colgroup></colgroup>;
}
