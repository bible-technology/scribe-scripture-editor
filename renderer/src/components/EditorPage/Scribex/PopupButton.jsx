import React, { useState } from 'react';
import Popup from './Popup';

const PopupButton = ({ handleClick, title, roundedHover }) => {
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
    <div>
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
        <Popup handleClose={handlePopupClose} handleButtonClick={handleButtonClick} title={title} isPopupOpen={isPopupOpen} />
      )}
    </div>
  );
};

export default PopupButton;
