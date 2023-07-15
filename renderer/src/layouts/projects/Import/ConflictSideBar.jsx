import React from 'react';
import FileIcon from '@/icons/file.svg';

function ConflictSideBar({ conflictData, setSelectedFileName, selectedFileName }) {
  return (
    <div className="w-[35%] sm:w-[25%] bg-gray-100 h-[85vh] sm:h-[100%] flex flex-col gap-5 p-5">
      <div className="font-medium">Files</div>
      <div className="flex flex-col gap-5 cursor-pointer">
        {conflictData?.data?.files?.filepaths?.map((file, index) => (
          <div
            className={`${selectedFileName === file && 'bg-green-300'} px-2 py-2 rounded-md flex gap-3 justify-center items-center`}
          // eslint-disable-next-line react/no-array-index-key
            key={index}
            onClick={() => setSelectedFileName(file)}
            role="button"
            tabIndex={-2}
          >
            <FileIcon
              fill="none"
              strokecurrent="none"
              className="h-5 w-5 text-dark group-hover:text-white"
            />
            {file}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ConflictSideBar;
