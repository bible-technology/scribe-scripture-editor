import React from 'react';

import Modal from 'react-modal';

import styles from './scripture-content-confirm-modal.module.css';

/* eslint-disable-next-line */
export interface ScriptureContentConfirmModalProps {
  title: string;
  message?: string;
  onConfirm(): void;
  onCancel(): void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export function ScriptureContentConfirmModal({
  title,
  message,
  onConfirm,
  onCancel,
  isOpen,
  setIsOpen,
}: ScriptureContentConfirmModalProps) {
  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Add content"
      ariaHideApp={false}
    >
      <div className={styles['confirm_modal_container']}>
        <div className={styles['confirm_modal_title']}>
          <h3>{title}</h3>
        </div>
        {message ? <div>{message}</div> : null}

        <div className={styles['confirm_modal_actions']}>
          <button className={styles['cancel']} onClick={onCancel}>Cancel</button>
          <button className={styles['confirm']} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </Modal>
  );
}

export default ScriptureContentConfirmModal;
