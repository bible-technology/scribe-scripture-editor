/* eslint-disable no-nested-ternary */
// Indivudual text section of conflict Editor

import { useState } from 'react';
import {
  ArrowSmallDownIcon, ArrowSmallUpIcon, ArrowsUpDownIcon, ArrowPathRoundedSquareIcon,
} from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';

const ConflictSection = ({
  text, index, setSelectedFileContent, selectedFileContent, handleResetSingle, resolvedFileNames, selectedFileName,
}) => {
  const { t } = useTranslation();
  const [hoveredId, setHoveredId] = useState('');

  const handleSelection = (content, index, selectedResolverType) => {
    const contents = [...selectedFileContent];
    const currentData = contents[index];
    if ('text' in contents[index]) {
      currentData.text = content;
    } else if ('title' in contents[index]) {
      currentData.title = content;
    } else if ('end' in contents[index]) {
      currentData.end = content;
    }
    currentData.conflictResolved = true;
    currentData.resolvedType = selectedResolverType;
    setSelectedFileContent(contents);
  };

  const handleEditAfterResolve = (e, selectedFileContent, index) => {
    selectedFileContent[index].text = e.target.value.trim();
  };

  let matchedData;
  // matchedData : expecting 4 item in array
  // 1. input text
  // 2. HEAD change / current change
  // 3. Incoming Change
  // 4. mixed data

  if (text) {
    // eslint-disable-next-line prefer-regex-literals
    const conflictRegex = new RegExp(
      /^<{7}([^=]*)\n([\s\S]*)\n={7}\n([\s\S]*)\n>{7}[^=]*$/,
    );
    const matchArr = text.match(conflictRegex);
    // console.log({ matchArr });
    if (matchArr?.length > 3) {
      matchedData = { current: matchArr[2], incoming: matchArr[3] };
      selectedFileContent[index].conflict = true;
      selectedFileContent[index].conflictResolved = false;
    }
  }

  return matchedData?.current && matchedData?.incoming
    ? (
      <div className="flex px-2 gap-4 min-h-[6rem]">
        <div className="flex flex-col text-sm gap-2 w-full">
          {/* <div className="flex gap-2"> */}
          <div className={`flex gap-2 p-2 ${(hoveredId === 'current' || hoveredId === 'both') && 'bg-[#7c7b771f] rounded-md'}`}>
            <span className="tracking-wide">{matchedData.current}</span>
          </div>
          {/* <div className="flex gap-2 items-end"> */}
          <div className={`flex gap-2 p-2 items-end ${(hoveredId === 'incoming' || hoveredId === 'both') && 'bg-[#7c7b771f] rounded-md'}`}>
            <span className="text-success tracking-wide">{matchedData.incoming}</span>
          </div>
        </div>

        <div className="flex flex-col justify-between self-stretch">
          {/* current */}
          <div
            role="button"
            tabIndex={-1}
            onClick={() => { setHoveredId(''); handleSelection(matchedData.current, index, 'current'); }}
            onMouseEnter={() => setHoveredId('current')}
            onMouseLeave={() => setHoveredId('')}
            title={t('tooltip-merge-orginal-btn')}
            className="bg-black w-6 h-6 rounded-full flex justify-center items-center"
          >
            <ArrowSmallUpIcon className="w-4 h-4 text-white " />
          </div>
          {/* Both */}
          <div
            role="button"
            tabIndex={-2}
            onClick={() => { setHoveredId(''); handleSelection(`${matchedData.current}\t${matchedData.incoming}`, index, 'both'); }}
            onMouseEnter={() => setHoveredId('both')}
            onMouseLeave={() => setHoveredId('')}
            title={t('tooltip-merge-both-btn')}
            className="bg-blue-500 w-6 h-6 rounded-full flex justify-center items-center"
          >
            <ArrowsUpDownIcon className="w-4 h-4 text-white" />
          </div>
          {/* Incoming */}
          <div
            role="button"
            tabIndex={-3}
            onClick={() => { setHoveredId(''); handleSelection(matchedData.incoming, index, 'incoming'); }}
            onMouseEnter={() => setHoveredId('incoming')}
            onMouseLeave={() => setHoveredId('')}
            title={t('tooltip-merge-new-btn')}
            className="bg-success w-6 h-6 rounded-full flex justify-center items-center"
          >
            <ArrowSmallDownIcon className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>
    ) : (
      selectedFileContent[index]?.conflict && selectedFileContent[index]?.conflictResolved && !resolvedFileNames?.includes(selectedFileName)
        ? (
          // Editable Section with restore
          // <div className="flex px-2 gap-4 text-sm">
          //   <textarea
          //     className="tracking-wide text-sm w-full border-1 border-gray-300"
          //     rows={3}
          //     onChange={(e) => handleEditAfterResolve(e, selectedFileContent, index)}
          //   >
          //     {text}
          //   </textarea>
          //   <div
          //     role="button"
          //     tabIndex={-1}
          //     onClick={() => handleResetSingle(selectedFileContent, index)}
          //     title="RESET this section to initial state"
          //     className="bg-gray-300 w-6 h-6 rounded-full flex justify-center items-center p-1 self-center"
          //   >
          //     <ArrowUturnLeftIcon className="w-4 h-4 text-black " />
          //   </div>
          // </div>
          <div className="flex flex-col w-full  h-auto overflow-auto rounded-md px-2 py-1 ">
            <textarea
              onChange={(e) => handleEditAfterResolve(e, selectedFileContent, index)}
              className={`border border-black rounded-md focus:ring-0 overflow-y-auto ${selectedFileContent[index]?.resolvedType === 'both'
                ? 'h-56' : 'h-24'} resize-y w-full focus:outline-none`}
            >
              {text}
            </textarea>
            <div className="flex justify-end py-2 items-center ">
              <ArrowPathRoundedSquareIcon
                className="w-6 h-6 bg-gray-300 text-black p-1  rounded-full cursor-pointer"
                onClick={() => handleResetSingle(selectedFileContent, index)}
              />
              {/* <DocumentArrowDownIcon
            type="button"
            className=" w-6 h-6  p-1 text-sm mx-2 rounded-full bg-success text-white cursor-pointer"
          /> */}
            </div>
          </div>
        )
        : (
          // Normal Text - No issues
          <div className="tracking-wide text-sm">{text}</div>
        )
    );
};

export default ConflictSection;
