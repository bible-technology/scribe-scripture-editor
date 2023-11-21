/* eslint-disable react/no-danger */
import React, { Fragment, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export default function ConfirmationModal({
  openModal,
  setOpenModal,
  title,
  confirmMessage,
  buttonName,
  closeModal,
  buttonName2 = {
    active: false,
    loading: false,
  },
}) {
  const cancelButtonRef = useRef(null);
  const { t } = useTranslation();
  const close = () => {
    setOpenModal(false);
    closeModal();
  };

  return (
    <Transition.Root show={openModal} as={Fragment}>
      <Dialog as="div" className="fixed z-10 inset-0 overflow-y-auto" initialFocus={cancelButtonRef} onClose={setOpenModal}>
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title as="h3" aria-label="confirm-title" className="text-lg leading-6 font-medium text-gray-900">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        {/* {confirmMessage || 'Are you sure you want to deactivate your account?'} */}
                        <div dangerouslySetInnerHTML={{ __html: confirmMessage }} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {buttonName2.active && (
                <button
                  type="button"
                  className="w-full inline-flex gap-2 justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={buttonName2.action}
                >
                  {buttonName2.name}
                  {buttonName2.loading && (
                  <div
                    className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-neutral-100 motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status"
                  />
                )}
                </button>
                )}
                {buttonName && (
                <button
                  type="button"
                  aria-label="confirm-remove"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => close()}
                >
                  {buttonName}
                </button>
              ) }
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setOpenModal(false)}
                  ref={cancelButtonRef}
                >
                  {t('btn-cancel')}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

ConfirmationModal.propTypes = {
  openModal: PropTypes.bool,
  setOpenModal: PropTypes.func,
  title: PropTypes.string,
  confirmMessage: PropTypes.string,
  buttonName: PropTypes.string,
  closeModal: PropTypes.func,
};
