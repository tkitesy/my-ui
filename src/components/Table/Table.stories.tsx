import * as React from 'react';
import { Table } from './Table';

export default {
  title: 'Table Demo',
};

const cols = [
  { title: '名字', key: 'name', dataIndex: 'name', width: 80, fixed: true },
  { title: '年龄', key: 'age', dataIndex: 'age', width: 40, fixed: true },
  { title: '性别', key: 'gender', dataIndex: 'gender', width: 40 },
  { title: '地址', key: 'address', dataIndex: 'address', width: 180 },
  { title: '地址1', key: 'address1', dataIndex: 'address', width: 180 },
  {
    title: '地址2',
    key: 'address2',
    dataIndex: 'address',
    width: 180,
    fixed: true,
  },
  { title: '地址3', key: 'address3', dataIndex: 'address', width: 180 },
  {
    title: '地址4',
    key: 'address4',
    dataIndex: 'address',
    width: 180,
    fixed: true,
  },
];

const data = new Array(10).fill(null).map((_, i) => {
  return {
    name: `name ${i}`,
    age: i % 50,
    gender: i % 2,
    address: `address ${i}`,
  };
});

export function BaseDemo() {
  return (
    <div style={{ height: '300px', width: '600px' }}>
      <Table cols={cols} data={data} />
    </div>
  );
}
