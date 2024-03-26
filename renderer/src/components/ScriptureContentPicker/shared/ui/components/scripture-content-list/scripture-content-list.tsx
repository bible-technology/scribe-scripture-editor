import { useMemo } from 'react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import styles from './scripture-content-list.module.css';
import type {
  ScriptureContentGroup,
  ScriptureContentLocalLabel,
  ScriptureContent,
} from '../../../../ScriptureContentPickerInterfaces';

import { ScriptureContentListItem } from '../scripture-content-list-item/scripture-content-list-item';
import React from 'react';

export interface ScriptureContentListProps {
  group: ScriptureContentGroup;
}

export function ScriptureContentList({ group }: ScriptureContentListProps) {
  const entries = useMemo(() => Object.entries(group).sort((item1, item2) => {
    if (item1[0] > item2[0]) {
      return 1;
    } else if (item1[0] < item2[0]) {
      return -1;
    } else {
      return 0;
    }
  }), [group]);

  return (
    <div className={styles['container']}>
      {entries.map(
        ([localLabel, content]: [
          ScriptureContentLocalLabel,
          ScriptureContent
        ]) => (
          <ScriptureContentListItem
            content={{ ...content, localLabel }}
            key={localLabel}
          />
        )
      )}
    </div>
  );
}

export default ScriptureContentList;
