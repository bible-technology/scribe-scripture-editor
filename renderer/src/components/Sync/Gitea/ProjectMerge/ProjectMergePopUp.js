/* eslint-disable react/no-danger */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import PropTypes from 'prop-types';
import { SnackBar } from '@/components/SnackBar';
import useAddNotification from '@/components/hooks/useAddNotification';
import PopUpModal from '../../PopUpModal';
import { VerticalLinearStepper } from '../../VerticalStepperProgress';
import { mergeProgressSteps } from './ProjectMergeConst';
import { LoadingSpinner } from '../../../LoadingSpinner';
import { tryMergeProjects } from './MergeActions';
import burrito from '../../../../lib/BurritoTemplate.json';
import { backupLocalProject, deleteCreatedMergeBranch, undoMergeOrDeleteOldBackup } from './ProjectMergeUtils';
import { environment } from '../../../../../environment';
import { importServerProject } from '../SyncFromGiteaUtils';

export default function ProjectMergePop({ selectedGiteaProject, setSelectedGiteaProject }) {
  const { t } = useTranslation();
  const [stepCount, setStepCount] = useState(0);
  const [counter, setCounter] = useState(10);
  const [model, setModel] = useState({
    openModel: false, title: '', confirmMessage: '', buttonName: '',
  });
  const [mergeError, setMergeError] = useState(false);
  const [mergeConflict, setMergeConflict] = useState(false);
  const [mergeDone, setMergeDone] = useState(false);
  const [conflictHtml, setConflictHtml] = useState('<div></div>');
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [backupName, setBackupName] = React.useState('');

  const path = require('path');
  const ignoreFilesPaths = [path.join('ingredients', environment.PROJECT_SETTING_FILE), 'metadata.json'];

  const callFunction = async () => {
    let updateBurrito = null;
    if (model.buttonName === t('btn-update')) {
      updateBurrito = true;
    } else {
      updateBurrito = false;
    }
    // backing up project
    const backupProjectName = await backupLocalProject(selectedGiteaProject, { setBackupName, setStepCount });
    // Import Project to local
    if (backupProjectName) {
      setStepCount((prevStepCount) => prevStepCount + 1);
      await importServerProject(
        updateBurrito,
        selectedGiteaProject.repo,
        selectedGiteaProject.metaDataSB,
        selectedGiteaProject.auth,
        selectedGiteaProject.branch,
        null,
        selectedGiteaProject.localUsername,
        ignoreFilesPaths,
        t,
      );
      setStepCount((prevStepCount) => prevStepCount + 1);
      setMergeDone(true);
    }
  };

  const { addNotification } = useAddNotification();

  const checkBurritoVersion = async () => {
    if (burrito?.meta?.version !== selectedGiteaProject?.metaDataSB?.meta?.version) {
      setModel({
        openModel: true,
        title: t('modal-title-update-burrito'),
        confirmMessage: t('dynamic-msg-update-burrito-version', { version1: selectedGiteaProject?.metaDataSB?.meta?.version, version2: burrito?.meta?.version }),
        buttonName: t('btn-update'),
      });
    } else {
      await callFunction();
    }
  };

  const handleMergeStart = useCallback(
    async () => {
      try {
        const mergeResp = await tryMergeProjects(selectedGiteaProject, ignoreFilesPaths, { setStepCount, setModel });
        if (mergeResp && mergeResp?.status) {
          setNotify(mergeResp.status);
          setSnackText(mergeResp.message);
          await addNotification('Sync', mergeResp?.message, mergeResp?.status);
          if (mergeResp.status === 'failure' && mergeResp?.conflictHtml) {
            setMergeConflict(true);
            setConflictHtml(mergeResp.conflictHtml);
          } else {
            await checkBurritoVersion();
          }
        }
      } catch (err) {
        setMergeError(true);
        setNotify('failure');
        setSnackText(`Merge failed : ${err?.message || err}`);
        await addNotification('Sync', `Merge failed : ${err?.message || err}`, 'failure');
        setMergeDone(false);
      } finally {
        await deleteCreatedMergeBranch(selectedGiteaProject, { setModel, setStepCount }, environment.GITEA_API_ENDPOINT);
        setOpenSnackBar(true);
        setStepCount(0);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedGiteaProject],
  );

  useEffect(() => {
    (async () => {
      await handleMergeStart();
    })();
  }, [handleMergeStart]);

  useEffect(() => {
    if (mergeDone) {
      const timer = counter > 0 && setInterval(() => setCounter(counter - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [counter, mergeDone]);

  const modalClose = async () => {
    if (mergeDone || mergeError || mergeConflict) {
      setSelectedGiteaProject((prev) => ({ ...prev, mergeStatus: false }));
      setModel({
        openModel: '', title: '', confirmMessage: '', buttonName: '',
      });
      if (mergeDone) {
        await undoMergeOrDeleteOldBackup(selectedGiteaProject, backupName, environment.SYNC_BACKUP_COUNT, false);
        setMergeDone(false);
      }
    }
  };

  const handleClickUndo = async () => {
    await undoMergeOrDeleteOldBackup(selectedGiteaProject, backupName, environment.SYNC_BACKUP_COUNT, true);
    setMergeDone(false);
    setSelectedGiteaProject((prev) => ({ ...prev, mergeStatus: false }));
  };

  return (
    <>
      <PopUpModal
        isOpen={selectedGiteaProject.mergeStatus}
        closeFunc={modalClose}
        head="Project Merging"
      >
        {!mergeConflict && !mergeError
        && (
          <>

            <div className="mt-2 text-sm">
              This may take a while ...
            </div>
            <div className="mt-2 ">
              <VerticalLinearStepper
                steps={mergeProgressSteps}
                stepCount={stepCount}
                successMsg="Merge Successfull"
              />
            </div>
          </>
        )}

        {mergeConflict && (
          <div>
            <div className="mt-3">
              <p className="text-sm">Can not perform merge - Conflict Exist</p>
              <div className="my-2 text-sm text-red-700 leading-6" dangerouslySetInnerHTML={{ __html: conflictHtml }} />
            </div>
          </div>
        )}

        <div className="mt-4 px-4 py-3 flex justify-between">
          <div className="">
            {(mergeDone || mergeError || mergeConflict) && (
              <button
                aria-label="merge-ok"
                type="button"
                className={`w-20 h-10 ${!((mergeDone || mergeError || mergeConflict)) ? 'bg-gray-500' : 'bg-success'} leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase`}
                onClick={modalClose}
              >
                {t('btn-ok')}
              </button>
            )}
            {(!mergeDone && !mergeConflict && counter > 0) && (
              <div className="ml-1">
                <LoadingSpinner />
              </div>
            )}
          </div>

          {(mergeDone && counter > 0) && (
            <>
              <div className="">
                <button
                  aria-label="merge-undo"
                  type="button"
                  className="w-20 h-10  bg-red-700 leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                  onClick={handleClickUndo}
                >
                  Undo
                </button>
              </div>
              <div className="text-2xl font-medium box-border items-center justify-center">
                <div className="animate-ping">
                  {counter}
                </div>
              </div>
            </>
          )}
        </div>

      </PopUpModal>
      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modalClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => callFunction()}
      />

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
ProjectMergePop.propTypes = {
  selectedGiteaProject: PropTypes.object,
  setSelectedGiteaProject: PropTypes.func,
};
