import React, { useState, useCallback, ChangeEventHandler } from 'react';

import styles from './multiple-input.module.css';

import StateItem from './state-item';

export interface MultipleInputProps {
  states: string[];
  onAddState(state: string): void;
  onDeleteState(state: string): void;
  placeholder?: string;
}

export function MultipleInput({
  states,
  onAddState,
  onDeleteState,
  placeholder,
}: MultipleInputProps) {
  const [newState, setNewState] = useState('');

  const handleAddNewState = useCallback(() => {
    if (newState.trim() === '') {
      return;
    }

    if (states.find((item) => item === newState)) {
      return;
    }

    onAddState(newState);
    setNewState('');
  }, [newState, onAddState, states]);

  const handleChangeNewState: ChangeEventHandler<HTMLInputElement> =
    useCallback((e) => {
      setNewState(e.target.value);
    }, []);

  return (
    <div className={styles['multiple_input_container']}>
      {states.map((state) => (
        <StateItem key={state} state={state} onClick={onDeleteState} />
      ))}
      <input
        type="text"
        className={styles['multipe_input']}
        placeholder={placeholder || ''}
        value={newState}
        onChange={handleChangeNewState}
      />
      {newState.trim() !== '' && !states.find((item) => item === newState) ? (
        <div
          className={styles['multiple_input_panel']}
          onClick={handleAddNewState}
        >
          {newState}
        </div>
      ) : null}
    </div>
  );
}

export default MultipleInput;
