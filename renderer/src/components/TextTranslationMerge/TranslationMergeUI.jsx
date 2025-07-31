/* eslint-disable no-nested-ternary */
import React, {
  useRef, Fragment, useState, useEffect,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { XMarkIcon } from '@heroicons/react/24/outline';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { readUsfmFile } from '@/core/projects/userSettings';
import localforage from 'localforage';
import { flushSync } from 'react-dom';
import TranslationMergNavBar from './TranslationMergNavBar';

import LoadingScreen from '../Loading/LoadingScreen';
import UsfmConflictEditor from './UsfmConflictEditor';
import { processAndIdentiyVerseChangeinUSFMJsons } from './processUsfmObjs';
import packageInfo from '../../../../package.json';
import { commitChanges } from '../Sync/Isomorphic/utils';
import * as logger from '../../logger';

const grammar = require('usfm-grammar');
const path = require('path');
const md5 = require('md5');

function TranslationMergeUI({ conflictData, closeMergeWindow, triggerSnackBar }) {
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [model, setModel] = React.useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
  });

  const [selectedChapter, setSelectedChapter] = useState();
  const [resolvedBooks, setResolvedBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usfmJsons, setUsfmJsons] = useState({});
  const [selectedBook, setSelectedBook] = useState();
  const [conflictedChapters, setConflictedChapters] = useState({});
  const [chapterResolveDone, setChapterResolveDone] = useState(false);
  const [finishedConflict, setFinishedConflict] = useState([]);
  const [manualResolve, setManualResolve] = useState(false);

  const removeSection = async (abort = false) => {
    if (abort === false) {
      // TODO : allow to close and continue later
    } else {
      // popup with warning
      setModel({
        openModel: true,
        title: t('modal-title-abort-conflict-resolution'),
        confirmMessage: t('text-msg-abort-conflict-resolution'),
        buttonName: t('label-abort'),
      });
    }
  };

  const modalClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
  };

  const handleStartOver = () => {
    modalClose();
  };

  const handleOnAbortMerge = () => {
    if (model.buttonName === t('label-abort')) {
      setError('');
      modalClose();
      closeMergeWindow();
    } else {
      handleStartOver();
    }
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

  const handleFinishMergeProcess = async () => {
    try {
      setLoading(true);
      const fs = window.require('fs');
      // remove temp merge path of project
      await fs.rmSync(usfmJsons.conflictMeta.projectMergePath, { recursive: true, force: true });
      setLoading(false);
      triggerSnackBar('success', 'Conflict Resolved Successfully');
      closeMergeWindow();
    } catch (err) {
      logger.error('TranslationMergeUI.jsx', `Error removing merge project directory : ${err}`);
      setLoading(false);
    }
  };
  const writeBackPerfUSFMandUpdateConfig = async (generatedPerfUSFM, currentBookCode) => {
    try {
      const fs = window.require('fs');
      setChapterResolveDone(false);

      // work on single book
      const sourceIngredientPath = path.join(usfmJsons.conflictMeta.sourceProjectPath);
      fs.writeFileSync(path.join(sourceIngredientPath, 'ingredients', `${currentBookCode}.usfm`), generatedPerfUSFM);

      const stat = fs.statSync(path.join(sourceIngredientPath, 'ingredients', `${currentBookCode}.usfm`));

      // read source meta - update the for the current book - write back
      const sourceMeta = fs.readFileSync(path.join(sourceIngredientPath, 'metadata.json'));
      const sourceMetaJson = JSON.parse(sourceMeta);
      sourceMetaJson.ingredients[selectedBook].checksum.md5 = md5(generatedPerfUSFM);
      sourceMetaJson.ingredients[selectedBook].size = stat.size;
      fs.writeFileSync(path.join(sourceIngredientPath, 'metadata.json'), JSON.stringify(sourceMetaJson));

      // commit for the overwritten usfm
      const backupMessage = `Scribe Internal Commit - conflict resolved for book : ${currentBookCode}  : ${new Date()}`;
      await commitChanges(fs, usfmJsons.conflictMeta.sourceProjectPath, conflictData.data.author, backupMessage, true);
      setLoading(false);
    } catch (err) {
      logger.error('TranslationMergeUI.jsx', `Error writeBackPerfUSFMandUpdateConfig will updating metadata : ${err}`);
      setLoading(false);
    }
  };

  const handleFinishedBookResolution = async () => {
    const resolvedBooks = { ...usfmJsons };
    delete resolvedBooks.conflictMeta;
    // work on single book
    const resolvedMergeJson = resolvedBooks[selectedBook]?.mergeJson;
    const generatedUSFM = await parseJsonToUsfm(resolvedMergeJson);

    if (generatedUSFM && resolvedMergeJson.book.bookCode) {
      writeBackPerfUSFMandUpdateConfig(generatedUSFM, resolvedMergeJson.book.bookCode.toUpperCase());
    } else {
      logger.error('TranslationMergeUI.jsx', `Can not generate usfm of current book : ${selectedBook}`);
    }
  };

  // Function to write back the current usfmJSON data as config in the .merge
  const writeBackConflictConfigData = async (projectFullName, configData) => {
    try {
      const fs = window.require('fs');
      const newpath = localStorage.getItem('userPath');
      const path = require('path');
      localforage.getItem('userProfile').then((user) => {
        const USFMMergeDirPath = path.join(newpath, packageInfo.name, 'users', user?.username, '.merge-usfm');
        if (fs.existsSync(path.join(USFMMergeDirPath, projectFullName))) {
          fs.writeFileSync(path.join(USFMMergeDirPath, projectFullName, 'usfmJsons.json'), JSON.stringify(configData));
        }
        setLoading(false);
      });
    } catch (err) {
      logger.error('TranslationMergeUI.jsx', `Error creating usfmJsons.json file : ${err}`);
      setLoading(false);
    }
  };

  const resolveAndMarkDoneChapter = async () => {
    try {
      setChapterResolveDone(false);
      // remove current chapter from conflicted list
      const restOfTheChapters = conflictedChapters[selectedBook]?.filter((chNo) => chNo !== selectedChapter);
      setConflictedChapters((prev) => ({ ...prev, [selectedBook]: restOfTheChapters || [] }));
      let isBookResolved = false;
      if (!restOfTheChapters) {
        setResolvedBooks((prev) => [...prev, selectedBook]);
        // isBookResolved = true;
      } else if (restOfTheChapters?.length === 0) {
        // completed conflicts for that particualr book
        flushSync(() => {
          setLoading(true);
        });
        await handleFinishedBookResolution(selectedBook);
        setResolvedBooks((prev) => [...prev, selectedBook]);
        isBookResolved = true;
      } else {
        // current book have pending chapter , // Switch to next chapter or book
        setSelectedChapter(restOfTheChapters[0]);
      }
      // store the jsons to the backend (/.merge/projectName/BookID.json)

      const { projectFullName } = usfmJsons.conflictMeta;

      // resolved chapters of each book and resolved books in the conflictMeta and store in the BE
      const currentUSFMJsonsData = JSON.parse(JSON.stringify(usfmJsons));
      // initial time (if resolved chapters exist for the project)
      if (currentUSFMJsonsData.conflictMeta?.resolvedStatus) {
        currentUSFMJsonsData.conflictMeta.resolvedStatus[selectedBook] = { conflictedChapters: restOfTheChapters, isBookResolved };
      } else {
        currentUSFMJsonsData.conflictMeta.resolvedStatus = { [selectedBook]: { conflictedChapters: restOfTheChapters, isBookResolved } };
      }
      setUsfmJsons(currentUSFMJsonsData);
      await writeBackConflictConfigData(projectFullName, currentUSFMJsonsData);
    } catch (err) {
      logger.error('TranslationMergeUI.jsx', `Failed resolve book : ${err}`);
      setLoading(false);
    }
  };

  /**
   *
   * @param {*} selectedBook
   * function checks the conflict in the book , indenitify the conflicted chapters, generate usfmJson
   */
  const checkForConflictInSelectedBook = async (selectedBook) => {
    // parse imported
    const fs = window.require('fs');
    const IncomingUsfm = fs.readFileSync(path.join(usfmJsons.conflictMeta.incomingPath, selectedBook), 'utf8');
    if (IncomingUsfm) {
      const importedJson = await parseUsfm(IncomingUsfm);
      if (!importedJson.valid) {
        setError('Imported Usfm is invalid');
      } else {
        setError('');
        setUsfmJsons((prev) => ({ ...prev, [selectedBook]: { ...prev[selectedBook], imported: importedJson.data } }));
        const { projectFullName } = usfmJsons.conflictMeta;
        const currentBookUsfm = await readUsfmFile(selectedBook, projectFullName);
        if (currentBookUsfm) {
          const currentJson = await parseUsfm(currentBookUsfm);
          // generate the merge object with current , incoming , merge verses
          const processOutArr = await processAndIdentiyVerseChangeinUSFMJsons(currentJson.data, importedJson.data).catch((err) => {
            logger.error('TranslationMergeUI.jsx', `Error while process USFM data : ${err}`);
          });
          const mergeJson = processOutArr[0];
          const conflcitedChapters = processOutArr[1];
          currentJson && currentJson?.valid && setUsfmJsons((prev) => ({ ...prev, [selectedBook]: { ...prev[selectedBook], current: currentJson.data, mergeJson } }));
          // if processOutArr leng = 0 ; there is not actual conflict on content. so do auto resolve for the book
          if (conflcitedChapters?.length > 0) {
            setConflictedChapters((prev) => ({ ...prev, [selectedBook]: processOutArr[1] || [] }));
            if (conflcitedChapters && conflcitedChapters?.length > 0) {
              setSelectedChapter(conflcitedChapters[0]);
            }
          } else {
            // resolve the book automatically ; the conflict in md5 only not on content
            await resolveAndMarkDoneChapter();
            triggerSnackBar('info', 'No conflict in verse level. The conflict may be because of extra tags.');
          }
          setLoading(false);
        }
      }
    } else {
      setError('unable to read imported USFM');
    }
    setLoading(false);
  };

  /**
   * existing project merge
   * read usfm json data from backend
   */
  const getInprogressMergeProject = async (data) => {
    const fs = window.require('fs');
    if (fs.existsSync(path.join(data.projectMergePath, 'usfmJsons.json'))) {
      let usfmJsonsContent = fs.readFileSync(path.join(data.projectMergePath, 'usfmJsons.json'), 'utf8');
      usfmJsonsContent = JSON.parse(usfmJsonsContent);
      if (usfmJsonsContent) {
        setUsfmJsons(usfmJsonsContent);
        // check the books is already resolved or not => then select current book and unresolved chapters
        let bookToSelect;
        const resolvedBooksArr = [];
        const conflictedChsOfBooks = {};

        // loading config - config have data of atleast 1 chapter of any book resolved ( checkpoint )
        if (usfmJsonsContent.conflictMeta.resolvedStatus) {
          // eslint-disable-next-line no-restricted-syntax
          for (const book in usfmJsonsContent.conflictMeta.resolvedStatus) {
            if (book in usfmJsonsContent.conflictMeta.resolvedStatus) {
              const currentBook = usfmJsonsContent.conflictMeta.resolvedStatus[book];
              if (!currentBook.isBookResolved && !bookToSelect) {
                bookToSelect = book;
              }
              if (currentBook.isBookResolved) {
                resolvedBooksArr.push(book);
              }
              conflictedChsOfBooks[book] = currentBook.conflictedChapters || [];
            }
          }

          if (!bookToSelect) {
            const pendingBook = usfmJsonsContent.conflictMeta.files.find((bukName) => !(bukName in usfmJsonsContent.conflictMeta.resolvedStatus));
            // if pendingBook == undefined means all files conflict are resolved
            bookToSelect = pendingBook || usfmJsonsContent.conflictMeta.files[0];
          }
        } else {
          // checkpoint - stored on initially and not worked on any chapter
          bookToSelect = usfmJsonsContent.conflictMeta.files[0];
        }

        setSelectedBook(bookToSelect);
        setResolvedBooks(resolvedBooksArr);
        setConflictedChapters(conflictedChsOfBooks);
      } else {
        logger.error('TranslationMergeUI.jsx', 'Inprogress project config is corrupted');
      }
    } else {
      logger.error('TranslationMergeUI.jsx', 'Unable to get the inprogress config');
    }
  };

  // useEffect to trigger completed all conflict Resolution
  useEffect(() => {
    if (resolvedBooks.length >= usfmJsons?.conflictMeta?.files?.length) {
      setFinishedConflict(true);
    } else {
      setFinishedConflict(false);
    }
  }, [resolvedBooks]);

  // store conflict data to usfm jsons meta
  useEffect(() => {
    /**
     * check the project merge is new or existing
     */
    if (conflictData.data.isNewProjectMerge) {
      setUsfmJsons((prev) => ({ ...prev, conflictMeta: conflictData.data }));
      setSelectedBook(conflictData?.data?.files[0]);
    } else {
      getInprogressMergeProject(conflictData.data);
    }
  }, [conflictData]);

  // handle conflict check for a book on book nav
  useEffect(() => {
    if (!loading && usfmJsons?.conflictMeta) {
      (async () => {
        setLoading(true);
        if (conflictedChapters[selectedBook]?.length > 0) {
          // Auto Select first Chapter of the selected Book
          if (conflictedChapters[selectedBook] && conflictedChapters[selectedBook].length > 0) {
            setSelectedChapter(conflictedChapters[selectedBook][0]);
          }
          setLoading(false);
        } else {
          await checkForConflictInSelectedBook(selectedBook);
          await writeBackConflictConfigData(usfmJsons.conflictMeta.projectFullName, usfmJsons);
        }
      })();
    } else {
      // INFO : loading is showing : some other process is going on
    }
  }, [selectedBook, usfmJsons.conflictMeta]);

  useEffect(() => {
    if (finishedConflict === true && manualResolve === false) { handleFinishMergeProcess(); }
  }, [finishedConflict]);

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
            <div className="bg-black relative flex justify-between px-3 items-center rounded-t-lg h-10 w-[80vw]">
              <h1 className="text-white font-bold text-sm uppercase">{t('label-resolve-conflict')}</h1>
              <div aria-label="resources-search" className="pt-1.5 pb-[6.5px]  bg-secondary text-white text-xs tracking-widest leading-snug text-center" />
              {/* close btn section */}
              {!finishedConflict
                && (
                  <button
                    type="button"
                    className="focus:outline-none w-9 h-9 bg-black text-white p-2"
                    onClick={() => removeSection(true)}
                  >
                    <XMarkIcon />
                  </button>
                )}
            </div>

            {/* contents section */}
            <div className={`bg-[#e7e7e7] w-[80vw] h-[80vh] ${loading && 'pointer-events-none'}`}>
              <div className="p-2 h-full border grid grid-cols-6 gap-2">

                <TranslationMergNavBar
                  conflictedBooks={usfmJsons?.conflictMeta?.files}
                  resolvedBooks={resolvedBooks}
                  selectedBook={selectedBook}
                  setSelectedBook={setSelectedBook}
                  disableSelection={loading}
                  conflictedChapters={conflictedChapters[selectedBook]}
                  selectedChapter={selectedChapter}
                  setSelectedChapter={setSelectedChapter}
                />

                <div className="col-span-5 h-full flex flex-col gap-2">
                  <div className="border-2 border-black rounded-md grow p-2">

                    {loading ? (<LoadingScreen />) : (

                      usfmJsons[selectedBook]?.current && usfmJsons[selectedBook]?.imported && (
                        <div className="h-[70vh] overflow-auto">
                          <UsfmConflictEditor
                            usfmJsons={usfmJsons}
                            currentProjectMeta={usfmJsons?.conflictMeta?.currentMeta}
                            selectedChapter={selectedChapter}
                            selectedBook={selectedBook}
                            setUsfmJsons={setUsfmJsons}
                            setChapterResolveDone={setChapterResolveDone}
                            resolvedChapters={[]}
                            resolvedBooks={resolvedBooks}
                            conflictedChapters={conflictedChapters[selectedBook]}
                          />
                        </div>
                      )
                    )}

                  </div>
                  <div className="border-2 border-black rounded-md h-[50px] p-1 flex justify-between">
                    <p className="text-red-500 text-sm">{error}</p>
                    {usfmJsons[selectedBook]?.current && usfmJsons[selectedBook]?.imported && (
                      finishedConflict ? (
                        <button
                          type="button"
                          onClick={() => handleFinishMergeProcess()}
                          className="px-4 py-1  rounded-md uppercase bg-success/75 cursor-pointer hover:bg-success text-white"
                        >
                          Finish
                        </button>
                      ) : (

                        !resolvedBooks.includes(selectedBook) && (
                          <button
                            type="button"
                            onClick={() => { resolveAndMarkDoneChapter(); setManualResolve(true); }}
                            disabled={!chapterResolveDone}
                            className={`px-4 py-1  rounded-md uppercase
                        ${chapterResolveDone ? 'bg-success/75 cursor-pointer hover:bg-success text-white' : 'bg-gray-300 text-black cursor-not-allowed '}
                        `}
                          >
                            {conflictedChapters?.[selectedBook]?.length <= 1 ? 'Resolve Book' : 'Done'}
                          </button>
                        )
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
