import React, { useState } from 'react';
import Popup from './Popup';

const PopupButton = ({
  handleClick, title, selectedText, icon,
}) => {
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
      role="button"
      tabIndex={-1}
      onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.stopPropagation()}
      onMouseOver={(e) => e.stopPropagation()}
    >
      <button
        title={title}
        type="button"
        onClick={handlePopupOpen}
      >
        <span className="h-5 mr-2 w-5 text-white cursor-pointer">{icon}</span>
      </button>
      {isPopupOpen && (
        <Popup handleClose={handlePopupClose} handleButtonClick={handleButtonClick} title={title} isPopupOpen={isPopupOpen} selectedText={selectedText} />
      )}
    </div>
  );
};

export default PopupButton;
