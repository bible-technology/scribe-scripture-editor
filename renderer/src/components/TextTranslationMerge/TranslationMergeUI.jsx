import React, {
  useRef, Fragment, useState, useEffect, useContext,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AutographaContext } from '@/components/context/AutographaContext';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { readUsfmFile } from '@/core/projects/userSettings';
import TranslationMergNavBar from './TranslationMergNavBar';
import * as logger from '../../logger';
import useGetCurrentProjectMeta from '../Sync/hooks/useGetCurrentProjectMeta';
import LoadingScreen from '../Loading/LoadingScreen';

const grammar = require('usfm-grammar');

function TranslationMergeUI() {
  const [importedUsfmFolderPath, setImportedUsfmFolderPath] = useState([]);
  const [usfmJsons, setUsfmJsons] = useState({
    imported: null,
    current: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    states: {
      openTextTranslationMerge,
    },
    action: {
      setOpenTextTranslationMerge,
    },
  } = useContext(AutographaContext);

  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [model, setModel] = React.useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  const {
    state: { currentProjectMeta },
    actions: { getProjectMeta },
  } = useGetCurrentProjectMeta();

  console.log({
    openTextTranslationMerge, currentProjectMeta, importedUsfmFolderPath, usfmJsons,
  });

  const modalClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
  };

  const removeSection = async (abort = false) => {
    if (abort === false) {
      // pass
    } else {
      // popup with warning
      setModel({
        openModel: true,
        title: t('modal-title-abort-conflict-resolution'),
        confirmMessage: t('msg-abort-conflict-resolution'),
        buttonName: t('label-abort'),
      });
    }
  };

  const handleOnAbortMerge = () => {
    setError('');
    setUsfmJsons({ imported: null, current: null });
    setImportedUsfmFolderPath([]);
    setOpenTextTranslationMerge({ open: false, meta: null });
    modalClose();
  };

  useEffect(() => {
    console.log('in call meta : ');
    if (openTextTranslationMerge?.meta) {
      const { id, name } = openTextTranslationMerge.meta;
      (async () => {
        await getProjectMeta(`${name}_${id[0]}`);
      })();
    }
  }, []);

  const openFileDialogSettingData = async () => {
    logger.debug('translationMergeUI.js', 'Inside openFileDialogSettingData');
    const options = {
      properties: ['openFile'],
      filters: [{ name: 'usfm files', extensions: ['usfm', 'sfm', 'USFM', 'SFM'] }],
    };
    const { dialog } = window.require('@electron/remote');
    const chosenFolder = await dialog.showOpenDialog(options);
    if ((chosenFolder.filePaths).length > 0) {
      logger.debug('translationMergeUI.js', 'Selected the files');
      setImportedUsfmFolderPath(chosenFolder.filePaths);
    } else {
      logger.debug('translationMergeUI.js', 'Didn\'t select any file');
    }
  };

  const handleImportUsfm = () => {
    openFileDialogSettingData();
  };

  async function parseUsfm(usfm) {
    const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
    const isJsonValid = myUsfmParser.validate();
    return { valid: isJsonValid, data: myUsfmParser.toJSON() };
  }

  const parseFiles = async () => {
    // parse imported
    console.log('started parsing');
    const fs = window.require('fs');
    const readUsfm = fs.readFileSync(importedUsfmFolderPath[0], 'utf8');
    if (readUsfm) {
      const importedJson = await parseUsfm(readUsfm);
      if (!importedJson.valid) {
        setError('Imported Usfm is invalid');
      } else if (!Object.keys(currentProjectMeta?.type?.flavorType?.currentScope).includes(importedJson?.data?.book?.bookCode)
        && !Object.keys(currentProjectMeta?.type?.flavorType?.currentScope).includes(importedJson?.data?.book?.bookCode?.toLowerCase())) {
        setError('Imported USFM is not in the scope of Current Project');
      } else {
        setError('');
        setUsfmJsons((prev) => ({ ...prev, imported: importedJson.data }));
        // Parse current project same book
        const importedBookCode = `${importedJson.data.book.bookCode.toLowerCase()}.usfm`;
        const currentBookPath = Object.keys(currentProjectMeta?.ingredients).find((code) => code.toLowerCase().endsWith(importedBookCode));
        const { id, name } = openTextTranslationMerge.meta;
        const currentBookUsfm = await readUsfmFile(currentBookPath, `${name}_${id[0]}`);
        console.log('FOUND ====> ', { currentBookPath, currentBookUsfm });
        if (currentBookUsfm) {
          const currentJson = await parseUsfm(currentBookUsfm);
          currentJson && currentJson?.valid && setUsfmJsons((prev) => ({ ...prev, current: currentJson.data }));
        }
      }
    } else {
      setError('unable to read imported USFM');
    }
    setLoading(false);
  };

  useEffect(() => {
    // get usfm and parse
    if (importedUsfmFolderPath.length === 1 && currentProjectMeta) {
      setLoading(true);
      parseFiles();
    }
  }, [importedUsfmFolderPath, currentProjectMeta]);

  return (
    <>
      <Transition
        show={openTextTranslationMerge.open}
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
          open={openTextTranslationMerge.open}
          onClose={() => removeSection(true)}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex flex-col mx-12 mt-10 fixed inset-0 z-10 overflow-y-auto items-center justify-center ">
            <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 w-[80vw]">
              <h1 className="text-white font-bold text-sm uppercase">{t('label-resolve-conflict')}</h1>
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
            <div className="bg-[#e7e7e7] w-[80vw] h-[80vh]">
              <div className="p-2 h-full border grid grid-cols-6 gap-2">
                <TranslationMergNavBar />
                <div className="col-span-5 h-full flex flex-col gap-2">
                  <div className="border-2 border-black rounded-md grow p-2">

                    {loading ? (<LoadingScreen />) : (
                      <>
                        <div>
                          Project Scope :
                          {currentProjectMeta && Object.keys(currentProjectMeta?.type?.flavorType?.currentScope).map((scope) => (
                            <span className="ml-2" key={scope}>{scope}</span>
                          ))}

                        </div>
                        <button
                          type="button"
                          className="border-2 border-primary rounded-lg px-2 py-1 hover:bg-primary hover:text-white"
                          onClick={handleImportUsfm}
                        >
                          {`${t('btn-import')} Usfm`}
                        </button>
                      </>
                    )}

                  </div>
                  <div className="border-2 border-black rounded-md h-[50px] p-1">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modalClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => handleOnAbortMerge()}
      />
    </>
  );
}

export default TranslationMergeUI;
