import React, {
  useRef, Fragment, useContext, useEffect, useState,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon, FolderOpenIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { SnackBar } from '@/components/SnackBar';
import { ProjectContext } from '@/components/context/ProjectContext';
import { readUsfm } from '@/components/Projects/utils/readUsfm';
import { validateUsfm } from '@/components/EditorPage/TextEditor/conversionUtils';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import styles from './ImportPopUp.module.css';
import * as logger from '../../logger';
import CloseIcon from '@/illustrations/close-button-black.svg';
import { updateJsonJuxta } from './utils/updateJsonJuxta';

const grammar = require('usfm-grammar');
const advanceSettings = require('../../lib/AdvanceSettings.json');

export default function ImportPopUp(props) {
  const {
    open,
    closePopUp,
    projectType,
    replaceConformation,
  } = props;

  const cancelButtonRef = useRef(null);
  const [books, setBooks] = useState([]);
  const [folderPath, setFolderPath] = useState([]);
  const [valid, setValid] = useState(false);
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const [show, setShow] = useState(false);
  const [fileFilter, setfileFilter] = useState([{ name: 'usfm files', extensions: ['usfm', 'sfm', 'USFM', 'SFM'] }]);
  const { t } = useTranslation();
  const [labelImportFiles, setLabelImportFiles] = useState(t('label-choose-usfm-files'));
  const [loading, setLoading] = useState(false);
  const {
    states: { canonSpecification, importedBookCodes },
    actions: { setCanonSpecification, setImportedBookCodes, setImportedFiles },
  } = useContext(ProjectContext);

  const compareArrays = (a, b) => a.length === b.length
    && a.every((element) => b.indexOf(element) !== -1)
    && b.every((element) => a.indexOf(element) !== -1);

  function close() {
    logger.debug('ImportPopUp.js', 'Closing the Import UI');
    setValid(false);
    setShow(false);
    closePopUp();
  }

  function clear() {
    logger.debug('ImportPopUp.js', 'Clearing the data from the path box');
    setFolderPath([]);
    setBooks([]);
  }

  const getBooks = (filePaths) => {
    logger.debug('ImportPopUp.js', 'In getBooks for displaying books name using the paths');

    const regexPath = /^(.*[\\//])(.*)$/;
    const bookList = filePaths.map((filePath) => {
      const match = regexPath.exec(filePath);
      if (match !== null) {
        const fileName = match[2];
        return { name: fileName, path: filePath, valid: null };
      }
      return null;
    }).filter(Boolean);

    setBooks(bookList);
  };

  const OBSValidate = (filename) => {
    let match = false;
    logger.debug('ImportPopUp.js', 'Inside OBS validate, allow file name with 01-50 only');
    logger.debug('ImportPopUp.js', filename);
    if (filename === 'front.md' || filename === 'back.md') {
      match = true;
    } else {
      const regexExp = /^(5[0]|[1-4][0-9]|[0][1-9]).md$/;
      match = regexExp.exec(filename);
    }
    return match;
  };

  const validateFiles = async (bookList) => {
    const fs = window.require('fs').promises;

    const validationPromises = bookList.map(async (book) => {
      let isValid = false;
      let bookCode = null;
      if (projectType === 'Translation') {
        const usfm = await fs.readFile(book.path, 'utf8');
        const { isValid: validUsfm, bookCode } = await validateUsfm(usfm);
        isValid = validUsfm;
        return { ...book, valid: isValid, id: bookCode };
      } if (projectType === 'Audio' || projectType === 'Juxta') {
        const file = await fs.readFile(book.path, 'utf8');
        const myUsfmParser = new grammar.USFMParser(file, grammar.LEVEL.RELAXED);
        isValid = myUsfmParser.validate();
        if (isValid) {
          const jsonOutput = myUsfmParser.toJSON();
          bookCode = jsonOutput.book.bookCode;
        }
      } else if (projectType === 'OBS') {
        isValid = OBSValidate(book.name);
        bookCode = book.name;
      }

      return { ...book, valid: isValid, id: bookCode };
    });

    const validatedBooks = await Promise.all(validationPromises);
    setBooks(validatedBooks);
  };

  const openFileDialogSettingData = async () => {
    logger.debug('ImportPopUp.js', 'Inside openFileDialogSettingData');
    const options = {
      properties: ['openFile', 'multiSelections'],
      filters: fileFilter,
    };
    const { dialog } = window.require('@electron/remote');
    const chosenFolder = await dialog.showOpenDialog(options);

    if ((chosenFolder.filePaths).length > 0) {
      setLoading(true);

      // Let React flush & render spinner
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });
      logger.debug('ImportPopUp.js', 'Selected the files');
      await getBooks(chosenFolder.filePaths);
      setFolderPath(chosenFolder.filePaths);

      await validateFiles(
        chosenFolder.filePaths.map((filePath) => ({
          name: filePath.split(/[/\\]/).pop(),
          path: filePath,
          valid: null,
        })),
      );

      setLoading(false);
      setShow(true);
    } else {
      logger.debug('ImportPopUp.js', 'Didn\'t select any file');
      close();
    }
  };

  const importFiles = async (folderPath) => {
    logger.debug('ImportPopUp.js', 'Inside importFiles');
    const fs = window.require('fs').promises;
    const files = [];
    const bookCodeList = [];
    const fileProcessingPromises = folderPath.map(async (filePath) => {
      try {
        switch (projectType) {
        case 'Translation': {
          const usfm = await fs.readFile(filePath, 'utf8');
          const { isValid, validUSFM, bookCode } = await validateUsfm(usfm);
          if (isValid) {
            // If importing a USFM file then ask user for replace of USFM with the new content or not
            replaceConformation(true);
            logger.debug('ImportPopUp.js', 'Valid USFM file.');
            files.push({ id: bookCode, content: validUSFM });
            bookCodeList.push(bookCode);
          } else {
            logger.warn('ImportPopUp.js', 'Invalid USFM file.');
            setNotify('failure');
            setSnackText(t('dynamic-msg-invalid-usfm-file'));
            setOpenSnackBar(true);
          }
          break;
        }

        case 'Audio': {
          const usfm = await fs.readFile(filePath, 'utf8');
          const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
          const isJsonValid = myUsfmParser.validate();
          if (isJsonValid) {
            // If importing a USFM file then ask user for replace of USFM with the new content or not
            replaceConformation(true);
            logger.debug('ImportPopUp.js', 'Valid USFM file.');
            const jsonOutput = myUsfmParser.toJSON();
            files.push({ id: jsonOutput.book.bookCode, content: usfm });
            bookCodeList.push(jsonOutput.book.bookCode);
          } else {
            logger.warn('ImportPopUp.js', 'Invalid USFM file.');
            setNotify('failure');
            setSnackText(t('dynamic-msg-invalid-usfm-file'));
            setOpenSnackBar(true);
          }
          break;
        }

        case 'OBS': {
          const mdfile = await fs.readFile(filePath, 'utf8');
          let filename = filePath.split(/[(\\)?(/)?]/gm).pop();
          const regexExp = /^([1-9]).md$/;

          const matchSingleDigit = regexExp.exec(filename);
          if (matchSingleDigit) {
            let fileNum = filename.split('.')[0];
            fileNum = fileNum.toString().padStart(2, 0);
            filename = `${fileNum}.md`;
          }
          const isMdValid = OBSValidate(filename);
          if (isMdValid) {
            logger.debug('ImportPopUp.js', 'Valid Md file.');
            files.push({ id: filename, content: mdfile });
          } else {
            logger.warn('ImportPopUp.js', 'Invalid Md file.');
            setNotify('failure');
            setSnackText(t('dynamic-msg-invalid-md-file'));
            setOpenSnackBar(true);
          }
          break;
        }

        case 'Juxta': {
          const file = await fs.readFile(filePath, 'utf8');
          const filename = filePath.split(/[(\\)?(/)?]/gm).pop();

          const fileExt = filename.split('.').pop()?.toLowerCase();
          if (fileExt === 'txt' || fileExt === 'usfm' || fileExt === 'text' || fileExt === 'sfm'
              || fileExt === undefined) {
            const myUsfmParser = new grammar.USFMParser(file, grammar.LEVEL.RELAXED);
            const isJsonValid = myUsfmParser.validate();
            // if the USFM is valid
            if (isJsonValid) {
              replaceConformation(true);
              logger.debug('ImportPopUp.js', 'Valid USFM file.');
              // then we get the book code and we transform our data to our Juxta json file
              const jsonOutput = myUsfmParser.toJSON();
              const juxtaJson = JSON.stringify(readUsfm(file, jsonOutput.book.bookCode));
              files.push({ id: jsonOutput.book.bookCode, content: juxtaJson });
              bookCodeList.push(jsonOutput.book.bookCode);
            } else {
              logger.warn('ImportPopUp.js', 'Invalid USFM file.');
              setNotify('failure');
              setSnackText(t('dynamic-msg-invalid-usfm-file'));
              setOpenSnackBar(true);
            }
          } else if (fileExt === 'json') {
            // TODO add a validator for our juxta type
            const updatedFile = updateJsonJuxta(file, filename.split('.')[0]);
            if (updatedFile.error) {
              logger.warn('ImportPopUp.js', 'Invalid filename.');
              setNotify('failure');
              // Nicolas : TODO translations
              setSnackText(updatedFile.error);
              setOpenSnackBar(true);
              break;
            }
            logger.debug('ImportPopUp.js', 'Valid Json juxta file.');
            files.push({ id: updatedFile.bookCode, content: JSON.stringify(updatedFile) });
            bookCodeList.push(updatedFile.bookCode);
          } else {
            logger.warn('ImportPopUp.js', 'Invalid file.');
            setNotify('failure');
            // Nicolas : TODO translations
            setSnackText('invalid file type');
            setOpenSnackBar(true);
          }
          break;
        }
        default:
          break;
        }
      } catch (err) {
        logger.error('ImportPopUp.js', `Error processing file: ${err.message}`);
        return null;
      }
    });

    await Promise.all(fileProcessingPromises);

    const newCanonSpecification = {
      currentScope: bookCodeList,
      id: 4,
      locked: false,
      title: t('label-other'),
    };
    if (bookCodeList.length === advanceSettings.canonSpecification[2].length
      && compareArrays(advanceSettings.currentScope, bookCodeList)) {
      newCanonSpecification.title = advanceSettings.canonSpecification[2].title;
      newCanonSpecification.id = advanceSettings.canonSpecification[2].id;
    } else if (bookCodeList.length === advanceSettings.canonSpecification[1].length
      && compareArrays(advanceSettings.currentScope, bookCodeList)) {
      newCanonSpecification.title = advanceSettings.canonSpecification[1].title;
      newCanonSpecification.id = advanceSettings.canonSpecification[2].id;
    } else if (bookCodeList.length === advanceSettings.canonSpecification[0].length
      && compareArrays(advanceSettings.currentScope, bookCodeList)) {
      newCanonSpecification.title = advanceSettings.canonSpecification[0].title;
      newCanonSpecification.id = advanceSettings.canonSpecification[0].id;
    }
    setCanonSpecification(newCanonSpecification);
    setImportedBookCodes(bookCodeList);
    setImportedFiles(files);
    close();
  };

  const importProject = async () => {
    logger.debug('ImportPopUp.js', 'Inside importProject');

    if (folderPath.length === 0) {
      logger.debug('ImportPopUp.js', 'Invalid Path');
      setValid(true);
      setNotify('failure');
      setSnackText(t('dynamic-msg-invalid-path'));
      setOpenSnackBar(true);
      return;
    }

    const invalidFiles = books.filter((b) => b.valid === false);

    let outOfScopeFiles = [];
    if (projectType !== 'OBS') {
      outOfScopeFiles = books.filter(
        (b) => !canonSpecification.currentScope.includes(b.id),
      );
    }

    const duplicateWithinBatch = books.filter((book, index, arr) => {
      if (!book.id || book.valid === false || !canonSpecification.currentScope.includes(book.id)) {
        return false;
      }
      return arr.findIndex((b) => b.id === book.id) !== index;
    });

    if (invalidFiles.length > 0 || outOfScopeFiles.length > 0 || duplicateWithinBatch.length > 0) {
      const msg = (
        <div className="space-y-1">
          {invalidFiles.length > 0 && (
            <div>
              <span className="font-bold text-black">Invalid files:</span>
              {' '}
              {invalidFiles.map((b) => b.name).join(', ')}
            </div>
          )}
          {outOfScopeFiles.length > 0 && (
            <div>
              <span className="font-bold text-black">Out-of-scope files:</span>
              {' '}
              {outOfScopeFiles.map((b) => b.name).join(', ')}
            </div>
          )}
          {duplicateWithinBatch.length > 0 && (
            <div>
              <span className="font-bold text-black">Duplicate in current selection:</span>
              {' '}
              {duplicateWithinBatch.map((b) => b.name).join(', ')}
            </div>
          )}
        </div>
      );

      setNotify('warning');
      setSnackText(msg);
      setOpenSnackBar(true);
      return;
    }

    const duplicateWithImported = books.filter(
      (b) => b.valid !== false && !outOfScopeFiles.includes(b) && importedBookCodes.includes(b.id),
    );

    if (duplicateWithImported.length > 0) {
      const msg = `Duplicate with existing imports: ${duplicateWithImported.map((b) => b.name).join(', ')}`;
      setNotify('warning');
      setSnackText(
        <div>
          <p>{msg}</p>
          <button
            type="button"
            onClick={async () => {
              setOpenSnackBar(false);
              await importFiles(folderPath, { overwrite: true });
            }}
            className="bg-green-500 text-white px-2 py-1 rounded"
          >
            Overwrite
          </button>
          <button
            type="button"
            onClick={() => setOpenSnackBar(false)}
            className="bg-gray-500 text-white px-2 py-1 rounded"
          >
            Cancel
          </button>
        </div>,
      );
      setOpenSnackBar(true);
      return;
    }

    setLoading(true);
    setValid(false);
    try {
      closePopUp(false);
      await importFiles(folderPath, { overwrite: duplicateWithImported.length > 0 });
      logger.debug('ImportPopUp.js', 'Import successful');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logger.debug('ImportPopUp.js', 'Inside useEffect to set filter types of Import');
    switch (projectType) {
    case 'Translation':
      setfileFilter([{ name: 'usfm files', extensions: ['usfm', 'sfm', 'USFM', 'SFM'] }]);
      setLabelImportFiles(t('label-choose-usfm-files'));
      break;

    case 'OBS':
      setfileFilter([{ name: 'markdown files', extensions: ['md', 'markdown', 'MD', 'MARKDOWN'] }]);
      setLabelImportFiles(t('label-choose-md-files'));
      break;

    case 'Juxta':
      setfileFilter([{ name: 'json, text, usfm files', extensions: ['json', 'JSON', 'txt', 'TXT', 'text', 'TEXT', 'usfm', 'sfm', 'USFM', 'SFM'] }]);
      // Nicolas : TODO translation
      setLabelImportFiles('Choose json files');
      break;

    default:
      break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType]);

  useEffect(() => {
    if (open && canonSpecification.currentScope.length === 0) {
      const allBooks = advanceSettings.canonSpecification[0].currentScope;
      setCanonSpecification({
        currentScope: allBooks,
        id: advanceSettings.canonSpecification[0].id,
        locked: false,
        title: advanceSettings.canonSpecification[0].title,
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      openFileDialogSettingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <>
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <LoadingSpinner />
        </div>
      )}

      {!loading && (
        <Transition
          show={show}
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
            open={show}
            onClose={close}
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <div className="flex items-center justify-center h-screen">
              <div className="lg:w-5/12 h-3/6 items-center justify-center m-auto z-50 shadow overflow-hidden rounded">

                <div className="relative h-full rounded shadow overflow-hidden bg-white">

                  <div className="flex justify-between items-center bg-secondary">
                    <div className="uppercase bg-secondary text-white py-2 px-5 text-xs tracking-widest leading-snug rounded-tl text-center">
                      {t('label-import-book')}
                    </div>
                    <button
                      onClick={close}
                      type="button"
                      className="focus:outline-none"
                    >
                      <CloseIcon
                        className="h-6 w-7"
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="relative w-full h-full">
                    <div className="p-8 overflow-auto w-full h-full no-scrollbars">
                      <div className="bg-white text-sm text-left tracking-wide">
                        <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">{labelImportFiles}</h4>
                        <div className="flex items-center mb-4">
                          <input
                            type="text"
                            name="location"
                            id=""
                            value={folderPath}
                            onChange={(e) => setFolderPath(e.target.value)}
                            className="bg-white w-52 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                          />
                          <button
                            type="button"
                            className="px-5"
                            onClick={() => openFileDialogSettingData()}
                          >
                            <FolderOpenIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-red-500">{valid === true ? t('label-enter-location') : ''}</h4>
                      </div>

                      <div className="bg-white grid grid-cols-4 gap-2 p-4 pb-24 text-sm text-left tracking-wide">
                        {books.map((book, index) => {
                          const outOfScope = projectType !== 'OBS' && !canonSpecification.currentScope.includes(book.id);
                          const duplicateInBatch = books.filter((b) => b.id === book.id && b.valid !== false && !outOfScope).length > 1;
                          const duplicateWithImported = importedBookCodes.includes(book.id) && book.valid !== false && !outOfScope;

                          let bgColor = 'bg-gray-300 hover:bg-gray-400';
                          if (book.valid === false) { bgColor = 'bg-error hover:bg-error/80'; } else if (!outOfScope) { bgColor = 'bg-success hover:bg-success/80'; }
                          if (duplicateInBatch) { bgColor = 'bg-blue-500 hover:bg-blue-600'; } else if (duplicateWithImported) { bgColor = 'bg-yellow-400 hover:bg-yellow-500'; }

                          const fileExt = book.name.split('.').pop()?.toUpperCase() || '';
                          let tooltip = fileExt;

                          if (book.valid === false) { tooltip += ' — Invalid file'; } else if (outOfScope) { tooltip += ' — Out-of-scope'; } else if (duplicateInBatch) { tooltip += ' — Duplicate in selection'; } else if (duplicateWithImported) { tooltip += ' — Already imported'; } else { tooltip = `Valid file — ${fileExt}`; }

                          return (
                            <div
                              key={book.name}
                              className={`${styles.select} relative p-2 rounded font-medium flex items-start w-full ${bgColor}`}
                              title={tooltip}
                            >
                              <div className="flex items-start w-full pr-6">
                                <DocumentTextIcon className="w-6 mr-2 flex-shrink-0 text-white" />
                                <span className="text-white break-words whitespace-normal overflow-hidden text-ellipsis line-clamp-2">
                                  {book.name}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="absolute top-1 right-1 text-black hover:text-gray-700"
                                onClick={() => {
                                  setBooks((prev) => prev.filter((_, i) => i !== index));
                                  setFolderPath((prev) => prev.filter((_, i) => i !== index));
                                }}
                              >
                                <XMarkIcon className="h-4 w-4" aria-hidden="true" />
                              </button>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  </div>

                  <div className="absolute bottom-0 right-0 left-0 bg-white">
                    <div className="flex gap-6 mx-5 justify-end my-4">
                      <button
                        type="button"
                        onClick={close}
                        className="py-2 px-6 rounded shadow bg-error text-white uppercase text-xs tracking-widest font-semibold"
                      >
                        {t('btn-cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={clear}
                        className="py-2 px-6 rounded shadow bg-primary text-white uppercase text-xs tracking-widest font-semibold"
                      >
                        {t('btn-clear')}
                      </button>
                      <button
                        type="button"
                        disabled={loading}
                        className={`py-2 px-7 rounded shadow text-white uppercase text-xs tracking-widest font-semibold flex items-center justify-center ${loading ? 'bg-success/80 cursor-not-allowed' : 'bg-success'}`}
                        onClick={() => importProject()}
                      >
                        {t('btn-import')}
                      </button>

                    </div>
                  </div>
                </div>

              </div>

            </div>
          </Dialog>
        </Transition>
      )}
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
ImportPopUp.propTypes = {
  open: PropTypes.bool,
  closePopUp: PropTypes.func.isRequired,
  projectType: PropTypes.string.isRequired,
  replaceConformation: PropTypes.func.isRequired,
};
