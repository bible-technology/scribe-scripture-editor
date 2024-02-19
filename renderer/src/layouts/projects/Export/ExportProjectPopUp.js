/* eslint-disable no-useless-escape */
import React, {
  useRef, Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { FolderOpenIcon } from '@heroicons/react/24/outline';
import * as localforage from 'localforage';
import { useTranslation } from 'react-i18next';
import updateTranslationSB from '@/core/burrito/updateTranslationSB';
import updateObsSB from '@/core/burrito/updateObsSB';
import { SnackBar } from '@/components/SnackBar';
// import useSystemNotification from '@/components/hooks/useSystemNotification';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import CloseIcon from '@/illustrations/close-button-black.svg';
import { validate } from '../../../util/validate';
import * as logger from '../../../logger';
import burrito from '../../../lib/BurritoTemplate.json';
import ConfirmationModal from '../../editor/ConfirmationModal';
import { ProgressCircle } from '../../../components/ProgressCircle';
import { exportDefaultAudio, exportFullAudio } from './ExportUtils';
import packageInfo from '../../../../../package.json';

export default function ExportProjectPopUp(props) {
  const {
    open,
    closePopUp,
    project,
  } = props;
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [folderPath, setFolderPath] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);
  const [metadata, setMetadata] = React.useState({});
  const [audioExport, setAudioExport] = React.useState('default');
  const [checkText, setCheckText] = React.useState(false);

  const [totalExported, setTotalExported] = React.useState(0);
  const [totalExports, setTotalExports] = React.useState(0);
  const [exportStart, setExportstart] = React.useState(false);

  // const { pushNotification } = useSystemNotification();

  function resetExportProgress() {
    logger.debug('ExportProjectPopUp.js', 'reset Export Progress');
    if (!exportStart) {
      setTotalExported(0);
      setTotalExports(0);
      setExportstart(false);
    }
  }

  function close() {
    if (!exportStart) {
      logger.debug('ExportProjectPopUp.js', 'Closing the Dialog Box');
      resetExportProgress(); // reset export
      closePopUp(false);
      setValid(false);
      setMetadata({});
      setCheckText(false);
    }
  }

  const openFileDialogSettingData = async () => {
    logger.debug('ExportProjectPopUp.js', 'Inside openFileDialogSettingData');
    const options = { properties: ['openDirectory'] };
    const { dialog } = window.require('@electron/remote');
    const chosenFolder = await dialog.showOpenDialog(options);
    setFolderPath(chosenFolder.filePaths[0]);
  };

  const deleteGitAfterCopy = async (fs, destinationPath, path) => {
    const folders = await fs.readdirSync(destinationPath);
    if (folders.includes('.git')) {
      await fs.rmdirSync(path.join(destinationPath, '.git'), { recursive: true }, async (err) => {
        if (err) {
          throw new Error(`Remove Git failed :  ${err}`);
        }
      });
    }
  };

  const updateCommon = (fs, path, folder, project) => {
    const fse = window.require('fs-extra');
    logger.debug('ExportProjectPopUp.js', 'Updated Scripture burrito');
          let data = fs.readFileSync(path.join(folder, 'metadata.json'), 'utf-8');
          const sb = JSON.parse(data);
          // Adding the below line in 0.5.8 version, since the id in the previous versions is autographa.org
          sb.idAuthorities.scribe.id = 'http://www.scribe.bible';
          if (!sb.copyright?.shortStatements && sb.copyright?.licenses) {
            delete sb.copyright.publicDomain;
            data = JSON.stringify(sb);
          }
          const success = validate('metadata', path.join(folder, 'metadata.json'), data, sb.meta.version);
          if (success) {
            logger.debug('ExportProjectPopUp.js', 'Burrito validated successfully');
            fse.copy(folder, path.join(folderPath, project.name))
              .then(() => {
                deleteGitAfterCopy(fs, path.join(folderPath, project.name), path)
                .then(() => {
                  resetExportProgress(); // reset export states
                  logger.debug('ExportProjectPopUp.js', 'Exported Successfully');
                  setNotify('success');
                  setSnackText(t('dynamic-msg-export-success'));
                  setOpenSnackBar(true);
                  closePopUp(false);
                });
              })
              .catch((err) => {
                resetExportProgress(); // reset export states
                logger.error('ExportProjectPopUp.js', `Failed to export ${err}`);
                setNotify('failure');
                setSnackText(t('dynamic-msg-export-fail'));
                setOpenSnackBar(true);
                closePopUp(false);
              });
          }
  };

  const updateBurritoVersion = (username, fs, path, folder) => {
    setTotalExported(1); // 1 step of 2 finished
    if (project?.type === 'Text Translation') {
    updateTranslationSB(username, project, openModal)
        .then(() => {
          updateCommon(fs, path, folder, project);
        });
      } else if (project?.type === 'OBS') {
        updateObsSB(username, project, openModal)
        .then(() => {
          updateCommon(fs, path, folder, project);
        });
      }
    setOpenModal(false);
  };

  const ExportActions = {
    setNotify, setSnackText, setOpenSnackBar, setTotalExported, setTotalExports, setExportstart, resetExportProgress, setCheckText,
   };
     const ExportStates = {
    checkText, audioExport, folderPath, project, exportStart,
   };

  const exportBible = async () => {
    const fs = window.require('fs');
    if (folderPath && fs.existsSync(folderPath)) {
      setValid(false);
      logger.debug('ExportProjectPopUp.js', 'Inside exportBible');
      await localforage.getItem('userProfile').then((value) => {
        const path = require('path');
        const newpath = localStorage.getItem('userPath');
        const folder = path.join(newpath, packageInfo.name, 'users', value.username, 'projects', `${project.name}_${project.id[0]}`);
        const data = fs.readFileSync(path.join(folder, 'metadata.json'), 'utf-8');
        const metadata = JSON.parse(data);
        const { username } = value;
        setMetadata({
          metadata, folder, path, fs, username,
        });
        setExportstart(true); // export start for all type of export
        if (project?.type === 'Audio') {
          if (audioExport === 'default' || audioExport === 'chapter') {
            exportDefaultAudio(metadata, folder, path, fs, ExportActions, ExportStates, closePopUp, t);
          } else {
            setTotalExports(3);// 3 step process
            exportFullAudio(metadata, folder, path, fs, ExportActions, ExportStates, closePopUp, t);
          }
        } else if (burrito?.meta?.version !== metadata?.meta?.version) {
            setTotalExports(2); // total 2 steps process
            setOpenModal(true);
        } else {
            setTotalExports(2); // total 2 steps process
            updateBurritoVersion(username, fs, path, folder);
          }
      });
    } else {
      logger.warn('ExportProjectPopUp.js', 'Invalid Path');
      setValid(true);
      setNotify('failure');
      setSnackText(t('dynamic-msg-invalid-path'));
      setOpenSnackBar(true);
    }
  };
  return (
    <>
      <Transition
        show={open}
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
          open={open}
          onClose={close}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">
            <div className="w-5/12 h-3/6 items-center justify-center m-auto z-50 shadow overflow-hidden rounded">
              <div className="relative h-full rounded shadow overflow-hidden bg-white">
                <div className="flex justify-between items-center bg-secondary">
                  <div className="uppercase bg-secondary text-white py-2 px-2 text-xs tracking-widest leading-snug rounded-tl text-center">
                    {t('label-export-project')}
                    :
                    {
                    `${project?.name}`
                    }
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
                <div className="relative w-full h-5/6">
                  <div className="p-8 overflow-auto w-full h-full no-scrollbars">
                    <div className="bg-white text-sm text-left tracking-wide">
                      <h4 className="text-xs font-base mb-2 text-primary  tracking-wide leading-4  font-light">{t('label-export-file-path')}</h4>
                      <div className="flex items-center justify-around mb-4">
                        <input
                          type="text"
                          name="location"
                          id=""
                          value={folderPath}
                          onChange={(e) => setFolderPath(e.target.value)}
                          className="bg-white w-52 lg:w-80 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                        />
                        <button
                          disabled={exportStart}
                          type="button"
                          title={t('tooltip-import-open-file-location')}
                          className="px-5"
                          onClick={() => openFileDialogSettingData()}
                        >
                          <FolderOpenIcon className="h-5 w-5 text-primary" aria-hidden="true" />
                        </button>
                        <div className="">
                          {exportStart && <ProgressCircle currentValue={totalExported} totalValue={totalExports} circleSize="2.8rem" />}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-red-500">{valid === true ? 'Enter valid location' : ''}</h4>
                    </div>
                    { project?.type === 'Audio'
                    && (
                    <div>
                      <div className=" mb-3">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-primary"
                          value="Default"
                          checked={audioExport === 'default'}
                          onChange={() => setAudioExport('default')}
                        />
                        <span className=" ml-4 text-xs font-bold" title="Verse-wise export with only the default take of each verse kept as a Scripture Burrito">Verse-wise Default</span>
                        <div className="flex flex-row justify-end mr-3">
                          <input id="visible_1" className="visible" type="checkbox" checked={checkText} onClick={() => setCheckText(!checkText)} />
                          <span className="ml-2 text-xs font-bold" title="You can have the text content along with the Audio">With Text (if available)</span>
                        </div>
                      </div>
                      <div className="mb-3">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-primary"
                          value="Chapter"
                          checked={audioExport === 'chapter'}
                          onChange={() => setAudioExport('chapter')}
                        />
                        <span className=" ml-4 text-xs font-bold" title="Chapter Level export with only the default take of each verse">Chapter-wise</span>
                      </div>
                      <hr className="border-2" />
                      <div className="mt-3">
                        <input
                          type="radio"
                          className="form-radio h-4 w-4 text-primary"
                          value="full"
                          checked={audioExport === 'full'}
                          onChange={() => setAudioExport('full')}
                        />
                        <span className=" ml-4 text-xs font-bold" title="All takes of every verse saved as a ZIP archive within Scripture Burrito">Full project</span>
                      </div>
                    </div>
                    )}
                    <div className="absolute bottom-0 right-0 left-0 bg-white">
                      <div className="flex gap-6 mx-5 justify-end">
                        <button
                          type="button"
                          className="py-2 px-6 rounded shadow bg-error text-white uppercase text-xs tracking-widest font-semibold"
                          onClick={close}
                          disabled={exportStart}
                        >
                          {t('btn-cancel')}

                        </button>
                        <button
                          disabled={exportStart}
                          onClick={() => exportBible()}
                          aria-label="export-projects"
                          type="button"
                          className="py-2 px-7 rounded shadow bg-success text-white uppercase text-xs tracking-widest font-semibold"
                        >
                          {exportStart ? <LoadingSpinner height="h-4" width="w-4" colorTW="text-white" /> : t('btn-export')}
                        </button>
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
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
      <ConfirmationModal
        openModal={openModal}
        title={t('modal-title-update-burrito')}
        setOpenModal={setOpenModal}
        confirmMessage={t('dynamic-msg-update-burrito-version', { version1: metadata?.metadata?.meta?.version, version2: burrito?.meta?.version })}
        buttonName={t('btn-update')}
        closeModal={
          () => updateBurritoVersion(metadata.username, metadata.fs, metadata.path, metadata.folder)
        }
      />
    </>
  );
}
ExportProjectPopUp.propTypes = {
  open: PropTypes.bool,
  closePopUp: PropTypes.func,
  project: PropTypes.object,
};
