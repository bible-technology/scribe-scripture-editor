import React from 'react';
import { PopupContextProvider } from '../../Popup/PopupContext';
import Popup from './Popup';

export default function InsertMenu() {
  return (
    <div className="flex items-center">
      <PopupContextProvider>
        <Popup
          action="insertVerseNumber"
        />
      </PopupContextProvider>
      <PopupContextProvider>
        <Popup
          action="insertChapterNumber"
        />
      </PopupContextProvider>
      <PopupContextProvider>
        <Popup
          action="insertFootnote"
        />
      </PopupContextProvider>
      <PopupContextProvider>
        <Popup
          action="insertXRef"
        />
      </PopupContextProvider>
    </div>
  );
}
