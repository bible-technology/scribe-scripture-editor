/* eslint-disable no-useless-escape */
import React, {
  useRef, Fragment,
  useEffect,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import updateTranslationSB from '@/core/burrito/updateTranslationSB';
import updateObsSB from '@/core/burrito/updateObsSB';
import { SnackBar } from '@/components/SnackBar';
// import useSystemNotification from '@/components/hooks/useSystemNotification';
// import { LoadingSpinner } from '@/components/LoadingSpinner';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import CloseIcon from '@/illustrations/close-button-black.svg';
import * as logger from '../../logger';
import burrito from '../../lib/BurritoTemplate.json';
import ScopeManagement from './scope-management/ScopeManagement';
import { readProjectScope } from './utils/readProjectScope';
import { LoadingSpinner } from '../LoadingSpinner';

export default function ProjectMangement(props) {
  const {
    open,
    closePopUp,
    project,
  } = props;
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [valid, setValid] = React.useState(false);
  const [snackBar, setOpenSnackBar] = React.useState(false);
  const [snackText, setSnackText] = React.useState('');
  const [notify, setNotify] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);
  const [checkText, setCheckText] = React.useState(false);
  const [totalExported, setTotalExported] = React.useState(0);
  const [totalExports, setTotalExports] = React.useState(0);
  const [exportStart, setExportstart] = React.useState(false);

  const [metadata, setMetadata] = React.useState('');
  const [loading, setLoading] = React.useState(false);

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

  const updateBurritoVersion = (username) => {
    logger.debug('ExportProjectPopUp.js', 'Inside updateBurritoVersion');
    setTotalExported(1); // 1 step of 2 finished
    if (project?.type === 'Text Translation') {
      updateTranslationSB(username, project, openModal);
    } else if (project?.type === 'OBS') {
      updateObsSB(username, project, openModal);
    }
    setOpenModal(false);
  };

  // load Metadata of the project
  const getProjectMetadata = useCallback(async () => {
    try {
      setLoading(true);
      const projectFullName = `${project?.name}_${project?.id?.[0]}`;
      const projectMeta = await readProjectScope(projectFullName);
      setMetadata(projectMeta);
    } catch (err) {
      console.error('Read Meta : ', err);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    getProjectMetadata();
  }, [getProjectMetadata]);

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
          onClose={() => {}}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">
            <div className="w-[80vw] h-[80vh] max-w-[80vw] max-h-[80vh] items-center justify-center m-auto z-50 shadow overflow-hidden rounded">
              <div className="relative h-full rounded shadow overflow-hidden bg-white flex flex-col">

                <div className="flex justify-between items-center bg-secondary">
                  <div className="uppercase bg-secondary text-white py-2 px-2 text-xs tracking-widest leading-snug rounded-tl text-center flex gap-2">
                    <span>Project Management</span>
                    <span>:</span>
                    <span>{project?.name}</span>
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

                <div className=" w-full h-full flex-1 flex flex-col overflow-y-scroll mb-5">

                  <div className="flex-grow-[5]">
                    {loading ? <LoadingSpinner /> : <ScopeManagement metadata={metadata} />}
                  </div>

                  <div className="h-[10%] flex justify-end items-center me-5">
                    <button
                      type="button"
                      onClick={close}
                      className="mr-5 bg-error w-28 h-8 border-color-error rounded
                                  uppercase shadow text-white text-xs tracking-wide leading-4 font-light focus:outline-none"
                    >
                      {t('btn-cancel')}
                    </button>
                    <button
                      type="button"
                      aria-label="edit-language"
                      className=" bg-success w-28 h-8 border-color-success rounded uppercase text-white text-xs shadow focus:outline-none"
                      onClick={() => console.log('Apply scope change clicked')}
                    >
                      Apply
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
ProjectMangement.propTypes = {
  open: PropTypes.bool,
  closePopUp: PropTypes.func,
  project: PropTypes.object,
};
