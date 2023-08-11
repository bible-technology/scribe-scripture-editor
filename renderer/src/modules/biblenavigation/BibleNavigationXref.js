import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import {
  Fragment, useContext, useEffect, useRef, useState,
} from 'react';
import SelectBook from '@/components/EditorPage/Navigation/reference/SelectBook';
import SelectVerse from '@/components/EditorPage/Navigation/reference/SelectVerse';

import { ReferenceContext } from '@/components/context/ReferenceContext';
import ChevronDownIcon from '@/icons/Common/ChevronDown.svg';
import XMarkIcon from '@/icons/Common/XMark.svg';

export default function BibleNavigationXref(props) {
  const {
    showVerse, chapterNumber, setChapterNumber, verseNumber, setVerseNumber,
  } = props;
  const supportedBooks = null; // if empty array or null then all books available

  const {
    state: {
      bookId,
      bookList,
      bookName,
      chapter,
      verse,
      chapterList,
      verseList,
      // languageId,
      //  closeNavigation,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
      setCloseNavigation,
    },
  } = useContext(ReferenceContext);

  useEffect(() => {
    applyBooksFilter(supportedBooks);
  }, [applyBooksFilter, supportedBooks]);

  const [openBook, setOpenBook] = useState(false);
  const [openVerse, setOpenVerse] = useState(false);
  const cancelButtonRef = useRef(null);

  const [multiSelectVerse] = useState(false);
  const [multiSelectBook] = useState(false);
  const [selectedVerses, setSelectedVerses] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [verselectActive, setVerseSelectActive] = useState(false);

  function closeBooks() {
    setOpenBook(false);
  }

  function openBooks() {
    setSelectedBooks([(bookId.toUpperCase())]);
    setOpenBook(true);
  }

  function closeVerses() {
    setOpenVerse(false);
    if (multiSelectVerse) { setVerseSelectActive(true); }
  }

  function selectBook() {
    setOpenBook(false);
    setOpenVerse(true);
    if (multiSelectVerse) { setSelectedVerses([]); }
  }

  // useEffect(() => {
  //   async function setReference() {
  //     // await localforage.setItem('navigationHistory', [bookId, chapter, verse]);
  //   }
  //   setReference();
  // }, [bookId, chapter, verse]);

  useEffect(() => {
    if (openBook === false && openVerse === false) {
      setCloseNavigation(true);
    }
    if (openBook || openVerse) {
      setCloseNavigation(false);
    }
  }, [openVerse, openBook, setCloseNavigation]);

  useEffect(() => {
    // document.getElementById('editor').querySelector(`#ch-${chapterNumber}`)?.scrollIntoView();
    // document.getElementById('editor').querySelector(`#ch${chapter}v${verseNumber}`)?.scrollIntoView();
  }, [verseNumber, chapterNumber]);

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
          <span className="px-3">{verseNumber}</span>
          {showVerse
            && (
              <span className="px-3">
                {multiSelectVerse
                  ? selectedVerses.join()
                  : verse}
              </span>
            )}
        </div>
      </div>
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
                // The SelectBook is also been used to set the Canon-Scope for the projects and
                // "scope" is added to disable the click on the book list. scope="Other" will only
                // allow to click/select the book.
                scope="Other"
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
          className="fixed inset-0 z-10 overflow-y-auto"
          initialFocus={cancelButtonRef}
          static
          open={openVerse}
          onClose={closeVerses}
        >

          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          <div className="flex items-center justify-center h-screen">

            <div className=" w-6/12 max-w-md m-auto z-50 bg-black text-white shadow overflow-hidden sm:rounded-lg">
              <SelectVerse
                chapter={chapter}
                verse={verse}
                chapterList={chapterList}
                verseList={verseList}
                bookName={bookName}
                onChangeChapter={onChangeChapter}
                onChangeVerse={onChangeVerse}
                closeBooks={closeBooks}
                closeVerses={closeVerses}
                multiSelectVerse={multiSelectVerse}
                selectedVerses={selectedVerses}
                setSelectedVerses={setSelectedVerses}
                verselectActive={verselectActive}
                setVerseSelectActive={setVerseSelectActive}
                setChapterNumber={setChapterNumber}
                setVerseNumber={setVerseNumber}
              >
                <button
                  type="button"
                  className="focus:outline-none w-9 h-9 bg-black p-2"
                  onClick={closeVerses}
                >
                  <XMarkIcon />
                </button>
              </SelectVerse>
            </div>
          </div>

        </Dialog>
      </Transition>
    </>
  );
}

BibleNavigationXref.propTypes = {
  showVerse: PropTypes.bool,
};
