import * as React from 'react';
import { PickKey } from './types';

export function useMaybeControlled<Props extends Record<string, any>, T>(
  props: Props,
  defaultValue: T,
  valueName: PickKey<Props, T | undefined>,
  changeName: PickKey<Props, ((v: T) => void) | undefined>,
): [T, (v: T) => void] {
  const [text, setText] = React.useState(defaultValue);

  React.useMemo(() => {
    props[valueName] !== undefined && setText(props[valueName]);
  }, [props[valueName]]);

  function changeText(value: T) {
    if (props[valueName] === null || props[valueName] === undefined) {
      setText(value);
    }
    props[changeName]?.(value);
  }

  return [text, changeText];
}
