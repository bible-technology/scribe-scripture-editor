/* eslint-disable no-useless-escape */
import React, {
  useRef, Fragment,
  useEffect,
  useCallback,
  useState,
} from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
// import { LoadingSpinner } from '@/components/LoadingSpinner';
import CloseIcon from '@/illustrations/close-button-black.svg';
import * as logger from '../../logger';
import ScopeManagement from './scope-management/ScopeManagement';
import { readProjectScope } from './utils/readProjectScope';
import { LoadingSpinner } from '../LoadingSpinner';
import { updateBurritoScope } from './utils/updateBurritoScope';

export default function ProjectMangement(props) {
  const {
    open,
    closePopUp,
    project,
  } = props;
  const { t } = useTranslation();
  const cancelButtonRef = useRef(null);
  const [snackBar, setOpenSnackBar] = useState(false);
  const [snackText, setSnackText] = useState('');
  const [notify, setNotify] = useState();
  const [currentScope, setCurrentScope] = useState({});
  const [metadata, setMetadata] = useState('');
  const [loading, setLoading] = useState(false);
  const [backendScope, setBackendScope] = useState({});

  const close = () => {
    logger.debug('ProjectMangement.js', 'Closing the Dialog Box');
    setOpenSnackBar(true);
    closePopUp(false);
    setMetadata({});
  };

  // load Metadata of the project
  const getProjectMetadata = useCallback(async () => {
    try {
      setLoading(true);
      const projectFullName = `${project?.name}_${project?.id?.[0]}`;
      const projectMeta = await readProjectScope(projectFullName);
      setMetadata(projectMeta.metadata);
      setBackendScope(projectMeta.scope);
    } catch (err) {
      logger.error('ProjectMangement.js', `Read Meta :  ${err}`);
    } finally {
      setLoading(false);
    }
  }, [project]);
  function compareNumbers(a, b) {
    return a - b;
  }
  const handleProject = () => {
    logger.debug('ProjectMangement.js', 'Inside updateBurrito');
    let mergedScope = currentScope;
    // Merge both existing and new scope, if any scope difference exists
    if (Object.keys(backendScope).length > 0) {
      Object.entries(backendScope).forEach((book) => {
        // Checking whether the book in scope is available in currentscope
        if (currentScope[book[0]]) {
          // merging the chapters of existing and selected books
          const scopeSet = backendScope[book[0]];
          const currentSet = currentScope[book[0]];
          const arr = [...scopeSet, ...currentSet];
          const mergedArr = [...new Set(arr)];
          mergedScope = { ...mergedScope, [book[0]]: mergedArr.sort(compareNumbers) };
        } else {
          mergedScope = { ...mergedScope, [book[0]]: Object.values(backendScope[book[0]]) };
        }
      });
    }
    metadata.type.flavorType.currentScope = mergedScope;
    const projectFullName = `${project?.name}_${project?.id?.[0]}`;
    updateBurritoScope(projectFullName, metadata).then(() => {
      setNotify('success');
      setSnackText('Scope updated successfully!');
      close();
    });
  };

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
                    <span>Scope Management</span>
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
                    {loading ? <LoadingSpinner /> : <ScopeManagement metadata={metadata} currentScope={currentScope} setCurrentScope={setCurrentScope} backendScope={backendScope} />}
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
                      onClick={() => handleProject()}
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
    </>
  );
}
ProjectMangement.propTypes = {
  open: PropTypes.bool,
  closePopUp: PropTypes.func,
  project: PropTypes.object,
};
