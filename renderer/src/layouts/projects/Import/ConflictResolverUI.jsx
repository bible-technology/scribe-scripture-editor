import React, {
 useRef, Fragment, useState, useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
// import * as logger from '../../../logger';
import ConflictSideBar from './ConflictSideBar';
import { parseObs, updateAndSaveStory } from './parseObsStory';
import ConflictEditor from './ConflictEditor';

function ConflictResolverUI({ conflictData, setConflictPopup }) {
  const cancelButtonRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState([]);
  const [FileContentOrginal, setFileContentOrginal] = useState([]);
  const [resolvedFileNames, setResolvedFileNames] = useState([]);
  const [enableSave, setEnableSave] = useState();

  const removeSection = () => {
    setConflictPopup({
      open: false,
      data: undefined,
    });
  };

  const saveCurrentStory = async () => {
    await updateAndSaveStory(
      selectedFileContent,
      conflictData.data.currentUser,
      conflictData.data.projectName,
      conflictData.data.targetPath,
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
          setSelectedFileContent(data);
          setEnableSave(false);
          setFileContentOrginal(JSON.stringify(data));
        }
      })();
    }
  }, [conflictData, selectedFileName]);

  return (
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
        open={conflictData.status}
        onClose={removeSection}
      >

        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto">
          <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 ">
            <h1 className="text-white font-bold text-sm">RESOLVE CONFLICT</h1>
            <div aria-label="resources-search" className="pt-1.5 pb-[6.5px]  bg-secondary text-white text-xs tracking-widest leading-snug text-center" />
            {/* close btn section */}
          </div>

          {/* contents section */}
          <div className="flex border bg-white">
            <ConflictSideBar
              conflictData={conflictData}
              setSelectedFileName={setSelectedFileName}
              selectedFileName={selectedFileName}
              resolvedFileNames={resolvedFileNames}
            />
            <div className="w-full">
              <div className="h-[80vh] w-full overflow-x-scroll bg-gray-50 items-center p-3 justify-between">
                <ConflictEditor
                  selectedFileContent={selectedFileContent}
                  setSelectedFileContent={setSelectedFileContent}
                  selectedFileName={selectedFileName}
                  FileContentOrginal={FileContentOrginal}
                  setEnableSave={setEnableSave}
                />
              </div>
              <div className="h-[6vh] w-full flex  justify-end items-center pr-10 gap-5">
                {conflictData?.data?.files?.filepaths?.length === resolvedFileNames.length && (
                  <div
                    className="px-10 py-2 rounded-md bg-green-500 cursor-pointer hover:bg-green-600"
                    role="button"
                    tabIndex={-2}
                    onClick={removeSection}
                  >
                    All conflicts Resolved : Done
                  </div>
                )}

                <button
                  className={`px-10 py-2 rounded-md ${(enableSave && !resolvedFileNames.includes(selectedFileName)) ? ' bg-green-500 cursor-pointer hover:bg-green-600' : 'bg-gray-200 text-gray-600' } `}
                  onClick={saveCurrentStory}
                  type="button"
                  disabled={!enableSave || resolvedFileNames.includes(selectedFileName)}
                >
                  {resolvedFileNames.includes(selectedFileName) ? 'Resolved' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default ConflictResolverUI;
