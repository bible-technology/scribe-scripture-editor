import React, { useState } from 'react';
import {
  insertVerseNumber, insertChapterNumber, insertFootnote, insertXRef,
} from '@/util/cursorUtils';
import Popup from './Popup';

export const functionMapping = {
  insertVerseNumber: { title: 'Insert Verse', function: insertVerseNumber },
  insertChapterNumber: { title: 'Insert Chapter', function: insertChapterNumber },
  insertFootnote: { title: 'Insert Footnote', function: insertFootnote },
  insertXRef: { title: 'Insert Cross Reference', function: insertXRef },
};
const PopupButton = ({
  icon, action, isPopupOpen, setIsPopupOpen,
}) => {
  const handlePopupOpen = (e) => {
    e.stopPropagation();
    setIsPopupOpen(true);
  };
  console.log({ isPopupOpen });

  const handlePopupClose = () => {
    console.log('handlePopupClose sdf');
    setIsPopupOpen(false);
  };
  console.log({ isPopupOpen });
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
        title={functionMapping[action].title}
        type="button"
        onClick={handlePopupOpen}
      >
        <span className="h-5 mr-2 w-5 text-white cursor-pointer">{icon}</span>
      </button>
      {/* {isPopupOpen && ( */}
      <Popup
        handleClose={handlePopupClose}
        // handleButtonClick={handleButtonClick}
        title={functionMapping[action].title}
        isPopupOpen={isPopupOpen}
        action={action}
        setIsPopupOpen={setIsPopupOpen}
      />
      {/* )} */}
    </div>
  );
};

export default PopupButton;
