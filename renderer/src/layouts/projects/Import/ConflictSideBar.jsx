import React from 'react';
import FileIcon from '@/icons/file.svg';

function ConflictSideBar({
 conflictData, setSelectedFileName, selectedFileName, resolvedFileNames,
}) {
  console.log({ resolvedFileNames });
  return (
    <div className="w-[35%] sm:w-[25%] bg-gray-100 h-[85vh] sm:h-[100%] flex flex-col gap-5 p-5">
      <div className="font-medium">Files</div>
      <div className="flex flex-col gap-5 cursor-pointer">
        {conflictData?.data?.files?.filepaths?.map((file, index) => (
          <button
            className={`px-2 py-2 rounded-md flex gap-3 justify-center items-center ${selectedFileName === file && !resolvedFileNames.includes(file) && 'bg-green-300'} ${resolvedFileNames.includes(file) && 'text-gray-400'}`}
          // eslint-disable-next-line react/no-array-index-key
            key={index}
            onClick={() => setSelectedFileName(file)}
            type="button"
            disabled={resolvedFileNames.includes(file)}
          >

            <FileIcon
              fill="none"
              strokecurrent="none"
              className={`h-5 w-5 text-dark group-hover:text-white ${resolvedFileNames.includes(file) && 'text-gray-400'}`}
            />
            <span className={`${resolvedFileNames.includes(file) && 'line-through decoration-2'} `}>

              {file}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ConflictSideBar;
