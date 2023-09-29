/* eslint-disable */
import React, {
  useRef, Fragment, useState, useContext
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
 FolderOpenIcon, InformationCircleIcon, CheckIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import localforage from 'localforage';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import { AutographaContext } from '@/components/context/AutographaContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import CloseIcon from '@/illustrations/close-button-black.svg';
import importBurrito, { viewBurrito } from '../../core/burrito/importBurrito';
import * as logger from '../../logger';
import ConfirmationModal from '../editor/ConfirmationModal';
import burrito from '../../lib/BurritoTemplete.json';
import { mergeProject } from './Import/mergeProject';

export default function ImportProjectPopUp(props) {
  const {
    open,
    closePopUp,
    setConflictPopup,
  } = props;
  const router = useRouter();
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [folderPath, setFolderPath] = React.useState();
  const [valid, setValid] = React.useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [show, setShow] = React.useState(false);
  const [merge, setMerge] = React.useState(false);
  const [processMerge, setProcessMerge] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState();
  const [sbData, setSbData] = React.useState({});
  const [model, setModel] = React.useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
    });
  const { action: { FetchProjects } } = useContext(AutographaContext);
  const {
    states: {
      languages,
    }, actions: {},
  } = useContext(ProjectContext);

  const [importProgress, setImportProgress] = useState({
    importStarted: false,
    totalSteps: 4,
    completedSteps: 0,
  });

  function close() {
    logger.debug('ImportProjectPopUp.js', 'Closing the Dialog box');
    setValid(false);
    closePopUp(false);
    setShow(false);
    setSbData({});
    setImportProgress((prev)=>({...prev, importStarted:false, completedSteps: 0, totalSteps: 4}))
  }

  const openFileDialogSettingData = async () => {
    logger.debug('ImportProjectPopUp.js', 'Inside openFileDialogSettingData');
    const options = { properties: ['openDirectory'] };
    const { dialog } = window.require('@electron/remote');
    const chosenFolder = await dialog.showOpenDialog(options);
    if ((chosenFolder.filePaths).length > 0) {
      logger.debug('ImportProjectPopUp.js', 'Selected a directory');
      await localforage.getItem('userProfile').then(async (value) => {
        setShow(true);
        setCurrentUser(value.username)
        // Adding 'projects' to check the duplication in the user project resources list
        const result = await viewBurrito(chosenFolder.filePaths[0], value.username, 'projects');
        setSbData(result);
      });
    } else {
      logger.debug('ImportProjectPopUp.js', 'Didn\'t select any project');
      close();
    }
    setFolderPath(chosenFolder.filePaths[0]);
  };

  const modelClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
    });
    setImportProgress((prev)=>({...prev, importStarted:false, completedSteps: 0, totalSteps: 4}))
  };

  const callImport = async (updateBurriot) => {
    modelClose();
    setImportProgress((prev)=>({...prev, importStarted:true, completedSteps: prev.completedSteps + 1 }))
    logger.debug('ImportProjectPopUp.js', 'Inside callImport');
    await localforage.getItem('userProfile').then(async (value) => {
      const status = await importBurrito(folderPath, value.username, updateBurriot, languages);
      setImportProgress((prev)=>({...prev, importStarted:true, completedSteps: prev.completedSteps + 1 }))
      setOpenSnackBar(true);
      closePopUp(false);
      setNotify(status[0].type);
      setSnackText(status[0].value);
      setImportProgress((prev)=>({...prev, importStarted:true, completedSteps: 0, totalSteps: 0}))
      if (status[0].type === 'success') {
        close();
        FetchProjects();
        router.push('/projects');
      }
    });
  };

  const checkBurritoVersion = () => {
    logger.debug('ImportProjectPopUp.js', 'Checking the burrito version');
    setImportProgress((prev)=>({...prev, importStarted:true, completedSteps: prev.completedSteps + 1 }))
    if (burrito?.meta?.version !== sbData?.version) {
      setModel({
        openModel: true,
        title: t('modal-title-update-burrito'),
        confirmMessage: t('dynamic-msg-update-burrito-version', { version1: sbData?.version, version2: burrito?.meta?.version }),
        buttonName: t('btn-update'),
      });
    } else {
      callImport(false);
    }
  };
  
  const callFunction = () => {
    if (model.buttonName === 'Replace') {
      checkBurritoVersion();
    } else {
      callImport(true);
    }
  };


  const MergeFunction = async () => {
    logger.debug('importProjectPopUp.js', 'call for merge');
    setProcessMerge(true)
    modelClose();
    await mergeProject(folderPath, currentUser, setConflictPopup, setModel, setProcessMerge);
    setMerge(false)
    close()
    logger.debug('importProjectPopUp.js', 'git merge process done');
  }

  const importProject = async () => {
    logger.debug('ImportProjectPopUp.js', 'Inside importProject');
    if (folderPath) {
      setImportProgress((prev)=>({...prev, importStarted:true, completedSteps: prev.completedSteps + 1 }))
      setValid(false);
      if (sbData.duplicate === true) {
        logger.warn('ImportProjectPopUp.js', 'Project already available');
        // currently MERGE feature only Enabled for OBS projects
        console.log({sbData});
        if (sbData?.burritoType === 'gloss / textStories'){
          setMerge(true)
        }
        setModel({
          openModel: true,
          title: t('modal-title-replace-resource'),
          confirmMessage: t('dynamic-msg-confirm-replace-resource'),
          buttonName: t('btn-replace'),
        });
      } else {
        logger.debug('ImportProjectPopUp.js', 'Its a new project');
        checkBurritoVersion();
      }
    } else {
      logger.error('ImportProjectPopUp.js', 'Invalid Path');
      setValid(true);
      setNotify('failure');
      setSnackText(t('dynamic-msg-invalid-path'));
      setOpenSnackBar(true);
    }
  };

  React.useEffect(() => {
    if (open) {
      setImportProgress((prev)=>({...prev, importStarted:false, completedSteps: 0, totalSteps: 4}))
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
          onClose={close}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">
            <div className="w-5/12 h-3/6 items-center justify-center m-auto z-50 shadow overflow-hidden rounded">
              <div className="relative h-full rounded shadow overflow-hidden bg-white">
                <div className="flex justify-between items-center bg-secondary">
                  <div className="uppercase bg-secondary text-white py-2 px-2 text-xs tracking-widest leading-snug rounded-tl text-center">
                    {t('label-import-project')}
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
                {/* progress */}
                {importProgress.importStarted && (
                  <div className="w-full bg-gray-200 h-1">
                    <div
                      className="bg-primary h-2"
                      style={{ width: `${(importProgress.completedSteps * 100) / importProgress.totalSteps}%` }}
                    />
                  </div>
                )}
                <div className="relative w-full h-full">

                  <div className="p-8 overflow-auto w-full h-full scrollbars-width flex flex-col justify-between">

                    <div className="bg-white text-sm text-left tracking-wide">
                      <div className="flex gap-6">
                        <h4 className="text-sm font-base mb-2 text-primary  tracking-wide leading-4  font-light">{t('label-burrito-directory')}</h4>
                        <button title={t('msg-select-dir-for-SB')} type="button" disabled>
                          <InformationCircleIcon className="h-6 w-6 text-primary" />
                        </button>
                      </div>
                      <div className="flex items-center mb-4">
                        <input
                          type="text"
                          name="location"
                          id=""
                          value={folderPath}
                          onChange={(e) => setFolderPath(e.target.value)}
                          className="bg-gray-200 w-full block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                        />
                        <button
                          type="button"
                          className="px-5"
                          onClick={() => openFileDialogSettingData()}
                        >
                          <FolderOpenIcon className="h-6 w-6 text-primary" aria-hidden="true" />
                        </button>
                      </div>

                      <div>
                        <h4 className="text-red-500">{valid === true ? t('label-enter-location') : (sbData?.fileExist ? '' : t('dynamic-msg-unable-find-buritto-snack'))}</h4>
                      </div>

                    </div>

                    {sbData?.fileExist
                      && (
                        <div>
                          <h4 className="text-sm font-base mb-2 text-primary tracking-wide leading-4 font-light">{t('label-project')}</h4>
                          <input
                            className="w-full mb-4 bg-gray-200 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                            type="text"
                            value={sbData.projectName}
                            disabled
                          />
                          <h4 className="text-sm font-base mb-2 text-primary tracking-wide leading-4 font-light">{t('label-language')}</h4>
                          <input
                            className="w-full mb-4 bg-gray-200 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                            type="text"
                            value={sbData.language}
                            disabled
                          />
                          <h4 className="text-sm font-base mb-2 text-primary tracking-wide leading-4 font-light">{t('label-project-type')}</h4>
                          <input
                            className="w-full mb-4 bg-gray-200 block rounded shadow-sm sm:text-sm focus:border-primary border-gray-300"
                            type="text"
                            value={sbData.burritoType}
                            disabled
                          />
                          {(sbData.burritoType !== 'scripture / audioTranslation') && (
                          <label className="inline-flex items-center">
                            {(sbData?.validate)
                              ? <CheckIcon className="w-6 h-6 text-green-500 border" />
                            : <XMarkIcon className="w-6 h-6 text-red-500 border" />}
                            {(sbData?.validate)
                              ? <span className="ml-2">{t('dynamic-msg-burrito-validate-import-project')}</span>
                            : <span className="ml-2 text-red-500">{(sbData?.version) ? t('dynamic-msg-burrito-validation-expected', { version: sbData.version }) : t('dynamic-msg-burrito-validation-failed')}</span>}
                          </label>
                        )}
                        </div>
                      )}

                    <div className="flex gap-6 mb-5 justify-end">

                      <button
                        type="button"
                        onClick={close}
                        className="py-2 px-6 rounded shadow bg-error text-white uppercase text-xs tracking-widest font-semibold"
                      >
                        {t('btn-cancel')}
                      </button>
                      {sbData?.validate
                        && (
                          <button
                            type="button"
                            className="py-2 px-7 rounded shadow bg-success text-white uppercase text-xs tracking-widest font-semibold"
                            onClick={() => importProject()}
                          >
                            {t('btn-import')}
                          </button>
                        )}
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
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modelClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => callFunction()}
        buttonName2={{
          active: merge,
          loading: processMerge,
          name:t('label-merge'),
          action: () => MergeFunction(),
        }}
      />
    </>
  );
}
