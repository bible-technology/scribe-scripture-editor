import { Cog8ToothIcon } from '@heroicons/react/24/outline';
import {
 ArrowSmallDownIcon, ArrowSmallUpIcon, ArrowsUpDownIcon,
} from '@heroicons/react/20/solid';

import { fileData } from './data/fileData';

const files = () => (
  <div className="p-2 flex gap-2 h-screen">
    <div className="bg-white border-2 rounded-md border-black">
      <div className="flex items-center justify-between bg-black py-1.5 px-2.5">
        <span className="px-2.5 py-0.5 bg-primary text-white font-semibold tracking-wider text-xs uppercase rounded-xl">
          23 files
        </span>
        <Cog8ToothIcon className="w-5 h-5 text-white" />
      </div>
      <ul className="text-black text-xs pt-2.5">
        <li className="hover:bg-primary hover:text-white px-3 py-2 cursor-pointer rounded-md mx-1">bible/path/file_number_1.md</li>
        <li className="hover:bg-primary hover:text-white px-3 py-2 cursor-pointer rounded-md mx-1">bible/path/file_number_2.md</li>
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
      <div className="divide-y h-full overflow-y-auto overflow-x-hidden pb-8 divide-gray-100">
        {fileData.map((file) => (
          <div key={file.number} className="flex px-2 py-6 gap-4">
            <div className="h-4 w-4 py-1 px-2 mt-1 flex items-center justify-center bg-primary rounded-full text-xxs text-white">
              {file.number}
            </div>

            <div className="flex flex-col text-sm gap-2">
              <div className="flex gap-2">
                <span className="tracking-wide">{file.original}</span>
              </div>
              <div className="flex gap-2 items-end">
                <span className="text-success tracking-wide">{file.new}</span>
              </div>
            </div>

            <div className="flex flex-col justify-between self-stretch">
              <div className="bg-black w-6 h-6 rounded-full flex justify-center items-center">
                <ArrowSmallUpIcon className="w-4 h-4 text-white " />
              </div>
              <div className="bg-blue-500 w-6 h-6 rounded-full flex justify-center items-center">
                <ArrowsUpDownIcon className="w-4 h-4 text-white" />
              </div>
              <div className="bg-success w-6 h-6 rounded-full flex justify-center items-center">
                <ArrowSmallDownIcon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
     ))}
      </div>
    </div>
  </div>

  );

export default files;
