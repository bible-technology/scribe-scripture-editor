import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import ViewFileData from './components/ViewFileData';

import { fileData } from './data/fileData';

const Files = () => {
const [isComplete, setIsComplete] = useState(false);

return (
  <div className="p-2 flex gap-2">
    <div className="bg-white border-2 rounded-md border-black">
      <div className="flex items-center justify-between bg-black py-1.5 px-2.5">
        <span className="px-2.5 py-0.5 bg-primary text-white font-semibold tracking-wider text-xs uppercase rounded-xl">
          23 files
        </span>
        <Cog8ToothIcon className="w-5 h-5 text-white" />
      </div>
      <ul className="text-black text-xs pt-2.5">
        <li className="hover:bg-primary px-5 py-2 cursor-pointer line-through ">bible/path/file_number_1.md</li>
        <li className="hover:bg-primary px-5 py-2 cursor-pointer">bible/path/file_number_2.md</li>
      </ul>
    </div>
    <div className="bg-white flex-1 border-2 border-gray-100 rounded-md">
      <div className="flex justify-between bg-gray-100 border border-gray-100">
        <div className="flex w-full justify-between">
          <div className="flex py-1.5 px-1 gap-2.5">
            <span className="px-2.5 py-0.5 text-black font-semibold tracking-wider text-xs uppercase rounded-xl">comparison</span>
          </div>
          <div className="flex py-1.5 px-1 gap-2.5">
            <span className="px-2.5 py-0.5 bg-black text-white font-semibold tracking-wider text-xs uppercase rounded-xl">Original</span>
            <span className="px-2.5 py-0.5 bg-success text-white font-semibold tracking-wider text-xs uppercase rounded-xl">New</span>
            <span className="px-2.5 py-0.5 bg-blue-500 text-white font-semibold tracking-wider text-xs uppercase rounded-xl">Both</span>
            <span className="px-2.5 py-0.5 bg-gray-300 text-black font-semibold tracking-wider text-xs uppercase rounded-xl">Reset</span>
          </div>
        </div>
        <div className="bg-black flex items-center px-2 rounded-tr-md">
          <Cog8ToothIcon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="divide-y divide-gray-100">
        <div className="h-[42.5rem] overflow-auto">
          {fileData.map((file) => (
            <ViewFileData file={file} key={file.number} />
     ))}
        </div>
        <div className="flex justify-end">
          {isComplete && (
          <button type="button" className="px-4 py-1 bg-success uppercase text-sm rounded-md m-2 text-white">
            Done
          </button>
)}
          <button
            type="button"
            className="disabled:bg-gray-300 uppercase bg-success px-4 text-sm py-1 text-white disabled:text-black rounded-md m-2 disabled:cursor-not-allowed "
            onClick={() => {
              setIsComplete(true);
          }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>

  );
};

export default Files;
