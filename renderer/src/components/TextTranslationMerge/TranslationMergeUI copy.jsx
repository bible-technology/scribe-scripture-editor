/* eslint-disable no-nested-ternary */
import React, {
  useRef, Fragment, useState, useEffect, useContext, useMemo,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AutographaContext } from '@/components/context/AutographaContext';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { readUsfmFile } from '@/core/projects/userSettings';
import DiffMatchPatch from 'diff-match-patch';
import localforage from 'localforage';
import TranslationMergNavBar from './TranslationMergNavBar';
import * as logger from '../../logger';
import useGetCurrentProjectMeta from '../Sync/hooks/useGetCurrentProjectMeta';
import LoadingScreen from '../Loading/LoadingScreen';
import ImportUsfmUI from './ImportUsfmUI';
import UsfmConflictEditor from './UsfmConflictEditor';
import { processAndIdentiyVerseChangeinUSFMJsons } from './processUsfmObjs';
import packageInfo from '../../../../package.json';

const grammar = require('usfm-grammar');

function TranslationMergeUI({ conflictData, setConflictPopup }) {
  console.log({ conflictData });
  const [importedUsfmFolderPath, setImportedUsfmFolderPath] = useState([]);
  const [usfmJsons, setUsfmJsons] = useState({
    imported: null,
    current: null,
  });
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [conflictedChapters, setConflictedChapters] = useState([]);
  const [resolvedChapters, setResolvedChapters] = useState([]);
  const [chapterResolveDone, setChapterResolveDone] = useState(false);

  const [savedConflictsBooks, setSavedConflictsBooks] = useState([]);
  const [existImportedBook, setExistImportedBook] = useState({ status: false, bookId: null });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [finishedConflict, setFinishedConflict] = useState(false);

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
    currentProjectMeta, selectedBookId, usfmJsons,
  });

  const modalClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
  };

  const handleStartOver = () => {
    console.log('start over called ----');
    setExistImportedBook({ status: false, bookId: null });
    modalClose();
  };

  const handleOnAbortMerge = (buttonName) => {
    console.log({ buttonName }, model);
    if (model.buttonName === t('label-abort')) {
      setError('');
      setUsfmJsons({});
      setImportedUsfmFolderPath([]);
      setOpenTextTranslationMerge({ open: false, meta: null });
      modalClose();
    } else {
      handleStartOver();
    }
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

  const readMergeDirOrSingleFile = async (readDir = true, fileName = null) => {
    const fs = window.require('fs');
    const { id, name } = openTextTranslationMerge.meta;
    const _projectName = `${name}_${id[0]}`;
    const newpath = localStorage.getItem('userPath');
    const path = require('path');

    const user = await localforage.getItem('userProfile');
    if (user?.username) {
      const USFMMergeDirPath = path.join(newpath, packageInfo.name, 'users', user?.username, '.merge-usfm');
      if (!fs.existsSync(path.join(USFMMergeDirPath, _projectName))) {
        return null;
      }
      if (readDir) {
        const files = fs.readdirSync(path.join(USFMMergeDirPath, _projectName));
        console.log({ files });
        return files;
      }
      // read file - json
      let jsonFile = fs.readFileSync(path.join(USFMMergeDirPath, _projectName, fileName));
      jsonFile = JSON.parse(jsonFile);
      return jsonFile;
    }
    console.error('no user : ', { user });
  };

  useEffect(() => {
    if (openTextTranslationMerge?.meta) {
      const { id, name } = openTextTranslationMerge.meta;
      (async () => {
        await getProjectMeta(`${name}_${id[0]}`);
        // check for existing merge and display ui based on that
        const mergeDirContents = await readMergeDirOrSingleFile();
        setSavedConflictsBooks(mergeDirContents);
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

  const resumeConflictResolution = async (bookId) => {
    // bookid (same as backendfilename) - > mat.json
    console.log('book id : ', bookId);
    const { usfmJsons } = await readMergeDirOrSingleFile(false, bookId);
    setUsfmJsons(usfmJsons);
    setExistImportedBook({ status: false, bookId: null });

    const _conflictedBooks = [];
    setSelectedBookId(usfmJsons.mergeJson.book.bookCode.toLowerCase());
    usfmJsons.mergeJson.chapters.forEach((chapter, index) => {
      chapter.contents.forEach((content) => {
        if (content.verseNumber) {
          if (content?.resolved && !content?.resolved?.status) {
            !_conflictedBooks.includes(chapter.chapterNumber) && _conflictedBooks.push(chapter.chapterNumber);
          }
        }
      });
    });

    setConflictedChapters(_conflictedBooks);
    setFinishedConflict(false);
    console.log({ usfmJsons });
  };

  async function parseUsfm(usfm) {
    const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
    const isJsonValid = myUsfmParser.validate();
    return { valid: isJsonValid, data: myUsfmParser.toJSON() };
  }

  async function parseJsonToUsfm(json) {
    const myUsfmParser = new grammar.JSONParser(json);
    const usfm = myUsfmParser.toUSFM();
    return usfm;
  }

  const parseFiles = async () => {
    // parse imported
    const fs = window.require('fs');
    const IncomingUsfm = fs.readFileSync(importedUsfmFolderPath[0], 'utf8');
    if (IncomingUsfm) {
      const importedJson = await parseUsfm(IncomingUsfm);
      // const normalisedIncomingUSFM = await parseJsonToUsfm(importedJson.data);
      if (!importedJson.valid) {
        setError('Imported Usfm is invalid');
      } else if (!Object.keys(currentProjectMeta?.type?.flavorType?.currentScope).includes(importedJson?.data?.book?.bookCode)
        && !Object.keys(currentProjectMeta?.type?.flavorType?.currentScope).includes(importedJson?.data?.book?.bookCode?.toLowerCase())) {
        setError('Imported USFM is not in the scope of Current Project');
      } else {
        // Parse current project same book
        const importedBookCode = `${importedJson.data.book.bookCode.toLowerCase()}.usfm`;

        setError('');
        setUsfmJsons((prev) => ({ ...prev, imported: importedJson.data }));
        setSelectedBookId(importedJson.data.book.bookCode.toLowerCase());
        const currentBookPath = Object.keys(currentProjectMeta?.ingredients).find((code) => code.toLowerCase().endsWith(importedBookCode));
        const { id, name } = openTextTranslationMerge.meta;
        const currentBookUsfm = await readUsfmFile(currentBookPath, `${name}_${id[0]}`);
        // console.log('FOUND ====> ', { currentBookPath, currentBookUsfm });
        if (currentBookUsfm) {
          const currentJson = await parseUsfm(currentBookUsfm);
          // const currentNormalisedUsfm = await parseJsonToUsfm(currentJson.data);

          // generate the merge object with current , incoming , merge verses
          // const mergeJson = JSON.parse(JSON.stringify(currentJson.data));
          const processOutArr = await processAndIdentiyVerseChangeinUSFMJsons(importedJson.data, currentJson.data).catch((err) => {
            console.log('process usfm : ', err);
          });
          const mergeJson = processOutArr[0];
          console.log('processOutArr[1] : ', processOutArr[1]);
          setConflictedChapters(processOutArr[1]);

          if (savedConflictsBooks.includes(`${importedJson.data.book.bookCode.toLowerCase()}.json`)) {
            setExistImportedBook({ status: true, bookId: importedJson.data.book.bookCode.toLowerCase() });
            console.log('existing book');
            setModel({
              openModel: true,
              title: t('modal-title-abort-conflict-resolution'),
              confirmMessage: t('msg-conflict-resolution-duplicate-book', { bookId: importedJson.data.book.bookCode.toUpperCase() }),
              buttonName: t('label-startover'),
            });
          }

          currentJson && currentJson?.valid && setUsfmJsons((prev) => ({ ...prev, current: currentJson.data, mergeJson }));

          // compare usfms to check conflcit or not
          // const diffOut = await dmp.diff_main(normalisedIncomingUSFM, currentNormalisedUsfm);
          // setUsfmJsons((prev) => ({ ...prev, diffOut }));
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
      setFinishedConflict(false);
    }
  }, [importedUsfmFolderPath, currentProjectMeta]);

  useEffect(() => {
    if (conflictedChapters.length === resolvedChapters.length) {
      setFinishedConflict(true);
    }
  }, [conflictedChapters.length, resolvedChapters.length]);

  const resolveAndMarkDoneChapter = () => {
    setResolvedChapters((prev) => [...prev, selectedChapter]);
    // store the jsons to the backend (/.merge/projectName/BookID.json)
    const fs = window.require('fs');
    const { id, name } = openTextTranslationMerge.meta;
    const _projectName = `${name}_${id[0]}`;
    const newpath = localStorage.getItem('userPath');
    const path = require('path');
    localforage.getItem('userProfile').then((user) => {
      const USFMMergeDirPath = path.join(newpath, packageInfo.name, 'users', user?.username, '.merge-usfm');
      if (!fs.existsSync(path.join(USFMMergeDirPath, _projectName))) {
        fs.mkdirSync(path.join(USFMMergeDirPath, _projectName), { recursive: true });
      }
      console.log('write this book :', `${selectedBookId}.json`);
      fs.writeFileSync(path.join(USFMMergeDirPath, _projectName, `${selectedBookId}.json`), JSON.stringify({ usfmJsons }));
    });
  };

  const handleFinishedResolution = async () => {
    try {
      const path = require('path');
      const fs = window.require('fs');

      const { id, name } = openTextTranslationMerge.meta;
      const _projectName = `${name}_${id[0]}`;
      const newpath = localStorage.getItem('userPath');

      const user = await localforage.getItem('userProfile');
      if (user?.username) {
        const USFMMergeDirPath = path.join(newpath, packageInfo.name, 'users', user?.username, '.merge-usfm');
        const currentJsonFile = `${existImportedBook.bookId}.json`;
        const OrgProjectFilePath = path.join(newpath, packageInfo.name, 'users', user?.username, 'projects', _projectName, 'ingredients', existImportedBook.bookId.toUpperCase());

        // convert usfmJson.mergeJson to norml parsedJson and convert to usfm

        const resolvedTempJson = JSON.parse(JSON.stringify(usfmJsons.mergeJson));

        for (let index = 0; index < resolvedTempJson.chapters.length; index++) {
          const chObjContents = usfmJsons.mergeJson.chapters[index].contents;
          for (let j = 0; j < chObjContents.length; j++) {
            let verseObj = chObjContents[j];
            if (verseObj?.resolved) {
              const tempResolvedContent = verseObj.resolved.resolvedContent;
              verseObj = { ...tempResolvedContent };
            }
          }
        }

        const usfm = await parseJsonToUsfm(resolvedTempJson);
        fs.writeFileSync(OrgProjectFilePath, usfm, 'utf-8');

        // delete saved json in merge dir - check if it is the last one then delete folder too
        if (!fs.existsSync(path.join(USFMMergeDirPath, _projectName))) {
          const files = fs.readdirSync(path.join(USFMMergeDirPath, _projectName));
          if (files?.length > 1) {
            // delete single file
            await fs.unlinkSync(path.join(USFMMergeDirPath, currentJsonFile));
          } else {
            // delete dir
            await fs.rmdirSync(USFMMergeDirPath, { recursive: true }, (err) => {
              if (err) {
                throw new Error(`Error delete .usfm-merge dir :  ${err}`);
              }
            });
          }
        }
      }
    } catch (err) {
      console.log('error : finishd move file ---> ', err);
    }
  };

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
                <TranslationMergNavBar
                  currentUsfmJson={!existImportedBook.status ? usfmJsons.current : {}}
                  conflictedChapters={!existImportedBook.status ? conflictedChapters : []}
                  resolvedChapters={resolvedChapters}
                  selectedChapter={selectedChapter}
                  setSelectedChapter={setSelectedChapter}
                />

                <div className="col-span-5 h-full flex flex-col gap-2">
                  <div className="border-2 border-black rounded-md grow p-2">

                    {loading ? (<LoadingScreen />) : (

                      (usfmJsons.current && usfmJsons.imported && !existImportedBook.status) ? (
                        <div className="h-[70vh] overflow-auto">
                          <UsfmConflictEditor
                            usfmJsons={usfmJsons}
                            currentProjectMeta={currentProjectMeta}
                            selectedChapter={selectedChapter}
                            setUsfmJsons={setUsfmJsons}
                            setChapterResolveDone={setChapterResolveDone}
                            resolvedChapters={resolvedChapters}
                          />
                        </div>
                      )
                        : (
                          <ImportUsfmUI
                            buttonName={`${t('btn-import')} Usfm`}
                            currentProjectMeta={currentProjectMeta}
                            handleImportUsfm={handleImportUsfm}
                            savedConflictsBooks={savedConflictsBooks}
                            resumeConflictResolution={resumeConflictResolution}
                          />
                        )

                    )}

                  </div>
                  <div className="border-2 border-black rounded-md h-[50px] p-1 flex justify-between">
                    <p className="text-red-500 text-sm">{error}</p>
                    {usfmJsons.current && usfmJsons.imported && (
                      finishedConflict ? (

                        <button
                          type="button"
                          onClick={() => handleFinishedResolution()}
                          className="px-4 py-1  rounded-md uppercase bg-success/75 cursor-pointer hover:bg-success text-white"
                        >
                          Finish
                        </button>
                      ) : (

                        <button
                          type="button"
                          onClick={() => resolveAndMarkDoneChapter()}
                          disabled={!chapterResolveDone}
                          className={`px-4 py-1  rounded-md uppercase 
                        ${chapterResolveDone ? 'bg-success/75 cursor-pointer hover:bg-success text-white' : 'bg-gray-300 text-black cursor-not-allowed '} 
                        `}
                        >
                          Resolve
                        </button>
                      )
                    )}
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
        closeModal={() => handleOnAbortMerge(model.buttonName)}
      />
    </>
  );
}

export default TranslationMergeUI;
