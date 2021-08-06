import * as React from 'react';

type ItemRenderer<ItemType> = (
  item: ItemType,
  index: number
) => React.ReactElement;

interface ListInstance {
  scrollTo(offset: number): void;
  scrollToIndex(index: number): void;
}

interface ListProps<ItemType = unknown> {
  items: ItemType[];
  renderItem: ItemRenderer<ItemType>;
  itemHeight: number;
  innerRef?: React.Ref<ListInstance>;
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

function List<ItemType>({
  items,
  renderItem,
  itemHeight,
  innerRef
}: ListProps<ItemType>) {
  const root = React.useRef<HTMLDivElement | null>(null);
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

  const scrollTo = React.useCallback(
    (offset: number) => {
      if (root.current) {
        root.current.scrollTo({ top: offset, behavior: 'auto' });
      }
    },
    [root.current]
  );

  const scrollToIndex = React.useCallback(
    (index: number) => {
      if (root.current) {
        const offset = itemHeight * index;
        root.current.scrollTo({ top: offset, behavior: 'auto' });
      }
    },
    [root.current, itemHeight]
  );

  React.useImperativeHandle(
    innerRef,
    () => ({
      scrollTo,
      scrollToIndex
    }),
    [scrollTo, scrollToIndex]
  );

  return (
    <div
      className='list list-container'
      style={{ height: '100%', overflowY: 'auto' }}
      ref={root}
      onScroll={onScroll}
    >
      <div
        className='list-content'
        style={{
          height: `${items.length * itemHeight}px`,
          position: 'relative'
        }}
      >
        {items.slice(...range).map((item, i) => (
          <div
            className='list-item'
            key={i}
            style={{
              height: `${itemHeight}px`,
              overflowY: 'hidden',
              position: 'absolute',
              width: '100%',
              top: 0,
              transform: `translateY(${(i + range[0]) * itemHeight}px)`
            }}
          >
            {renderItem(item, i + range[0])}
          </div>
        ))}
      </div>
    </div>
  );
}

function useMeasure(root: React.MutableRefObject<HTMLElement | null>) {
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

export default List;
