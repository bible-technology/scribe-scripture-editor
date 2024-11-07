import {
  Fragment, useState, useEffect, useRef,
} from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Popover, Transition } from '@headlessui/react';
import PropTypes from 'prop-types';
import { createRoot } from 'react-dom/client';

const colors = {
  success: '#82E0AA',
  failure: '#F5B7B1',
  warning: '#F8C471',
  info: '#85C1E9',
  update: '#D5D8DC',
};

const AutoSnackBar = ({
  snackText,
  snackType,
  isOpen,
  onClose,
}) => {
  const handleTransitionEnd = () => {
    if (!isOpen) {
      onClose();
    }
  };

  return (
    <Popover className="fixed bottom-0 left-0 w-60 z-50">
      <Transition
        show={isOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
        afterLeave={handleTransitionEnd}
      >
        <Popover.Panel className="transform transition-all p-4">
          <div
            className="relative p-5 mt-5 rounded-lg text-sm font-semibold text-gray-600"
            style={{ fontFamily: 'sans-serif', backgroundColor: colors[snackType] }}
          >
            <button
              type="button"
              className="bg-black absolute top-0 right-0 h-6 w-6 rounded-full text-center text-white p-1 -mt-2 -mr-2 focus:outline-none"
              onClick={onClose}
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

AutoSnackBar.propTypes = {
  snackText: PropTypes.string,
  snackType: PropTypes.string,
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};

export const useAutoSnackbar = () => {
  const [snackbar, setSnackbar] = useState({
    isOpen: false,
    snackText: '',
    snackType: 'success',
  });
  const [timeLeft, setTimeLeft] = useState(null);
  const portalRef = useRef(null);
  const rootRef = useRef(null);
  const timerRef = useRef(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    if (!portalRef.current) {
      portalRef.current = document.createElement('div');
      portalRef.current.id = 'snackbar-portal';
      document.body.appendChild(portalRef.current);
    }

    if (!rootRef.current && portalRef.current) {
      rootRef.current = createRoot(portalRef.current);
    }

    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }

      if (portalRef.current && document.body.contains(portalRef.current)) {
        document.body.removeChild(portalRef.current);
        portalRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mountedRef.current && rootRef.current) {
      rootRef.current.render(
        <AutoSnackBar
          snackText={snackbar.snackText}
          snackType={snackbar.snackType}
          isOpen={snackbar.isOpen}
          onClose={() => {
            if (mountedRef.current) {
              setSnackbar((prev) => ({ ...prev, isOpen: false }));
              setTimeLeft(null);
            }
          }}
        />,
      );
    }
  }, [snackbar]);

  useEffect(() => {
    if (timeLeft === 0 && mountedRef.current) {
      setSnackbar((prev) => ({ ...prev, isOpen: false }));
      setTimeLeft(null);
      return;
    }

    if (!timeLeft) { return; }

    timerRef.current = setInterval(() => {
      if (mountedRef.current) {
        setTimeLeft((prev) => prev - 1);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timeLeft]);

  const showSnackbar = (text, type = 'success') => {
    if (mountedRef.current) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setSnackbar({
        snackText: text,
        snackType: type,
        isOpen: true,
      });
      setTimeLeft(type === 'failure' ? 15 : 8);
    }
  };

  return { showSnackbar };
};
