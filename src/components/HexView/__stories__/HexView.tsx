import * as React from "react";
import { HexView } from "..";

export default {
  title: "HexView",
};

const bytes = new Uint8Array(new Array(256).fill(0).map((_, i) => i));

export function BaseDemo() {
  return <HexView bytes={bytes.buffer} />;
}
