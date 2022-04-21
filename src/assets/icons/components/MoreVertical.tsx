import * as React from 'react';
import { createIcon } from '@consta/uikit/createIcon';

const SvgMoreVertical = () => {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className="Icon-Svg"
    >
      <path d="M13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7C12.5523 7 13 7.44772 13 8Z" />
      <path d="M13 12C13 12.5523 12.5523 13 12 13C11.4477 13 11 12.5523 11 12C11 11.4477 11.4477 11 12 11C12.5523 11 13 11.4477 13 12Z" />
      <path d="M12 17C12.5523 17 13 16.5523 13 16C13 15.4477 12.5523 15 12 15C11.4477 15 11 15.4477 11 16C11 16.5523 11.4477 17 12 17Z" />
    </svg>
  );
};

export const IconMoreVertical = createIcon({
  m: SvgMoreVertical,
  s: SvgMoreVertical,
  xs: SvgMoreVertical,
  name: 'IconMoreVertical',
});
