import Modal from 'react-modal';
import styles from './spinner.module.css';
import React from 'react';

interface SpinnerProps {
  show: boolean;
}

const customStyles = {
  content: {
    width: '100%',
    height: '100%',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    background: 'transparent',
    transform: 'translate(-50%, -50%)',
    border: 'none',
  },
};

export function Spinner({ show }: SpinnerProps) {
  return (
    <Modal
      isOpen={show}
      ariaHideApp={false}
      style={customStyles}
      overlayRef={(node) => {
        node &&
          node.addEventListener('click', function (event) {
            event.stopPropagation();
          });
      }}
      contentRef={(node) => {
        node &&
          node.addEventListener('click', function (event) {
            event.stopPropagation();
          });
      }}
    >
      <div className={styles['spin']} />
    </Modal>
  );
}
