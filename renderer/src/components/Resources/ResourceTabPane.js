import React, { Fragment, useState } from 'react';
import { Tab } from '@headlessui/react';
import { classNames } from '@/util/classNames';

import DownloadResourcePopUp from '@/components/Resources/ResourceUtils/DownloadResourcePopUp';
import ImportResource from '@/components/Resources/ImportResource';
import PlusIcon from '@/icons/Common/Plus.svg';
import ObsBibleAudioTab from './ObsBibleAudioTab';
import * as logger from '../../logger';

export default function ResourceTabPane({
  selectResource,
  filteredBibleObsAudio,
  removeSection,
  loading,
  handleRowSelect,
  openImportResourcePopUp,
  closeImportPopUp,
  setOpenImportResourcePopUp,
  setOpenResourcePopUp,
  setLoading,
  subMenuItems,
  setSubMenuItems,
  setfilteredBibleObsAudio,
}) {
  const [isOpenDonwloadPopUp, setIsOpenDonwloadPopUp] = useState(false);
  const [resourceIconClick, setResourceIconClick] = useState(false);
  const openResourceDialogBox = () => {
    if (selectResource === 'bible' || selectResource === 'obs') {
      logger.debug('DownloadResourcePopUp.js', 'Calling bible resource pop up');
      setIsOpenDonwloadPopUp(true);
    }
  };

  return (
    <div className="bg-gray-50 items-center p-3 justify-between w-full h-full">
      <Tab.Group>
        <Tab.List className="flex space-x-0 rounded-xl ">
          <Tab className={({ selected }) => classNames(
            'w-20 rounded-t-lg flex items-center justify-center font-bold py-2 text-xs leading-5 text-white uppercase',
            'ring-offset-2 ring-offset-white focus:outline-none z-50',
            selected
              ? 'bg-primary text-white'
              : 'text-black bg-gray-200',
          )}
          >
            {selectResource}
          </Tab>
          {selectResource !== 'audio'
          && (
          <Tab as={Fragment}>
            {({ selected }) => (
              <button
                className={classNames(
                  'w-32 rounded-t-lg flex items-center justify-center gap-2 font-bold py-2 text-xs leading-5 text-white uppercase',
                  'ring-offset-2 ring-offset-white focus:outline-nonez-50 ',
                  selected
                    ? 'bg-primary text-white'
                    : 'text-black bg-gray-200',
                )}
                type="button"
                onClick={() => { openResourceDialogBox(); setResourceIconClick(!resourceIconClick); }}
              >
                <PlusIcon
                  className="w-4 h-4"
                  aria-hidden="true"
                />
                Resource
              </button>
            )}
          </Tab>
)}
          <Tab
            className={({ selected }) => classNames(
              'w-32 rounded-t-lg flex items-center justify-center gap-2 font-bold py-2 text-xs leading-5 text-white uppercase',
              'ring-offset-2 ring-offset-white focus:outline-none z-50',
              selected
                ? 'bg-primary text-white'
                : 'text-black bg-gray-200',
            )}
            type="button"
            onClick={() => { setOpenImportResourcePopUp(true); setResourceIconClick(!resourceIconClick); }}
          >
            <PlusIcon
              className="w-4 h-4"
              aria-hidden="true"
            />
            Collection
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel className="p-4 bg-white">
            <ObsBibleAudioTab
              selectResource={selectResource}
              filteredBibleObsAudio={filteredBibleObsAudio}
              setfilteredBibleObsAudio={setfilteredBibleObsAudio}
              removeSection={removeSection}
              loading={loading}
              setLoading={setLoading}
              handleRowSelect={handleRowSelect}
              setSubMenuItems={setSubMenuItems}
              subMenuItems={subMenuItems}
            />
          </Tab.Panel>
          {selectResource !== 'audio'
            && (
            <Tab.Panel className="p-4 bg-white">
              <DownloadResourcePopUp
                selectResource={selectResource}
                isOpenDonwloadPopUp={isOpenDonwloadPopUp}
                setIsOpenDonwloadPopUp={setIsOpenDonwloadPopUp}
              />
            </Tab.Panel>
)}
          <Tab.Panel className="p-4 bg-white">
            <ImportResource
              open={openImportResourcePopUp}
              closePopUp={closeImportPopUp}
              openPopUp={setOpenImportResourcePopUp}
              setOpenResourcePopUp={setOpenResourcePopUp}
              setLoading={setLoading}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}
