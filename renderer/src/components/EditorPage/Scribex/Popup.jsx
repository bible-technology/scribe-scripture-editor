import React, { useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';

const Popup = ({
  handleClose, handleButtonClick, title, isPopupOpen,
}) => {
  const [number, setNumber] = useState('');
  console.log({ title });
  const handleInputChange = (event) => {
    setNumber(event.target.value);
  };

  const handleSubmit = () => {
    handleButtonClick(number, title);
    handleClose();
  };

  return (
    <Transition show as={Fragment}>
      <Dialog
        open={isPopupOpen}
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out "
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in "
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          />
          <Transition.Child
            as={Fragment}
            enter="ease-out "
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in "
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-md">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                {title}
                {' '}
                {title === 'Verse' || 'Chapter' ? Number : ''}
              </Dialog.Title>
              <div className="mt-2">
                {title === ('Verse' || 'Chapter')
                  ? (
                    <input
                      type="number"
                      placeholder={`${title} Number...`}
                      className="block w-full border-gray-300 rounded-md shadow-sm appearance-none"
                      value={number}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder={`${title} Number...`}
                      className="block w-full border-gray-300 rounded-md shadow-sm appearance-none"
                      value={number}
                      onChange={handleInputChange}
                    />
                  )}

              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-secondary"
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

Popup.propTypes = {
  handleClose: PropTypes.func.isRequired,
  handleButtonClick: PropTypes.func.isRequired,
};

export default Popup;
