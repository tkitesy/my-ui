import * as React from 'react';
import { useMaybeControlled } from '../../utils';

export interface RestrictInputProps {
  restrict?: RegExp;
  value?: string;
  onChange?: (value: string) => void;
  maxChars?: number;
  className?: string;
}

function filterByRestrict(restrict: RegExp, value: string) {
  return value
    .split('')
    .filter((ch) => restrict.test(ch))
    .join('');
}
const defalutRestrict = /./;

export function RestrictInput(props: RestrictInputProps) {
  const {
    value,
    onChange,
    restrict = defalutRestrict,
    maxChars: maxLength,
    ...others
  } = props;

  const [text, changeText] = useMaybeControlled(props, '', "value", 'onChange');

  const isCompositionInput = React.useRef(false);
  const lastInputSelection = React.useRef([0, 0] as [number, number]);
  const lastInputValue = React.useRef('');
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      if (isCompositionInput.current) {
        // 输入法输入时，确保输入框接受所有输入
        changeText(inputValue);
      } else {
        // 非输入法输入时，只接受约束字符
        const filterValue = filterByRestrict(restrict, inputValue);
        //非输入法环境下只需判断是否超长，超过长度就不改变value的值
        if (maxLength && maxLength > 0) {
          if (filterValue.length > maxLength) {
            const [, end] = lastInputSelection.current;
            Promise.resolve().then(() => {
              inputRef.current!.setSelectionRange(end, end);
            });
            return;
          }
        }
        changeText(filterValue);
      }
    },
    [restrict, changeText],
  );

  const handleKeyDown = React.useCallback(() => {
    if (!isCompositionInput.current) {
      const start = inputRef.current!.selectionStart || 0;
      const end = inputRef.current!.selectionEnd || 0;
      lastInputSelection.current = [start, end];
      lastInputValue.current = inputRef.current!.value;
    }
  }, []);

  const handleCompositionStart = React.useCallback(() => {
    isCompositionInput.current = true;
  }, []);

  const calculateInputValue = React.useCallback(
    (data: string) => {
      const lastValue = lastInputValue.current;
      const [start, end] = lastInputSelection.current;

      let filterValue = filterByRestrict(restrict, data);
      if (maxLength && maxLength > 0) {
        const remainLen = maxLength + (end - start) - lastValue.length;
        if (remainLen > 0) {
          filterValue = filterValue.substring(0, remainLen);
        } else {
          Promise.resolve().then(() => {
            inputRef.current!.setSelectionRange(end, end);
          });
          return lastValue;
        }
      }

      const inputValue =
        lastValue.substring(0, start) +
        filterValue +
        lastValue.substring(end, lastValue.length);
      const selectionEnd = start + filterValue.length;

      Promise.resolve().then(() => {
        inputRef.current!.setSelectionRange(selectionEnd, selectionEnd);
      });
      return inputValue;
    },
    [maxLength, restrict],
  );

  const handleCompositionEnd = React.useCallback(
    (e: React.CompositionEvent<HTMLInputElement>) => {
      let data = e.data;
      changeText(calculateInputValue(data));
      isCompositionInput.current = false;
      e.preventDefault();
    },
    [calculateInputValue, changeText],
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      let data = e.clipboardData?.getData('text');
      changeText(calculateInputValue(data));
      e.preventDefault();
    },
    [calculateInputValue, changeText],
  );

  return (
    <input
      {...others}
      ref={inputRef}
      value={text}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onChange={handleChange}
      onPaste={handlePaste}
    />
  );
}
