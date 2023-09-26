import React, { useState } from 'react';

import {
ArrowSmallDownIcon,
ArrowSmallUpIcon,
ArrowsUpDownIcon,
} from '@heroicons/react/20/solid';
import EditData from './EditData';

export default function ViewFileData({ file }) {
const [editOriginal, setEditOriginal] = useState(false);
const [editNew, setEditNew] = useState(false);
const [editBoth, setEditBoth] = useState(false);

return (
  <div className="flex px-2 py-6 gap-4 w-full">
    <div className="h-4 w-4 py-1 px-2 mt-1 flex items-center justify-center bg-primary rounded-full text-xxs text-white">
      {file.number}
    </div>
    <div className="w-full">
      {editOriginal && (
        <EditData customFuction={() => { setEditOriginal(false); }} data={file.original} />
)}
      {editNew
         && (
         <EditData customFuction={() => { setEditNew(false); }} data={file.new} />
)}
      {editBoth && (
      <EditData customFuction={() => { setEditBoth(false); }} data={`===== original\n${file.original}\n\n===== new\n${file.new}`} both />
)}
      {!editBoth && !editNew && !editOriginal && (
      <div className="flex">
        <div className="flex flex-col gap-2">
          <div className=" flex gap-2">
            <span className="tracking-wide">
              {file.original}
            </span>
          </div>
          <div className="flex gap-2 items-end">
            <span className="text-success tracking-wide">
              {file.new}
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between self-stretch">
          <button
            type="button"
            onClick={() => {
            setEditOriginal((prevState) => !prevState);
}}
            className="bg-black w-6 h-6 rounded-full flex justify-center items-center"
          >
            <ArrowSmallUpIcon className="w-4 h-4 text-white " />
          </button>
          <button
            type="button"
            className="bg-blue-500 w-6 h-6 rounded-full flex justify-center items-center"
            onClick={() => {
              setEditBoth(true);
}}
          >
            <ArrowsUpDownIcon className="w-4 h-4 text-white" />
          </button>
          <button
            className="bg-success w-6 h-6 rounded-full flex justify-center items-center"
            type="button"
            onClick={() => {
setEditNew((prevState) => !prevState);
}}
          >
            <ArrowSmallDownIcon className="w-4 h-4 text-white " />
          </button>
        </div>
      </div>
)}
    </div>
  </div>
);
}
