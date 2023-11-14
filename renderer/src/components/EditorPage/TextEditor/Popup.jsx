import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ScribexContext } from '@/components/context/ScribexContext';

import { usePopup } from '../../Popup/PopupContext';
import PopUpTemplate from '../../Popup';
import { functionMapping } from './utils/insertFunctionMap';

const Popup = ({ action, setTriggerVerseInsert }) => {
  const {
    state: {
      textToInsert, numberToInsert, selectedText,
    },
    actions: {
      setTextToInsert,
      setNumberToInsert,
      setInsertType,
    },
  } = useContext(ScribexContext);
  const { setIsOpen } = usePopup();

  const handleInputChange = (event) => {
    setTextToInsert(event.target.value);
  };

  const handleNumberInputChange = (e) => {
    setNumberToInsert(e.target.value.replace(/[^0-9]/g, ''));
  };
  const handleSubmit = () => {
    setInsertType(action);
    setTriggerVerseInsert((prev) => !prev);

    // calling funciton here does not trigger the perf check to safe. Hence the trigger to re-render.
    // action === 'insertVerseNumber' || action === 'insertChapterNumber'
    //   ? functionMapping[action].function({ caretPosition, numberToInsert })
    //   : functionMapping[action].function({ caretPosition, textToInsert, selectedText });
    setIsOpen(false);
  };

  return (
    <PopUpTemplate
      buttonStyle="button gap-2 text-gray-200 bg-primary-500 hover:bg-primary-500/90 text-highlight-300 gap-1"
      buttonText={functionMapping[action].icon}
      isSmall
      maxWidth="max-w-xl"
    >
      <div className="inline-block w-full max-w-md p-6 ">
        <div className="mt-2">
          <div
            as="h3"
            className="text-lg font-medium leading-6 text-gray-900"
          >
            {functionMapping[action].title}
          </div>
          {selectedText && selectedText.length > 0
            && (
              <div>
                <span className="font-medium text-gray-600">Selected Text :</span>
                {' '}
                <span className="text-primary px-2">{selectedText}</span>
                {' '}
              </div>
            )}

        </div>
        <div className="mt-2">
          {action === 'insertVerseNumber' || action === 'insertChapterNumber'
            ? (
              <input
                type="text"
                placeholder={functionMapping[action].placeholder}
                className="block w-full border-gray-300 rounded-md shadow-sm appearance-none"
                value={numberToInsert}
                onChange={handleNumberInputChange}
                onFocus={(e) => e.stopPropagation()}
              />
            ) : (
              <input
                type="text"
                placeholder={functionMapping[action].placeholder}
                className="block w-full border-gray-300 rounded-md shadow-sm appearance-none"
                value={textToInsert}
                onChange={handleInputChange}
                onFocus={(e) => e.stopPropagation()}
              />
            )}

        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </PopUpTemplate>
  );
};

Popup.propTypes = {
  action: PropTypes.string.isRequired,
  // handleButtonClick: PropTypes.func.isRequired,
};

export default Popup;
