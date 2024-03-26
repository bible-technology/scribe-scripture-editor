// eslint-disable-next-line @typescript-eslint/no-unused-vars

import type { ScriptureContentType } from '../../../../ScriptureContentPickerInterfaces';
import React from 'react';

export interface ScriptureContentTypeMenuProps {
  items: ScriptureContentType[];
  selectedItem?: ScriptureContentType;
  onSelectMenuItem: (item: ScriptureContentType) => void;
}

export function ScriptureContentTypeMenu({
  items,
  onSelectMenuItem,
  selectedItem,
}: ScriptureContentTypeMenuProps) {
  return (
    <div className={'containerContentType bouquet-picker'}>
      {items.map((type) => (
        <li
          key={type}
          className={selectedItem === type ? 'selected' : ''}
          onClick={() => onSelectMenuItem(type)}
        >
          {type}
        </li>
      ))}
    </div>
  );
}

export default ScriptureContentTypeMenu;
