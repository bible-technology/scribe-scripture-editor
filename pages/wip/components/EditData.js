import { ArrowPathRoundedSquareIcon, DocumentArrowDownIcon } from '@heroicons/react/20/solid';
import React from 'react';

export default function EditData({ data, customFuction, both }) {
return (
  <div className="flex flex-col w-full  h-auto overflow-auto rounded-md px-2 py-1 ">

    <textarea
      defaultValue={data}
      className={`border border-black rounded-md focus:ring-0 overflow-y-auto ${both ? 'h-56' : 'h-24'} resize-y w-full focus:outline-none`}
    />
    <div className="flex justify-end py-2 items-center ">
      <ArrowPathRoundedSquareIcon
        className="w-6 h-6 bg-gray-300 text-black p-1  rounded-full cursor-pointer"
        onClick={customFuction}
      />
      <DocumentArrowDownIcon
        type="button"
        className=" w-6 h-6  p-1 text-sm mx-2 rounded-full bg-success text-white cursor-pointer"
      />

    </div>
  </div>
);
}
