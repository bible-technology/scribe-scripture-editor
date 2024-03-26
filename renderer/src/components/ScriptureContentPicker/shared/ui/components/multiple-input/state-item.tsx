import React from 'react';

import FilledDeleteIcon from './filled-delete-icon';

import styles from './multiple-input.module.css';

import { useState } from 'react';

export interface StateItemProps {
  state: string;
  onClick(state: string): void;
}

export function StateItem({ state, onClick }: StateItemProps) {
  const [isHover, setIsHover] = useState(false);

  const handleDelete = () => {
    onClick(state);
  };

  const handleSetHover = () => {
    setIsHover(true);
  };

  const handleUnsetHover = () => {
    setIsHover(false);
  };

  const filledColor = isHover ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)';

  return (
    <div className={styles['state_item_container']}>
      <div className={styles['state_item_content']}>{state}</div>
      <div
        onClick={handleDelete}
        onMouseEnter={handleSetHover}
        onMouseLeave={handleUnsetHover}
        className={styles['state_item_icon_container']}
      >
        <FilledDeleteIcon fill={filledColor} />
      </div>
    </div>
  );
}

export default StateItem;
