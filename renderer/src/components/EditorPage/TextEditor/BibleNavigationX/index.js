import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import React, {
  Fragment, useContext, useEffect, useRef, useState,
} from 'react';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import * as localforage from 'localforage';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import SelectBook from './SelectBook';
import SelectChapter from './SelectChapter';

export default function BibleNavigationX(props) {
  const {
    chapterNumber, setChapterNumber, setBook, loading, bookAvailable, booksInProject,
  } = props;

  const {
    state: {
      bookId,
      bookList,
      bookName,
      chapter,
      chapterList,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      setCloseNavigation,
    },
  } = useContext(ReferenceContext);

  const [openBook, setOpenBook] = useState(false);
  const [openChapter, setOpenChapter] = useState(false);
  const cancelButtonRef = useRef(null);

  const [multiSelectBook] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]);

  function closeBooks() {
    setOpenBook(false);
  }

  function openBooks() {
    setSelectedBooks([(bookId.toUpperCase())]);
    setOpenBook(true);
  }

  function closeChapters() {
    setOpenChapter(false);
  }

  function selectBook() {
    setOpenBook(false);
    setOpenChapter(true);
  }

  useEffect(() => {
    async function setReference() {
      await localforage.setItem('navigationHistory', [bookId, chapter]);
    }
    setReference();
  }, [bookId, chapter]);

  useEffect(() => {
    if (openBook === false && openChapter === false) {
      setCloseNavigation(true);
    }
    if (openBook || openChapter) {
      setCloseNavigation(false);
    }
  }, [openChapter, openBook, setCloseNavigation]);

  return (
    <>
      <div className="flex flex-nowrap">
        <div className="bg-primary max-h-[40px] flex items-center justify-center text-white uppercase tracking-wider text-xs font-semibold">
          <span aria-label="editor-bookname" className="px-3">{bookName}</span>
          <span
            aria-label="open-book"
            className="focus:outline-none min-h-full bg-white py-2 bg-opacity-10"
            onClick={openBooks}
            role="button"
            tabIndex="-2"
          >
            <ChevronDownIcon className=" h-4 w-4 mx-1 text-white" aria-hidden="true" />
          </span>
          <span className="px-3">{chapterNumber}</span>
          <span
            aria-label="open-chapter"
            className="focus:outline-none bg-white py-2 bg-opacity-10"
            onClick={selectBook}
            role="button"
            tabIndex="-1"
          >
            <ChevronDownIcon className="\ h-4 w-4 mx-1 text-white" aria-hidden="true" />
          </span>
        </div>
      </div>
      <>
        <Transition
          show={openBook}
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
            open={openBook}
            onClose={closeBooks}
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <div className="flex items-center justify-center h-screen ">
              <div className="w-9/12 m-auto z-50 shadow overflow-hidden sm:rounded-lg">
                <SelectBook
                  selectBook={selectBook}
                  bookList={bookList}
                  onChangeBook={onChangeBook}
                  multiSelectBook={multiSelectBook}
                  selectedBooks={selectedBooks}
                  setSelectedBooks={setSelectedBooks}
                  setBook={setBook}
                  scope="Other"
                  booksInProject={booksInProject}
                >
                  <button
                    type="button"
                    className="focus:outline-none w-9 h-9 bg-black p-2"
                    onClick={closeBooks}
                  >
                    <XMarkIcon />
                  </button>
                </SelectBook>
              </div>
            </div>
          </Dialog>
        </Transition>

        <Transition
          show={openChapter && bookAvailable}
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
            open={!loading && openChapter}
            onClose={closeChapters}
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            <div className="flex items-center justify-center h-screen">
              <div className=" w-6/12 max-w-md m-auto z-50 bg-black text-white shadow overflow-hidden sm:rounded-lg">
                <SelectChapter
                  chapter={chapter}
                  chapterList={chapterList}
                  bookName={bookName}
                  onChangeChapter={onChangeChapter}
                  closeBooks={closeBooks}
                  closeChapters={closeChapters}
                  setChapterNumber={setChapterNumber}
                  loading={loading}
                >
                  <button
                    type="button"
                    className="focus:outline-none w-9 h-9 bg-black p-2"
                    onClick={closeChapters}
                  >
                    <XMarkIcon />
                  </button>
                </SelectChapter>
              </div>
            </div>
          </Dialog>
        </Transition>
      </>
    </>
  );
}

BibleNavigationX.propTypes = {
  chapterNumber: PropTypes.number,
  setChapterNumber: PropTypes.func,
  setBook: PropTypes.func,
  loading: PropTypes.bool,
  bookAvailable: PropTypes.bool,
};
