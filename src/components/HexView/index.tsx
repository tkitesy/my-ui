import * as React from "react";
import classNames from "classnames";
import "./style.css";

interface Range {
  start: number;
  end: number;
}

function inRange(index: number, range: Range): boolean {
  const { start, end } = range;
  const _start = Math.min(start, end);
  const _end = Math.max(start, end);
  return index >= _start && index <= _end;
}

export function getBinaryString(dv: DataView, start: number, end: number) {
  const result: string[] = [];
  end = Math.min(dv.byteLength, end);
  for (let i = start; i < end; i++) {
    result.push(dv.getUint8(i).toString(16).padStart(2, "0").toUpperCase());
  }
  return result;
}

export function getAsciiString(dv: DataView, start: number, end: number) {
  const result: string[] = [];
  end = Math.min(dv.byteLength, end);
  for (let i = start; i < end; i++) {
    const ascii = String.fromCharCode(dv.getUint8(i));
    result.push(ascii === "\r" || ascii === "\n" ? "." : ascii);
  }
  return result;
}

interface HexViewProps {
  bytes: ArrayBuffer;
  highlightRange?: Range;
  onSelectEnd?(selection: Range): void;
  className?: string;
  style?: React.CSSProperties;
}

const lengthOfRow = 16;

interface HexViewState {
  selectionRange: Range;
  hoverIndex: number;
  activeIndex: number;
}

const defaultRange = { start: -1, end: -1 };

const AddressString = new Array(lengthOfRow)
  .fill(0)
  .map((_, i) => i.toString(16).padStart(2, "0").toUpperCase());

export function HexView({
  bytes,
  className,
  style,
  highlightRange = defaultRange,
}: HexViewProps) {
  const dv = new DataView(bytes);
  const amount = dv.byteLength;
  const numRows = Math.ceil(amount / lengthOfRow);
  const [state, setState] = React.useState<HexViewState>({
    selectionRange: { start: -1, end: -1 },
    hoverIndex: -1,
    activeIndex: -1,
  });

  const selecting = React.useRef(false);
  const lastIndex = React.useRef(-1);

  function onMouseEnter(index: number) {
    lastIndex.current = index;
    if (selecting.current) {
      setState((preState) => ({
        ...preState,
        hoverIndex: index,
        selectionRange: { ...preState.selectionRange, end: index },
      }));
    } else {
      setState((preState) => ({
        ...preState,
        hoverIndex: index,
      }));
    }
  }
  function onMouseDown(index: number) {
    selecting.current = true;
    setState((preState) => ({
      ...preState,
      hoverIndex: index,
      selectionRange: { start: index, end: index },
    }));
    document.addEventListener("mouseup", onMouseUp, true);
  }

  function onMouseUp() {
    selecting.current = false;
    setState((preState) => ({
      ...preState,
      activeIndex: lastIndex.current,
    }));
    document.removeEventListener("mouseup", onMouseUp, true);
  }

  const cellProps = {
    ...state,
    highlightRange,
    onMouseEnter,
    onMouseDown,
    onMouseUp,
  };
  const minWidth = lengthOfRow * 24 + lengthOfRow * 12 + 32 + 64;

  return (
    <div
      className={classNames("hex-view", className)}
      style={{ minWidth: `${minWidth}px`, ...style }}
    >
      <div className="hex-view-header">
        <div className="hex-view-row">
          <div className="hex-view-address">000000</div>
          <div>
            {AddressString.map((chars, i) => (
              <span className="hex-view-cell" key={i}>
                {chars}
              </span>
            ))}
          </div>
          <div>Ascii</div>
        </div>
      </div>
      <div className="hex-view-content">
        {new Array(numRows).fill(0).map((_, i) => {
          return (
            <div className="hex-view-row" key={i}>
              <div className="hex-view-address">
                {(i * 16).toString(16).padStart(6, "0").toUpperCase()}
              </div>
              <div className="hex-view-binary-row">
                {getBinaryString(dv, i * 16, i * 16 + 16).map((chars, j) => (
                  <Cell
                    chars={chars}
                    className="binary"
                    index={i * 16 + j}
                    {...cellProps}
                  />
                ))}
              </div>
              <div className="hex-view-ascii-row">
                {getAsciiString(dv, i * 16, i * 16 + 16).map((chars, j) => (
                  <Cell
                    chars={chars}
                    className="ascii"
                    index={i * 16 + j}
                    {...cellProps}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface CellProps {
  chars: string;
  index: number;
  onMouseEnter: (index: number) => void;
  onMouseDown: (index: number) => void;
  onMouseUp: (index: number) => void;
  highlightRange: Range;
  selectionRange: Range;
  activeIndex: number;
  hoverIndex: number;
  className: string;
}

function Cell(props: CellProps) {
  function onMouseEnter() {
    props.onMouseEnter(props.index);
  }
  function onMouseDown() {
    props.onMouseDown(props.index);
  }
  function onMouseUp() {
    props.onMouseUp(props.index);
  }
  return (
    <span
      className={classNames("hex-view-cell", props.className, {
        highlight: inRange(props.index, props.highlightRange),
        selected: inRange(props.index, props.selectionRange),
        active: props.index === props.activeIndex,
        hover: props.index === props.hoverIndex,
      })}
      onMouseEnter={onMouseEnter}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {props.chars}
    </span>
  );
}

function HexValueScan(bytes: ArrayBuffer) {}
