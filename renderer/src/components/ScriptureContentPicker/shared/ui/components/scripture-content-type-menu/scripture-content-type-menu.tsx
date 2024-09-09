// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './scripture-content-type-menu.module.css';

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
    <div className={styles['container']}>
      {items.map((type) => (
        <li
          key={type}
          className={selectedItem === type ? styles.selected : ''}
          onClick={() => onSelectMenuItem(type)}
        >
          {type}
        </li>
      ))}
    </div>
  );
}

export default ScriptureContentTypeMenu;
