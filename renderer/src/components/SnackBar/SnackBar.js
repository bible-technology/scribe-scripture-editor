import React, {
 Fragment, useEffect, useState,
} from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';
import PropTypes from 'prop-types';

const colors = { success: '#82E0AA', failure: '#F5B7B1', warning: '#F8C471' };
const SnackBar = ({
  openSnackBar,
  snackText,
  setOpenSnackBar,
  setSnackText,
  error,
}) => {
  const [timeLeft, setTimeLeft] = useState(3);

  const closeSnackBar = () => {
    setOpenSnackBar(false);
    setSnackText('');
    setTimeLeft(null);
  };

  useEffect(() => {
    if (timeLeft === 0) {
      setTimeLeft(null);
    }

    if (!timeLeft) { return; }

    const intervalId = setInterval(() => {
      setTimeLeft(timeLeft - 1);
        if (timeLeft <= 1) {
            closeSnackBar();
        }
    }, 1000);

    return () => clearInterval(intervalId);
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [timeLeft]);

  useEffect(() => {
    if (openSnackBar) {
      setTimeLeft(3);
    }
  }, [openSnackBar]);

  return (
    <Popover className="fixed bottom-0 left-0 w-60 z-50 ">
      <Transition
        show={openSnackBar}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel className="transform transition-all p-4">
          <div className="relative p-5 mt-5 bg-validation rounded-lg text-sm font-semibold text-gray-600" style={{ fontFamily: 'sans-serif', backgroundColor: colors[error] }}>
            <button
              type="button"
              className="bg-black absolute top-0 right-0 h-6 w-6 rounded-full text-center text-white p-1 -mt-2 -mr-2 focus:outline-none"
              onClick={() => closeSnackBar(false)}
            >
              <XMarkIcon />
            </button>
            <p aria-label="snack-text">
              {snackText}
            </p>
          </div>
        </Popover.Panel>
      </Transition>
    </Popover>
  );
};

SnackBar.propTypes = {
  openSnackBar: PropTypes.bool,
  snackText: PropTypes.string,
  setOpenSnackBar: PropTypes.func,
  setSnackText: PropTypes.func,
  error: PropTypes.string,
};

export default SnackBar;
