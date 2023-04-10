import React, { useState } from "react";
import Popup from "./Popup";

const PopupButton = ({ handleClick, title }) => {
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
        className="px-2  mr-2 border border-transparent text-base font-medium  text-white bg-primary hover:bg-secondary "
        onClick={handlePopupOpen}
      >
        Insert {title}
      </button>
      {isPopupOpen && (
        <Popup handleClose={handlePopupClose} handleButtonClick={handleButtonClick} title={title} />
      )}
    </div>
  );
};

export default PopupButton;
