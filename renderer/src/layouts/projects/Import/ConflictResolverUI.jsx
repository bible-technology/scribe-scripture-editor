import React, {
  useRef, Fragment, useState, useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import * as logger from '../../../logger';
import ConflictSideBar from './ConflictSideBar';
import { copyFilesTempToOrginal, parseObs, updateAndSaveStory } from './mergeObsUtils';
import ConflictEditor from './ConflictEditor';

function ConflictResolverUI({ conflictData, setConflictPopup }) {
  const cancelButtonRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState([]);
  const [FileContentOrginal, setFileContentOrginal] = useState([]);
  const [resolvedFileNames, setResolvedFileNames] = useState([]);
  const [enableSave, setEnableSave] = useState();
  const [finishingMerge, setFinishingMerge] = useState(false);
  const [model, setModel] = React.useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  const finishMergeMoveFiletoProject = async (conflictData) => {
    logger.debug('conflictResolverUI.jsx', 'in finish merge process and copy final data to project');
    setFinishingMerge(true);
    await copyFilesTempToOrginal(conflictData);
    setFinishingMerge(false);
    logger.debug('conflictResolverUI.jsx', 'finished merge . copy done. delete temp dir and .git');
  };

  const modelClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
  };

  const resetStates = async () => {
    setSelectedFileContent();
    setSelectedFileName();
    setFileContentOrginal();
    setResolvedFileNames();
    setEnableSave();
  };

  const abortConflictResolution = async (conflictData) => {
    logger.debug('conflictResolverUI.jsx', 'in abort conflict');
    const fs = window.require('fs');
    modelClose();
    setConflictPopup({
      open: false,
      data: undefined,
    });
    await resetStates();
    await fs.rmdirSync(conflictData.data.mergeDirPath, { recursive: true }, (err) => {
      if (err) {
        throw new Error(`Merge Dir exist. Failed to remove :  ${err}`);
      }
    });
  };

  const removeSection = async (abort = false) => {
    if (abort === false) {
      await finishMergeMoveFiletoProject(
        conflictData,
      );
      setConflictPopup({
        open: false,
        data: undefined,
      });
      await resetStates();
    } else {
      // popup with warning
      setModel({
        openModel: true,
        title: 'Abort Conflict Resolution',
        confirmMessage: 'Do you want to abort conflict Resolution process. If you abort , you will loose all your progress and need to start over.',
        buttonName: 'Abort',
      });
    }
  };

  const saveCurrentStory = async () => {
    logger.debug('conflictResolverUI.jsx', `saving current story after conflict resolution ${selectedFileName}`);
    await updateAndSaveStory(
      selectedFileContent,
      conflictData.data.currentUser,
      conflictData.data.projectName,
      conflictData.data.mergeDirPath,
      selectedFileName,
    );
    setResolvedFileNames((prev) => [...prev, selectedFileName]);
  };

  useEffect(() => {
    if (conflictData?.data?.files?.filepaths?.length > 0) {
      setSelectedFileName(conflictData?.data?.files?.filepaths?.[0]);
    }
  }, [conflictData]);

  useEffect(() => {
    if (selectedFileName && conflictData) {
      (async () => {
        const data = await parseObs(conflictData, selectedFileName);
        if (data) {
          logger.debug('conflictResolverUI.jsx', `fetching conflict data for file  ${selectedFileName} done`);
          setSelectedFileContent(data);
          setEnableSave(false);
          setFileContentOrginal(JSON.stringify(data));
        }
      })();
    }
  }, [conflictData, selectedFileName]);

  return (
    <>

      <Transition
        show={conflictData.open}
        as={Fragment}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          static
          open={conflictData.open}
          onClose={() => removeSection(true)}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto items-center justify-center ">
            <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 w-[80%]">
              <h1 className="text-white font-bold text-sm">RESOLVE CONFLICT</h1>
              <div aria-label="resources-search" className="pt-1.5 pb-[6.5px]  bg-secondary text-white text-xs tracking-widest leading-snug text-center" />
              {/* close btn section */}
              <button
                type="button"
                className="focus:outline-none w-9 h-9 bg-black text-white p-2"
                onClick={() => removeSection(true)}
              >
                <XMarkIcon />
              </button>
            </div>

            {/* contents section */}
            <div className="flex border bg-white h-[86vh] gap-2 p-2 w-[80%]">
              {/* sidebar and Editor */}
              <div className="min-w-[12vw]">
                <ConflictSideBar
                  conflictData={conflictData}
                  setSelectedFileName={setSelectedFileName}
                  selectedFileName={selectedFileName}
                  resolvedFileNames={resolvedFileNames}
                />
              </div>

              <div className="w-full bg-gray-50 flex flex-col">
                <ConflictEditor
                  selectedFileContent={selectedFileContent}
                  setSelectedFileContent={setSelectedFileContent}
                  selectedFileName={selectedFileName}
                  FileContentOrginal={FileContentOrginal}
                  setEnableSave={setEnableSave}
                  resolvedFileNames={resolvedFileNames}
                />
                <div className="h-[6vh] w-full flex justify-end items-center pr-10 gap-5">
                  {conflictData?.data?.files?.filepaths?.length === resolvedFileNames?.length && (
                    <div
                      className="px-10 py-2 rounded-md bg-success/75 cursor-pointer hover:bg-success"
                      role="button"
                      tabIndex={-2}
                      onClick={() => removeSection()}
                    >
                      {finishingMerge
                    ? (
                      <div
                        className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-neutral-100 motion-reduce:animate-[spin_1.5s_linear_infinite]"
                        role="status"
                      />
                    )
                    : <>Done</>}
                    </div>
                  )}

                  <button
                    className={`px-10 py-2 rounded-md ${(enableSave && !resolvedFileNames.includes(selectedFileName)) ? ' bg-success/75 cursor-pointer hover:bg-success' : 'bg-gray-200 text-gray-600'} `}
                    onClick={saveCurrentStory}
                    type="button"
                    disabled={!enableSave || resolvedFileNames.includes(selectedFileName)}
                  >
                    {resolvedFileNames?.includes(selectedFileName) ? 'Resolved' : 'Save'}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modelClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => abortConflictResolution(conflictData)}
      />
    </>
  );
}

export default ConflictResolverUI;
