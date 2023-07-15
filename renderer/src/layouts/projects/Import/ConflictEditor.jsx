  import React from 'react';

  const ConflictComponent = ({
 text, index, setSelectedFileContent, selectedFileContent,
}) => {
  // expecting 4 item in array
  // 1. input text
  // 2. HEAD change / current change
  // 3. Incoming Change
  // 4. mixed data

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
    if (matchArr?.length > 3) {
      matchedData = { current: matchArr[2], incoming: matchArr[3] };
      selectedFileContent[index].conflict = true;
      selectedFileContent[index].conflictResolved = false;
    }
  }

  // eslint-disable-next-line no-nested-ternary
  return matchedData?.current && matchedData?.incoming ? (

    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-3 text-gray-600 text-sm">
        <span
          role="button"
          tabIndex={-1}
          className="hover:text-primary cursor-pointer"
          onClick={() => handleSelection(matchedData.current, index)}
        >
          Current
        </span>

        <span>|</span>

        <span
          role="button"
          tabIndex={-1}
          className="hover:text-primary cursor-pointer"
          onClick={() => handleSelection(matchedData.incoming, index)}
        >
          Incoming
        </span>

        <span>|</span>

        <span
          role="button"
          tabIndex={-1}
          className="hover:text-primary cursor-pointer"
          onClick={() => handleSelection(`${matchedData.current}\t${matchedData.incoming}`, index)}
        >
          Both
        </span>
      </div>
      <div className="bg-gray-200 flex flex-col w-full p-2 rounded-md">

        <div className="text-red-600">
          <div className="">
            {'<<<<<<<'}
            {' '}
            current
          </div>
          <div>{matchedData.current}</div>
        </div>

        <div>=======</div>

        <div className="text-green-600">
          <div>{matchedData.incoming}</div>
          <div>
            {'>>>>>>>'}
            {' '}
            incoming
          </div>
        </div>
      </div>

    </div>
  ) : (
    selectedFileContent[index].conflict && selectedFileContent[index].conflictResolved
    ? (
      <div>
        <textarea className="w-full" onChange={(e) => handleEditAfterResolve(e, selectedFileContent, index)}>{text}</textarea>
      </div>
    )
    : (
      <div className="bg-gray-200 flex flex-col w-full p-2 rounded-md min-h-[3rem] justify-center">{text}</div>
    )
  );
  };

  function ConflictEditor({ selectedFileContent, setSelectedFileContent }) {
  console.log({ selectedFileContent });

  return (
    <div className="pl-2 pt-5 pr-5">
      <div className=" min-h-[72vh] p-5 flex flex-col gap-5">
        {selectedFileContent?.map((content, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={index}>
            <div className="flex gap-5 items-center">
              <div className="bg-gray-200 min-w-[3rem] h-[3rem] flex justify-center items-center rounded-full">
                {content?.id}
              </div>
              <div className="w-full">
                <ConflictComponent
                  text={
                  content?.title
                  || content?.text
                  || content?.end
                }
                  index={index}
                  setSelectedFileContent={setSelectedFileContent}
                  selectedFileContent={selectedFileContent}
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
