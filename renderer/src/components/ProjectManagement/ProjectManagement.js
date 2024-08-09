/* eslint-disable no-useless-escape */
import React, {
  useRef, Fragment,
} from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import updateTranslationSB from '@/core/burrito/updateTranslationSB';
import updateObsSB from '@/core/burrito/updateObsSB';
import { SnackBar } from '@/components/SnackBar';
// import useSystemNotification from '@/components/hooks/useSystemNotification';
// import { LoadingSpinner } from '@/components/LoadingSpinner';
import CloseIcon from '@/illustrations/close-button-black.svg';
import * as logger from '../../logger';
import burrito from '../../lib/BurritoTemplate.json';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';

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
  const [metadata, setMetadata] = React.useState({});
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
                    Project Mangement
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
                  <p>Project Management</p>
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
