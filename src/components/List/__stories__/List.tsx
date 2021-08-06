import * as React from "react";
import List from "..";

export default {
  title: "List",
};

const items = new Array(256).fill(0).map((_, i) => i);

export function BaseDemo() {
  return (
    <div style={{ height: "200px" }}>
      <List
        items={items}
        itemHeight={24}
        renderItem={(item) => <div>{item}</div>}
      />
    </div>
  );
}
