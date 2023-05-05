import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Transition, Listbox } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { SnackBar } from '@/components/SnackBar';
import menuStyles from '@/layouts/editor/MenuBar.module.css';
import useAddNotification from '@/components/hooks/useAddNotification';
import PopUpModal from '@/layouts/Sync/PopUpModal';
import * as logger from '../../../../logger';
import CloudUploadIcon from '@/icons/basil/Outline/Files/Cloud-upload.svg';
import CloudCheckIcon from '@/icons/basil/Solid/Files/Cloud-check.svg';
import ProgressCircle from '../../ProgressCircle';
import Door43Logo from '@/icons/door43.svg';
import { getGiteaUsersList, handleEditorSync } from './EditorSyncUtils';
import useGetCurrentProjectMeta from '../../hooks/useGetCurrentProjectMeta';
import { getOrPutLastSyncInAgSettings } from '../../Ag/SyncToGiteaUtils';

function EditorSync({ selectedProject }) {
  const [usersList, setUsersList] = useState([]);
  const [selectedUsername, setselectedUsername] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const [totalUploaded, setTotalUploaded] = useState(0);
  const [uploadStart, setUploadstart] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const [totalFiles, settotalFiles] = useState(0);

  const {
    state: { currentProjectMeta },
    actions: { getProjectMeta },
  } = useGetCurrentProjectMeta();

  const { addNotification } = useAddNotification();

  const callFunction = async () => {
      setIsOpen(false);
      try {
        if (selectedUsername) {
          logger.debug('EditorSync.js', 'Call handleEditorSync Function');
          await handleEditorSync(selectedProject, currentProjectMeta, selectedUsername, {
          settotalFiles, setTotalUploaded, setUploadstart, setUploadDone, addNotification,
          });
          setNotify('success'); setSnackText('Sync SuccessFull'); setOpenSnackBar(true);
          await addNotification('Sync', 'Project Sync Successfull', 'success');
        } else {
          throw new Error('Please select a valid account to sync..');
        }
      } catch (err) {
        logger.debug('EditorSync.js', `Error Sync : ${err}`);
        setNotify('failure');
        setSnackText(err?.message || err);
        setOpenSnackBar(true);
        await addNotification('Sync', err?.message || err, 'failure');
      }
  };

  useEffect(() => {
    if (uploadDone) {
      setTimeout(() => {
        setUploadDone(false);
      }, 3000);
    }
  }, [uploadDone]);

  useEffect(() => {
    (async () => {
      if (!selectedUsername && selectedProject) {
        logger.debug('EditorSync.js', 'In useEffect - get meta, SyncUsersList , lastSyncUser/{}');
        await getProjectMeta(selectedProject);
        const syncUsers = await getGiteaUsersList();
        setUsersList(syncUsers);
        if (currentProjectMeta) {
          const syncObj = await getOrPutLastSyncInAgSettings('get', currentProjectMeta)[0];
          if (syncObj && syncUsers) {
            const currentUserObj = syncUsers?.filter((element) => element.username === syncObj?.username);
            setselectedUsername(currentUserObj[0]);
          } else {
            setselectedUsername({});
          }
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject, currentProjectMeta]);

  return (
    <>
      {uploadStart ? <ProgressCircle currentValue={totalUploaded} totalValue={totalFiles} />
      : (
        // eslint-disable-next-line react/jsx-no-useless-fragment
        <>
          {uploadDone ? (
            <CloudCheckIcon
              fill="green"
              className="h-9 w-9 mx-1"
              aria-hidden="true"
            />
          )
          : (
            <div
              aria-label="add-panels"
              title="Sync Project"
              type="div"
            // className={`group ${menuStyles.btn} `}
              className={`group ${menuStyles.btn}
            transition-all duration-[${uploadDone ? '0ms' : '2000ms' }]${
              uploadDone ? 'opacity-0' : 'opacity-100'}`}
            >
              {/* <button type="button" onClick={() => openPopUpAndFetchSyncUsers()}> */}
              <button type="button" onClick={() => setIsOpen(true)}>
                <CloudUploadIcon
                  fill="currentColor"
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>
          )}
        </>
      )}

      <PopUpModal
        isOpen={isOpen}
        closeFunc={() => setIsOpen(false)}
        head="Sync"
      >
        <>
          <div className="flex flex-row justify-between mt-2 mb-4 items-center">
            { usersList?.length !== 0
            && (
            <p className="text-sm pt-1 text-gray-900">
              Select door43 username
            </p>
          )}
            <div className="">
              <a className="bg-secondary text-white inline-block rounded-t py-2 px-4 text-sm uppercase" href="#a">
                <Door43Logo className="inline mr-2 w-4" fill="#9bc300" />
                {t('label-door43')}
              </a>
            </div>
          </div>

          {/* ------------------------------------ */}
          <div className="mt-3">
            {/* audio project no sync */}
            {currentProjectMeta?.type?.flavorType?.flavor?.name === 'audioTranslation' ? (
              <div className="mt-3">
                <p className="px-2 text-sm">
                  Sorry, Currently Sync is not avaialbe for
                  {' '}
                  <b>Audio Translation</b>
                  {' '}
                  Projects
                </p>
              </div>
                ) : (
                  <>
                    { usersList?.length !== 0
                    && (
                    <Listbox value={selectedUsername} onChange={setselectedUsername}>
                      <div className="relative mt-1 ">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                          <span className="block truncate">{selectedUsername?.username ? selectedUsername?.username : 'choose..'}</span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                              className="h-5 w-5 text-gray-400"
                              aria-hidden="true"
                            />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={React.Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {usersList?.map((user, userIdx) => (
                              <Listbox.Option
                            // eslint-disable-next-line react/no-array-index-key
                                key={userIdx}
                                className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`}
                                value={user}
                              >
                                {({ selected }) => (
                                  <>
                                    <span
                                      className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                                    >
                                      {user.username}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600">
                                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                      </span>
                            ) : null}
                                  </>
                        )}
                              </Listbox.Option>
                    ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                )}

                    { usersList?.length !== 0
                    ? (
                      <div className="mt-3">
                        <p className="px-2 text-sm">
                          don&apos;t find username, please login on
                          {' '}
                          <b className="text-primary underline">
                            <Link href="/sync">sync</Link>
                          </b>
                        </p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <p className="px-2 text-sm">
                          Sorry, No account found for you..
                          <p>
                            please login to start syncing project
                          </p>
                        </p>
                      </div>
                    )}
                  </>
                )}
          </div>
          {/* ------------------------------------ */}
          <div className="mt-4 ">
            <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {usersList?.length !== 0 && currentProjectMeta?.type?.flavorType?.flavor?.name !== 'audioTranslation'
                ? (
                  <button
                    aria-label="confirm-sync"
                    type="button"
                    className="w-20 h-10 bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                    onClick={callFunction}
                  >
                    {t('label-sync')}
                  </button>
                )
                : currentProjectMeta?.type?.flavorType?.flavor?.name !== 'audioTranslation' && (
                  <button
                    href="/sync"
                    type="button"
                    className="w-20 h-10 bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                  >
                    <Link href="/sync">Login</Link>
                  </button>
                )}

              <button
                aria-label="close-sync"
                type="button"
                className="w-20 h-10 mx-2 bg-error leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                onClick={() => setIsOpen(false)}
              >
                {t('btn-cancel')}
              </button>
            </div>
          </div>
        </>
      </PopUpModal>

      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />

    </>
  );
}

EditorSync.propTypes = {
    selectedProject: PropTypes.string,
  };

export default EditorSync;
