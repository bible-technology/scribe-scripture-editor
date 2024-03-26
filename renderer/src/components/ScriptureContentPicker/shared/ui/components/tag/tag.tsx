// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from 'react';
import { darkenHexColor } from '../../../utils';

export interface TagProps {
  color: string;
  children: React.ReactNode;
}

export function Tag({ color, children }: TagProps) {
  const darkColor: string = darkenHexColor(color, 0.7);
  return (
    <span
      className={'containerTag'}
      style={{
        color: darkColor,
        background: color,
        border: `1px solid ${darkColor}`,
      }}
    >
      {children}
    </span>
  );
}

export default Tag;
