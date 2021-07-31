import * as React from "react";

type ItemRenderer<ItemType> = (item: ItemType) => React.ReactNode;

interface ListProps<ItemType = unknown> {
  items: ItemType[];
  renderItem: ItemRenderer<ItemType>;
  itemHeight: number;
}

function calculateRange(
  scrollTop: number,
  itemHeight: number,
  containerHeight: number
) {
  const start = Math.floor(scrollTop / itemHeight);
  const end = Math.ceil((scrollTop + containerHeight) / itemHeight);
  return [start, end];
}

export function List<ItemType>({
  items,
  renderItem,
  itemHeight,
}: ListProps<ItemType>) {
  const root = React.useRef<HTMLDivElement>();
  const [, height] = useMeasure(root);
  const [range, setRange] = React.useState([-1, -1]);

  const onScroll = React.useCallback(
    (e: any) => {
      const scrollTop = e.target.scrollTop;
      const range = calculateRange(scrollTop, itemHeight, height);
      setRange(range);
    },

    [itemHeight, height]
  );

  React.useEffect(() => {
    if (root.current) {
      const scrollTop = root.current.scrollTop;
      const range = calculateRange(scrollTop, itemHeight, height);
      setRange(range);
    }
  }, [root.current, height, itemHeight]);

  return (
    <div
      className="list list-container"
      style={{ height: "100%", overflowY: "auto" }}
      ref={root}
      onScroll={onScroll}
    >
      <div
        className="list-content"
        style={{ height: `${items.length * itemHeight}px` }}
      >
        <div
          className="list-items-wrapper"
          style={{ transform: `translateY(${range[0] * itemHeight}px)` }}
        >
          {items.slice(...range).map((item, i) => (
            <div
              className="list-item"
              key={i}
              style={{ height: `${itemHeight}px`, overflowY: "hidden" }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function useMeasure(root: React.MutableRefObject<HTMLElement>) {
  const [size, setSize] = React.useState([0, 0]);

  const observer = React.useMemo(
    () =>
      new ResizeObserver((entry) => {
        const { width, height } = entry[0].target.getBoundingClientRect();
        setSize([width, height]);
      }),
    [setSize]
  );

  React.useEffect(() => {
    if (root.current) {
      observer.observe(root.current);
      return () => observer.disconnect();
    }
    return () => {};
  }, [root.current]);

  return size;
}
