import React, {
  useRef, Fragment, useContext, useEffect,
} from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Dialog, Transition } from '@headlessui/react';
import { DocumentTextIcon, FolderOpenIcon } from '@heroicons/react/24/outline';
import { SnackBar } from '@/components/SnackBar';
import { ProjectContext } from '@/components/context/ProjectContext';
import styles from './ImportPopUp.module.css';
import * as logger from '../../logger';
import CloseIcon from '@/illustrations/close-button-black.svg';

const grammar = require('usfm-grammar');

export default function ImportPopUp(props) {
  const {
    open,
    closePopUp,
    projectType,
  } = props;

  const cancelButtonRef = useRef(null);
  const [books, setBooks] = React.useState([]);
  const [folderPath, setFolderPath] = React.useState([]);
  const [valid, setValid] = React.useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [show, setShow] = React.useState(false);
  const [fileFilter, setfileFilter] = React.useState([{ name: 'usfm files', extensions: ['usfm', 'sfm', 'USFM', 'SFM'] }]);
  const { t } = useTranslation();
  const [labelImportFiles, setLabelImportFiles] = React.useState('Choose USFM files');
  const {
    actions: {
      setImportedFiles,
    },
  } = useContext(ProjectContext);

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
    const book = [];
    // regex to split path to two groups '(.*[\\\/])' for path and '(.*)' for file name
    const regexPath = /^(.*[\\//])(.*)$/;
    // execute the match on the string filePath
    filePaths.forEach((filePath) => {
      const match = regexPath.exec(filePath);
      if (match !== null) {
        // we ignore the match[0] because it's the match for the hole path string
        const fileName = match[2];
        book.push(fileName);
      }
    });
    setBooks(book);
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
      logger.debug('ImportPopUp.js', 'Selected the files');
      setShow(true);
    } else {
      logger.debug('ImportPopUp.js', 'Didn\'t select any file');
      close();
    }
    await getBooks(chosenFolder.filePaths);
    setFolderPath(chosenFolder.filePaths);
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

  const importFiles = (folderPath) => {
    logger.debug('ImportPopUp.js', 'Inside importFiles');
    const fs = window.require('fs');
    const files = [];
    folderPath.forEach((filePath) => {
      switch (projectType) {
        case 'Translation': {
          const usfm = fs.readFileSync(filePath, 'utf8');
          const myUsfmParser = new grammar.USFMParser(usfm);
          const isJsonValid = myUsfmParser.validate();
          if (isJsonValid) {
            logger.debug('ImportPopUp.js', 'Valid USFM file.');
            const jsonOutput = myUsfmParser.toJSON();
            files.push({ id: jsonOutput.book.bookCode, content: usfm });
          } else {
            logger.warn('ImportPopUp.js', 'Invalid USFM file.');
            setNotify('failure');
            setSnackText(t('dynamic-msg-invalid-usfm-file'));
            setOpenSnackBar(true);
          }
          break;
        }

        case 'Audio': {
          const usfm = fs.readFileSync(filePath, 'utf8');
          const myUsfmParser = new grammar.USFMParser(usfm);
          const isJsonValid = myUsfmParser.validate();
          if (isJsonValid) {
            logger.debug('ImportPopUp.js', 'Valid USFM file.');
            const jsonOutput = myUsfmParser.toJSON();
            files.push({ id: jsonOutput.book.bookCode, content: usfm });
          } else {
            logger.warn('ImportPopUp.js', 'Invalid USFM file.');
            setNotify('failure');
            setSnackText(t('dynamic-msg-invalid-usfm-file'));
            setOpenSnackBar(true);
          }
          break;
        }

        case 'OBS': {
          const mdfile = fs.readFileSync(filePath, 'utf8');
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

        default:
          break;
      }
    });
    setImportedFiles(files);
    close();
  };
  const importProject = async () => {
    logger.debug('ImportPopUp.js', 'Inside importProject');
    if (folderPath.length > 0) {
      logger.debug('ImportPopUp.js', 'Importing the data');
      setValid(false);
      closePopUp(false);
      await importFiles(folderPath);
    } else {
      logger.debug('ImportPopUp.js', 'Invalid Path');
      setValid(true);
      setNotify('failure');
      setSnackText(t('dynamic-msg-invalid-path'));
      setOpenSnackBar(true);
    }
  };
  useEffect(() => {
    logger.debug('ImportPopUp.js', 'Inside useEffect to set filter types of Import');
    switch (projectType) {
      case 'Translation':
        setfileFilter([{ name: 'usfm files', extensions: ['usfm', 'sfm', 'USFM', 'SFM'] }]);
        setLabelImportFiles('Choose USFM files');
        break;

      case 'OBS':
        setfileFilter([{ name: 'markdown files', extensions: ['md', 'markdown', 'MD', 'MARKDOWN'] }]);
        setLabelImportFiles('Choose Markdown files');
      break;

      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectType]);

  useEffect(() => {
    if (open) {
      openFileDialogSettingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <>
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
          onClose={() => close}
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
                      {
                        books.map((book) => (
                          <div key={book} className={`${styles.select} group`}>
                            <DocumentTextIcon className="w-6 mr-2 group-hover:text-white" />
                            {book}
                          </div>
                        ))
                      }
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
                      className="py-2 px-7 rounded shadow bg-success text-white uppercase text-xs tracking-widest font-semibold"
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
  closePopUp: PropTypes.func,
  projectType: PropTypes.string,
};
