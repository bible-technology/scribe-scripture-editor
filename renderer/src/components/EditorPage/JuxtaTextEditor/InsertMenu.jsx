import React from 'react';
import { PopupContextProvider } from '../../Popup/PopupContext';
import Popup from './Popup';

export default function InsertMenu({ setTriggerVerseInsert }) {
  return (
    <div className="flex items-center">
      <PopupContextProvider>
        <Popup
          action="insertVerseNumber"
          setTriggerVerseInsert={setTriggerVerseInsert}

        />
      </PopupContextProvider>
      <PopupContextProvider>
        <Popup
          action="insertChapterNumber"
          setTriggerVerseInsert={setTriggerVerseInsert}
        />
      </PopupContextProvider>
      <PopupContextProvider>
        <Popup
          action="insertFootnote"
          setTriggerVerseInsert={setTriggerVerseInsert}
        />
      </PopupContextProvider>
      <PopupContextProvider>
        <Popup
          action="insertXRef"
          setTriggerVerseInsert={setTriggerVerseInsert}
        />
      </PopupContextProvider>
    </div>
  );
}
