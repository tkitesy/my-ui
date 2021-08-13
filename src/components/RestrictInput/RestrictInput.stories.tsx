import * as React from 'react';
import { RestrictInput } from './RestrictInput';

export const BaseDemo = () => {
  const [value, setValue] = React.useState('123');
  return (
    <>
      <RestrictInput
        value={value}
        // onChange={setValue}
        // maxChars={10}
        restrict={/[0-9a-z我]/}
      />
      <RestrictInput
        // value={value}
        // onChange={setValue}
        maxChars={10}
      />
    </>
  );
};

export default {
    title: "RestrictInput"
};
