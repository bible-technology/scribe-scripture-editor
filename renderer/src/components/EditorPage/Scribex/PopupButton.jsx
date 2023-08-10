import React, { useState } from 'react';
import Popup from './Popup';

const PopupButton = ({ handleClick, title, roundedHover, selectedText }) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handlePopupOpen = () => {
    setIsPopupOpen(true);
  };

  const handlePopupClose = () => {
    setIsPopupOpen(false);
  };

  const handleButtonClick = (number, title) => {
    handleClick(number, title);
  };

  return (
    <div
      onKeyDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onFocus={e => e.stopPropagation()}
      onMouseOver={e => e.stopPropagation()}>
      <button
        type="button"
        className={`flex w-full border py-2 px-3 border-transparent text-sm font-medium text-black hover:bg-primary hover:text-white ${roundedHover}`}
        onClick={handlePopupOpen}
      >
        Insert
        {' '}
        {title}
      </button>
      {isPopupOpen && (
        <Popup handleClose={handlePopupClose} handleButtonClick={handleButtonClick} title={title} isPopupOpen={isPopupOpen} selectedText={selectedText} />
      )}
    </div>
  );
};

export default PopupButton;
