import React, {
 useRef, Fragment, useState, useEffect,
} from 'react';
import { SnackBar } from '@/components/SnackBar';
import { Dialog, Transition } from '@headlessui/react';
import * as logger from '../../../logger';
import ConflictSideBar from './ConflictSideBar';
import { parseObs, updateAndSaveStory } from './parseObsStory';
import ConflictEditor from './ConflictEditor';

function ConflictResolverUI({ conflictData, setConflictPopup }) {
  console.log({ conflictData });

  const cancelButtonRef = useRef(null);
  const [selectedFileName, setSelectedFileName] = useState();
  const [selectedFileContent, setSelectedFileContent] = useState([]);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [error, setError] = useState('');

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
        // console.log('Story parsed :', { data });
        if (data) {
          setSelectedFileContent(data);
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
              />
              <div className="w-full">
                <div className="h-[80vh] w-full overflow-x-scroll bg-gray-50 items-center p-3 justify-between">
                  <ConflictEditor selectedFileContent={selectedFileContent} setSelectedFileContent={setSelectedFileContent} />
                </div>
                <div className="h-[6vh] w-full flex  justify-end items-center pr-10 gap-5">
                  <div
                    className="px-10 py-2 rounded-md bg-red-500 cursor-pointer hover:bg-red-600"
                    role="button"
                    tabIndex={-2}
                    onClick={removeSection}
                  >
                    Close Window : Only for Testing
                  </div>
                  {/* Remove this close button  */}
                  <div
                    className="px-10 py-2 rounded-md bg-green-500 cursor-pointer hover:bg-green-600"
                    role="button"
                    tabIndex={-2}
                    onClick={saveCurrentStory}
                  >
                    Save
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
      <SnackBar
        openSnackBar={openSnackBar}
        setOpenSnackBar={setOpenSnackBar}
        snackText={snackText}
        setSnackText={setSnackText}
        error={error}
      />
    </>
  );
}

export default ConflictResolverUI;
