/* eslint-disable no-unused-vars */
import React, {
  useRef, useState, useContext, Fragment,
} from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';
import { SnackBar } from '@/components/SnackBar';
import ScriptureContentPicker from '@/components/ScriptureContentPicker/ScriptureContentPicker';
import ScriptureContentPickerConfig from '@/components/ScriptureContentPicker/ScriptureContentPickerConfig';
import InnerFramePopup from '@/layouts/editor/InnerFramePopup';
// import * as logger from '../../logger';

export default function FramedBouquetPickerPopup(
  {
    openBouquetPicker,
    setOpenBouquetPicker,
  },
) {
  const cancelButtonRef = useRef(null);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [error, setError] = useState('');

  const defaultSource = {
    bible: {
      'my-en-bible': {
        description: 'An English Bible I am translating myself',
        language: 'en',
        src: {
          type: 'fs',
          path: '/home/user/Documents/Proskomma/test.txt',
        },
        books: ['GEN', 'EXO', 'LEV'],
      },
      'another-bible': {
        description: 'A French Bible I am plagiarizing',
        language: 'fr',
        src: {
          type: 'url',
          url: 'https://git.door43.org/unfoldingWord/en_ult/raw/branch/master/03-LEV.usfm',
        },
        books: ['MRK'],
      },
      'pi-bible': {
        description: 'A French Bible I am plagiarizing',
        language: 'fr',
        src: {
          type: 'url',
          url: 'https://www.xenizo.fr/leur_bible_afeswx',
        },
        books: ['MRK'],
      },
    },
    tNotes: {},
    OBS: {},
    'OBS-TN': {},
  };

  const [source, setSource] = useState(defaultSource);

  const removeSection = () => {
    setOpenBouquetPicker(false);
  };

  const handleSelect = () => {
    console.log("Hello !")
  };

  return (
    <>
      <Transition
        show={openBouquetPicker}
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
          open={openBouquetPicker}
          onClose={removeSection}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto">
            <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 ">
              {/* <h1 className="text-white font-bold text-sm">{t('TODO')}</h1> */}
              <h1 className="text-white font-bold text-sm">Bouquet picker</h1>
              <div aria-label="resources-search" className="pt-1.5 pb-[6.5px]  bg-secondary text-white text-xs tracking-widest leading-snug text-center" />
              <button
                type="button"
                className="bg-primary absolute h-full rounded-tr-lg right-0 text-white"
                onClick={removeSection}
              >
                <XMarkIcon className="mx-3 h-5 w-5" />

              </button>
            </div>
            <div className="flex border bg-white">
              <div className="h-[85vh] w-full overflow-x-scroll bg-gray-50 items-center p-3 justify-between">
                <div className="bg-gray-50 items-center p-3 justify-between w-full h-full">
                  {/* TODO : import bouquet picker here */}
                  <div>
                    <div>
                      <h4>ScriptureContentPickerConfig</h4>
                      <div className={'picker-config-container'}>
                        <ScriptureContentPickerConfig source={source} setSource={setSource} />
                      </div>
                    </div>
                    <div>
                      <h4>ScriptureContentPicker</h4>
                      <div className={'picker-container'}>
                        <ScriptureContentPicker source={source} onSelect={handleSelect} />
                      </div>
                    </div>
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
