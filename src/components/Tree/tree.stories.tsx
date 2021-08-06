import * as React from 'react';
import { Tree } from '.';
import data from './data.json';


export default {
  title: 'Tree'
};

interface Area {
    code: string,
    level: 1,
    name: string,
    areaList?: Array<Area>
}

export function BaseDemo() {
  return (
    <Tree
      rootNodes={data as Area[]}
      getChildren={(data) => data.areaList}
      getLabel={(data) => data.name}
      expand={0}
    />
  );
}
