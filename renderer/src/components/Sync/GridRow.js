import React from 'react';
import { classNames } from '@/util/classNames';
import moment from 'moment';
import FolderIcon from '@/icons/folder.svg';

function GridRow({
    title, lastSync, selected, isUpload, uploadPercentage = 0,
   }) {
  return (

    <>
      <div className="flex gap-2 justify-between items-center px-5 py-4 border-b border-gray-100 cursor-pointer">
        <span
          id={title}
          className={classNames(
                   selected ? 'text-primary' : 'text-gray-800',
                   'capitalize w-full flex items-center gap-5',
                 )}
        >
          <FolderIcon className="w-4 h-4" />
          {title}
        </span>

        <span
          title={(lastSync && lastSync !== null) ? lastSync.username : ''}
          className={classNames(
                    selected ? 'text-primary' : '',
                    'text-xs font-semibold  text-right w-40',
                  )}
        >
          {(lastSync && lastSync !== null) ? moment.utc(lastSync.lastSynced).local().startOf('seconds').fromNow() : '-'}
        </span>

      </div>
      {isUpload && (
      <div className="w-full bg-gray-200 h-1">
        <div
          className="bg-primary h-1"
          style={{ width: `${uploadPercentage}%` }}
        />
      </div>
             )}
    </>

  );
}

export default GridRow;
