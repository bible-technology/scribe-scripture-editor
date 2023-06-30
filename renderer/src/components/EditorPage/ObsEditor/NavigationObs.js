/* eslint-disable react/prop-types */
// import PropTypes from 'prop-types';
import { Disclosure, Dialog, Transition } from '@headlessui/react';
import {
  Fragment, useRef, useState,
} from 'react';
import {
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';

import styles from '../Navigation/reference/SelectReference.module.css';

const SelectFile = ({ openChapter, onChapterSelect }) => (
  <Disclosure>
    {openChapter && (
      <Transition
        show={openChapter}
        enter="transition duration-100 ease-out"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition duration-75 ease-out"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <Disclosure.Panel className="grid grid-cols-10 gap-x-7 gap-y-5 text-center bg-black text-white text-md font-medium tracking-wide uppercase" static>
          {Array.from(Array(50), (e, i) => (
            <div
              role="button"
              key={i}
              onClick={(e) => { onChapterSelect(e, i + 1); }}
              className={styles.select}
              tabIndex={0}
            >
              {i + 1}
            </div>
        ))}
        </Disclosure.Panel>
      </Transition>
  )}
  </Disclosure>
);

export default function NavigationObs({ onChangeNumber, number }) {
  const [openVerse, setOpenVerse] = useState(false);
  const cancelButtonRef = useRef(null);

  const [openChapter, setOpenChapter] = useState(true);
  const onChapterSelect = (e, chapterNum) => {
    e.preventDefault();
    onChangeNumber(chapterNum);
    setOpenChapter(false);
    setOpenVerse(false);
  };
  function closeVerses() {
    setOpenVerse(false);
  }

  function selectBook() {
    setOpenVerse(true);
    setOpenChapter(true);
  }

  return (
    <>
      <div className="flex">
        <div className="bg-primary text-white py-2 uppercase tracking-wider text-xs font-semibold">
          <span className="px-3">
            Story
            {' '}
            {number}
          </span>
          <span
            className="focus:outline-none bg-white py-4 bg-opacity-10"
            onClick={selectBook}
            role="button"
            tabIndex="-1"
            aria-label="obs-navigation"
          >
            <ChevronDownIcon className="focus:outline-none inline h-4 w-4 mx-1 text-white" aria-hidden="true" />
          </span>
        </div>
      </div>

      <Transition
        show={openVerse}
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
          className="h-full fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          static
          open={openVerse}
          onClose={closeVerses}
        >
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">

            <div className="w-5/12 h-72 z-50 flex items-center justify-center bg-black text-white shadow overflow-hidden sm:rounded-lg">
              <SelectFile
                openChapter={openChapter}
                onChapterSelect={onChapterSelect}
              >
                <button
                  type="button"
                  className="focus:outline-none w-9 h-9 bg-black p-2"
                  onClick={closeVerses}
                >
                  <XMarkIcon />
                </button>
              </SelectFile>
            </div>
          </div>

        </Dialog>
      </Transition>
    </>
  );
}
