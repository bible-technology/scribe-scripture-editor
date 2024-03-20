import React from 'react';
import PropTypes from 'prop-types';
// import localforage, * as localForage from 'localforage';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import * as logger from '../../../logger';

import DownloadCreateSBforHelps from './DownloadCreateSBforHelps';
import { handleDownloadResources } from './createDownloadedResourceSB';
import Door43Logo from '@/icons/door43.svg';
import { environment } from '../../../../environment';

// const path = require('path');

const checkHelpsVersionUpdate = async (reference, selectResource) => {
  try {
      logger.debug('checkHelpsUpdatePopup.js', 'check update for resource');
      // console.log('reference : ', { reference, selectResource });
      return new Promise((resolve) => {
        let subject = null;
        let lang = null;
        let owner = null;
        let currentResourceReleased = null;
        let currentVersion = null;
        let latestResourceReleased = null;
        if (selectResource === 'obs' || selectResource === 'bible') {
          currentResourceReleased = reference?.value?.resourceMeta?.released;
          currentVersion = reference?.value?.resourceMeta?.release?.name;
          subject = reference?.value?.resourceMeta?.subject;
          lang = reference?.value?.resourceMeta?.language;
          owner = reference?.value?.resourceMeta?.owner;
        } else {
        // get released from repo fetch new meta
        currentResourceReleased = reference?.value?.meta?.released;
        currentVersion = reference?.value?.meta?.release?.name;
        subject = reference?.value?.meta?.subject;
        lang = reference?.value?.meta?.language;
        owner = reference?.value?.meta?.owner;
        }
        if (subject && lang && owner) {
        // fetch(`https://git.door43.org/api/catalog/v5/search?subject=${subject}&lang=${lang}&owner=${owner}`)
        fetch(`${environment.GITEA_API_ENDPOINT}/catalog/search?metadataType=rc&metadataType=sb&subject=${subject}&lang=${lang}&owner=${owner}`)
        .then((res) => res.json())
        .then((resultMeta) => {
            // console.log({ resultMeta });
            latestResourceReleased = resultMeta?.data[0]?.released;

            // check for update
            // currentResourceReleased = '2019-03-02T23:38:13Z';
            // console.log({ currentResourceReleased, latestResourceReleased });
            logger.debug('checkHelpsVersionUpdate.js', { currentResourceReleased, latestResourceReleased });
            if (new Date(latestResourceReleased) > new Date(currentResourceReleased)) {
                resolve({
                  status: true,
                  currentVersion,
                  latestVersion: resultMeta?.data[0]?.release?.name,
                  latestMeta: resultMeta?.data[0],
                });
                logger.debug('checkHelpsVersionUpdate.js', 'update avaailable');
            } else {
                resolve({
                  status: false,
                  currentVersion,
                  latestVersion: resultMeta?.data[0]?.release?.name,
                  latestMeta: resultMeta?.data[0],
                });
                logger.debug('checkHelpsVersionUpdate.js', 'No update avaailable');
            }
        });
      }
    });
  } catch (err) {
      // console.log('error check update :', { err });
      logger.debug('checkHelpsVersionUpdate.js', 'error check update :', { err });
  }
};

function CheckHelpsUpdatePopUp({ resource, selectResource }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isloading, setIsLoading] = React.useState(false);
    const [versions, setVersions] = React.useState({});
    const [updateStatus, setUpdateStatus] = React.useState(null);
    const { t } = useTranslation();
    const [snackBar, setOpenSnackBar] = React.useState(false);
    const [snackText, setSnackText] = React.useState('');
    // eslint-disable-next-line no-unused-vars
    const [notify, setNotify] = React.useState();

    const modalClose = () => {
        if (!isloading) {
          setIsOpen(false);
        }
      };

    const UpdateResource = async () => {
      if (selectResource === 'obs' || selectResource === 'bible') {
        const resourceData = {};
        const lang = resource?.value?.resourceMeta?.language;
        resourceData[lang] = [resource?.value?.resourceMeta];
        setIsLoading(true);
        await handleDownloadResources(resourceData, selectResource, null, { status: true, oldResource: resource })
        .then(() => {
          setIsLoading(false);
          setNotify('success');
          setSnackText('Resource Updated');
          setOpenSnackBar(true);
          modalClose();
        }).catch((err) => {
          setIsLoading(false);
          setNotify('failure');
          setSnackText(`Resource Update failed ${err}`);
          setOpenSnackBar(true);
          modalClose();
        });
      } else {
        await DownloadCreateSBforHelps(versions?.meta, setIsLoading, { status: true, prevVersion: resource?.value?.meta?.release?.tag_name, setIsOpen })
        .then(() => {
          setNotify('success');
          setSnackText('Resource Updated');
          setOpenSnackBar(true);
        }).catch((err) => {
          setNotify('failure');
          setSnackText(`Resource Update failed ${err}`);
          setOpenSnackBar(true);
        });
      }
    };

    // React.useEffect(() => {
    // }, []);

    const handleCheckUpdateHelpsResources = async (event, resource) => {
      setIsOpen(true);
      setIsLoading(true);
      await checkHelpsVersionUpdate(resource, selectResource)
      .then((obj) => {
        setUpdateStatus(obj.status);
        setVersions({ current: obj?.currentVersion, latest: obj?.latestVersion, meta: obj?.latestMeta });
        setIsLoading(false);
      });
    };

    return (
      <>
        <div
          className="text-xs cursor-pointer focus:outline-none"
          role="button"
          tabIndex={0}
          title={t('label-check-updates')}
          onClick={(e) => handleCheckUpdateHelpsResources(e, resource)}
        >
          <ArrowPathIcon
            className="w-4 h-4"
          />
        </div>
        <Transition appear show={isOpen} as={React.Fragment}>
          <Dialog as="div" className="relative z-50" onClose={modalClose}>
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-black bg-opacity-30 pointer-events-none" />
              </Transition.Child>

              <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                  <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Dialog.Panel className="bg-gray-200  w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all">
                      <div className="flex mr-2 justify-between">
                        <div className="">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-bold leading-6 text-gray-900"
                          >
                            Resource Update
                          </Dialog.Title>
                        </div>
                        <div className="">
                          <a className="bg-secondary text-white inline-block rounded-t py-2 px-4 text-sm uppercase" href="#a">
                            {/* <img className="inline mr-2 w-6" src="/brands/door43.png" alt="Door 43 Logo" /> */}
                            <Door43Logo className="inline mr-2 w-4" fill="#9bc300" />
                            {/* <img className="inline mr-2 w-6" src="/brands/door43.png" alt="" /> */}
                            {t('label-door43')}
                          </a>
                        </div>
                      </div>

                      <div className="mt-3">
                        {updateStatus !== null && updateStatus ? (
                          <div>
                            {isloading ? (
                              <div>
                                <LoadingScreen />
                              </div>
                            ) : (
                              <>
                                <p className="text-sm pb-1">
                                  updates available for the resource
                                </p>
                                <div>
                                  <p className="text-sm pb-1">
                                    <strong>{versions?.current}</strong>
                                    <span className="px-2 text-lg">
                                      {String.fromCharCode(8594)}
                                      {' '}
                                    </span>
                                    <strong>{versions?.latest}</strong>
                                  </p>
                                </div>
                                <p className="text-sm">Do you want to update ?</p>
                              </>
                              )}
                          </div>
                        ) : (
                          <div>
                            {isloading ? (
                              <div>
                                <LoadingScreen />
                              </div>
                            ) : (
                              <p className="text-sm">
                                No updates available
                                latest Version is
                                {' '}
                                <strong>{versions?.latest}</strong>
                              </p>
                              )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 ">
                        <div className="bg-gray-200 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                          {updateStatus
                            ? (
                              <>
                                <button
                                  aria-label="confirm-update"
                                  type="button"
                                  className="w-20 h-10 bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                                  onClick={UpdateResource}
                                >
                                  {t('btn-update')}
                                </button>
                                <button
                                  aria-label="close-update"
                                  type="button"
                                  className="w-20 h-10 mx-2 bg-error leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                                  onClick={modalClose}
                                >
                                  {t('btn-cancel')}
                                </button>
                              </>
                            ) : (
                              <button
                                aria-label="update-cancel"
                                type="button"
                                className="w-20 h-10 bg-success leading-loose rounded shadow text-xs font-base  text-white tracking-wide  font-light uppercase"
                                onClick={modalClose}
                              >
                                {t('btn-ok')}
                              </button>
                            )}
                        </div>
                      </div>

                    </Dialog.Panel>
                  </Transition.Child>
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

CheckHelpsUpdatePopUp.propTypes = {
    resource: PropTypes.object,
    selectResource: PropTypes.string,
  };

export default CheckHelpsUpdatePopUp;
