/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';

const ConflictComponent = ({
  text, index, setSelectedFileContent, selectedFileContent, handleResetSingle, resolvedFileNames, selectedFileName,
}) => {
  // expecting 4 item in array
  // 1. input text
  // 2. HEAD change / current change
  // 3. Incoming Change
  // 4. mixed data

  const [hoveredId, setHoveredId] = useState('');

  const handleSelection = (content, index) => {
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
    setSelectedFileContent(contents);
  };

  const handleEditAfterResolve = (e, selectedFileContent, index) => {
    selectedFileContent[index].text = e.target.value.trim();
  };

  let matchedData;

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

  // eslint-disable-next-line no-nested-ternary
  return matchedData?.current && matchedData?.incoming ? (

    <div className="flex flex-col gap-2 w-full">
      {/* resolve button section */}
      <div className="flex gap-3 text-gray-600 text-sm">
        <span
          role="button"
          tabIndex={-1}
          className="hover:text-red-600 cursor-pointer"
          // className="hover:text-primary cursor-pointer"
          onClick={() => handleSelection(matchedData.current, index)}
          onMouseEnter={() => setHoveredId('current')}
          onMouseLeave={() => setHoveredId('')}
        >
          Ours
        </span>

        <span>|</span>

        <span
          role="button"
          tabIndex={-1}
          onClick={() => handleSelection(matchedData.incoming, index)}
          className="hover:text-green-600 cursor-pointer group/incoming"
          onMouseEnter={() => setHoveredId('incoming')}
          onMouseLeave={() => setHoveredId('')}
        >
          Theirs
        </span>

        <span>|</span>

        <span
          role="button"
          tabIndex={-1}
          onClick={() => handleSelection(`${matchedData.current}\t${matchedData.incoming}`, index)}
          className="hover:text-primary cursor-pointer"
          onMouseEnter={() => setHoveredId('both')}
          onMouseLeave={() => setHoveredId('')}
        >
          Both
        </span>

      </div>
      {/* conflict content section */}
      <div className="border-2 flex flex-col w-full p-2 rounded-md gap-2">

        {/* <div className="text-red-600 bg-gray-200/50 p-3 rounded-md border border-red-200 hover:bg-red-200"> */}
        <div className={`text-red-600 bg-gray-200/50 p-3 rounded-md border border-red-200 ${hoveredId === 'current' ? 'bg-red-300/50' : hoveredId === 'both' ? 'bg-primary/[.70]' : ''}`}>
          {/* <div className="">
            {'<<<<<<<'}
            {' '}
            current
          </div> */}
          <div>{matchedData.current}</div>
        </div>

        {/* <div>=======</div> */}

        {/* <div className="text-green-600 bg-gray-200/50 p-3 rounded-md border border-green-200 hover:bg-green-200"> */}
        <div className={`text-green-600 bg-gray-200/50 p-3 rounded-md border border-green-200 ${hoveredId === 'incoming' ? 'bg-green-200' : hoveredId === 'both' ? 'bg-primary/[.70]' : ''} `}>
          <div>{matchedData.incoming}</div>
          {/* <div>
            {'>>>>>>>'}
            {' '}
            incoming
          </div> */}
        </div>
      </div>

    </div>
  ) : (
    selectedFileContent[index].conflict && selectedFileContent[index].conflictResolved && !resolvedFileNames.includes(selectedFileName)
      ? (
        <div className="flex flex-col gap-1">
          <span
            role="button"
            tabIndex={-1}
            className="hover:text-primary cursor-pointer text-gray-600 text-sm"
            onClick={() => handleResetSingle(selectedFileContent, index)}
          >
            Reset
          </span>
          <textarea
            className="w-full"
            rows={3}
            onChange={(e) => handleEditAfterResolve(e, selectedFileContent, index)}
          >
            {text}

          </textarea>
        </div>
      )
      : (
        <div className="border bg-gray-100 flex flex-col w-full p-2 rounded-md min-h-[3rem] justify-center">{text}</div>
      )
  );
};

// all logic are based on OBS Parsed Array
function ConflictEditor({
  selectedFileContent, setSelectedFileContent, selectedFileName, FileContentOrginal, setEnableSave, resolvedFileNames,
}) {
  const [resolveAllActive, setResolveALlActive] = useState();
  const [resetAlll, setResetAll] = useState();

  useEffect(() => {
    if (resolvedFileNames?.includes(selectedFileName)) {
      setResolveALlActive(false);
      setResetAll(false);
    } else {
      setResolveALlActive(true);
      setResetAll(false);
    }
  }, [selectedFileName, resolvedFileNames]);

  useEffect(() => {
    let conflcitCount = 0;
    let resolvedCount = 0;
    let save = false;
    for (let index = 0; index < selectedFileContent.length; index++) {
      if (selectedFileContent[index]?.conflict) {
        conflcitCount += 1;
        if (selectedFileContent[index].conflictResolved) {
          resolvedCount += 1;
        }
      }
    }
    if (conflcitCount > 0 && conflcitCount === resolvedCount) {
      save = true;
    } else {
      setResolveALlActive(true);
      setResetAll(false);
    }
    setEnableSave(save);
    if (save) {
      setResolveALlActive(false);
      setResetAll(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFileContent]);

  const resolveAllTogether = (data, type) => {
    if (resolveAllActive) {
      const conflictedData = [...data];
      // loop check for conflcit lines
      for (let i = 0; i < conflictedData.length; i++) {
        const currentText = conflictedData[i]?.title || conflictedData[i]?.text || conflictedData[i]?.end;
        if (currentText) {
          // eslint-disable-next-line prefer-regex-literals
          const conflictRegex = new RegExp(
            /^<{7}([^=]*)\n([\s\S]*)\n={7}\n([\s\S]*)\n>{7}[^=]*$/,
          );
          const matchArr = currentText.match(conflictRegex);
          if (matchArr?.length > 3) {
            let resolvedText;
            if (type === 'current') {
              resolvedText = matchArr[2];
            } else if (type === 'incoming') {
              resolvedText = matchArr[3];
            } else if (type === 'both') {
              resolvedText = `${matchArr[2]}\t${matchArr[3]}`;
            }
            if (resolvedText) {
              conflictedData[i].conflictResolved = true;
              if ('text' in conflictedData[i]) {
                conflictedData[i].text = resolvedText;
              } else if ('title' in conflictedData[i]) {
                conflictedData[i].title = resolvedText;
              } else if ('end' in conflictedData[i]) {
                conflictedData[i].end = resolvedText;
              }
            }
          }
        }
      }
      // update state
      setResolveALlActive(false);
      setResetAll(true);
      // update line with current | incoming | both based on selection
      setSelectedFileContent(conflictedData);
    }
  };

  const handleResetSingle = (data, index) => {
    const orginalFileContent = JSON.parse(FileContentOrginal)[index];
    const conflictedData = [...data];
    conflictedData[index] = orginalFileContent;
    setSelectedFileContent(conflictedData);
  };

  const resetAllResolved = () => {
    setResetAll(false);
    setResolveALlActive(true);
    // update state with copy of conflcited data
    setSelectedFileContent(JSON.parse(FileContentOrginal));
  };

  return (
    <div className="pl-2 pt-5 pr-5">
      {/* headign with reset and all select section */}
      {/* !resolvedFileNames?.includes(selectedFileName) */}
      <div className="w-full justify-between flex items-center px-10">
        <div />
        <div className="flex gap-5">
          <button
            type="button"
            onClick={() => resolveAllTogether(selectedFileContent, 'current')}
            disabled={resolveAllActive === false}
            className={` ${resolveAllActive ? 'cursor-pointer hover:text-red-600' : 'text-gray-500'}`}
          >
            All ours
          </button>
          <button
            type="button"
            onClick={() => resolveAllTogether(selectedFileContent, 'incoming')}
            disabled={resolveAllActive === false}
            className={` ${resolveAllActive ? 'cursor-pointer hover:text-green-600' : 'text-gray-500'}`}
          >
            All theirs
          </button>
          <button
            type="button"
            onClick={() => resolveAllTogether(selectedFileContent, 'both')}
            disabled={resolveAllActive === false}
            className={` ${resolveAllActive ? 'cursor-pointer hover:text-primary' : 'text-gray-500'}`}
          >
            All both
          </button>
          <button
            type="button"
            disabled={resetAlll === false}
            onClick={() => resetAllResolved()}
            className={` ${(resetAlll) ? 'cursor-pointer hover:text-primary' : 'text-gray-500'}`}
          >
            Reset all
          </button>
        </div>
      </div>
      <div className=" min-h-[72vh] p-5 flex flex-col gap-5">
        {selectedFileContent?.map((content, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={content?.id}>
            <div className="flex gap-5 items-center">
              {(index !== 0 && index !== selectedFileContent.length - 1) && (
                <div className="bg-gray-200 min-w-[3rem] h-[3rem] flex justify-center items-center rounded-full">
                  {index}
                </div>
              )}
              <div className={`w-full ${(index === 0 || index === selectedFileContent.length - 1) && 'ml-16'}`}>
                <ConflictComponent
                  text={
                    content?.title
                    || content?.text
                    || content?.end
                  }
                  index={index}
                  setSelectedFileContent={setSelectedFileContent}
                  selectedFileContent={selectedFileContent}
                  handleResetSingle={handleResetSingle}
                  resolvedFileNames={resolvedFileNames}
                  selectedFileName={selectedFileName}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConflictEditor;
