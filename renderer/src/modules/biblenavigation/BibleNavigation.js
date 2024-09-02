import PropTypes from 'prop-types';
import { Dialog, Transition } from '@headlessui/react';
import {
  Fragment, useContext, useEffect, useRef, useState,
} from 'react';
import {
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import * as localforage from 'localforage';
import SelectBook from '@/components/EditorPage/Navigation/reference/SelectBook';
import SelectVerse from '@/components/EditorPage/Navigation/reference/SelectVerse';

// import {
//   LockOpenIcon,
//   LockClosedIcon,
//   BookmarkIcon,
//   CogIcon,
//   ChatIcon,
// } from '@heroicons/react/24/outline';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { splitStringByLastOccurence } from '@/util/splitStringByLastMarker';
import { isElectron } from '../../core/handleElectron';

export default function BibleNavigation(props) {
  console.log('Navigation');
  const { showVerse } = props;
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
      languageId,
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
  const [existingScopes, setExistingScopes] = useState({});
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

  const getProjectScope = () => {
    console.log('getProjectScope - Bible Navigation');
    localforage.getItem('currentProject').then(async (projectName) => {
      const _projectname = await splitStringByLastOccurence(projectName, '_');
      // const _projectname = projectName?.split('_');
      localforage.getItem('projectmeta').then((value) => {
        console.log(value);
        Object?.entries(value).forEach(
          ([, _value]) => {
            console.log(_value);
            Object?.entries(_value).forEach(
              ([, resources]) => {
                console.log(resources);
                if (resources.identification.name.en === _projectname[0]) {
                  console.log('resource', resources.type.flavorType.currentScope);
                  setExistingScopes(resources.type.flavorType.currentScope);
                }
              },
            );
          },
        );
      });
    });
  };

  useEffect(() => {
    if (isElectron()) {
      localforage.getItem('refBibleBurrito')
        .then((refs) => {
          refs?.forEach((ref) => {
            if (languageId !== null) {
              if (ref.value.languages[0].tag === languageId) {
                const supportedBooks = [];
                Object.entries((ref.value.type.flavorType.currentScope)).forEach(
                  ([key]) => {
                    supportedBooks.push(key.toLowerCase());
                  },
                );
                applyBooksFilter(supportedBooks);
              }
            }
          });
        });
    }
  }, [languageId, applyBooksFilter]);

  useEffect(() => {
    localforage.setItem('navigationHistory', [bookId, chapter]);
  }, [bookId, chapter]);

  useEffect(() => {
    if (Object.keys(existingScopes) < 1) {
      getProjectScope();
    }
  }, []);

  useEffect(() => {
    if (openBook === false && openVerse === false) {
      setCloseNavigation(true);
    }
    if (openBook || openVerse) {
      setCloseNavigation(false);
    }
  }, [openVerse, openBook, setCloseNavigation]);

  return (
    <>
      <div className="flex">
        <div className="bg-primary text-white py-2 uppercase tracking-wider text-xs font-semibold">
          <span aria-label="editor-bookname" className="px-3">{bookName}</span>
          <span
            aria-label="open-book"
            className="focus:outline-none bg-white py-3 bg-opacity-10"
            onClick={openBooks}
            role="button"
            tabIndex="-2"
          >
            <ChevronDownIcon className="inline h-4 w-4 mx-1 text-white" aria-hidden="true" />
          </span>
          <span className="px-3">{chapter}</span>
          <span
            aria-label="open-chapter"
            className="focus:outline-none bg-white py-3 bg-opacity-10"
            onClick={selectBook}
            role="button"
            tabIndex="-1"
          >
            <ChevronDownIcon className="inline h-4 w-4 mx-1 text-white" aria-hidden="true" />
          </span>
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
                existingScope={[]}
                disableScope={existingScopes}
                call="audio-project"
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
                scopedChapters={existingScopes[bookId.toUpperCase()]}
                call="audio-project"
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

BibleNavigation.propTypes = {
  showVerse: PropTypes.bool,
};
