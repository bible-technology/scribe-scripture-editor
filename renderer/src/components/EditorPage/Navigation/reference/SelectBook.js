/* eslint-disable no-nested-ternary */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Disclosure, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import styles from './SelectReference.module.css';

export default function SelectBook({
  children,
  bookList,
  selectBook,
  onChangeBook,
  multiSelectBook,
  selectedBooks,
  setSelectedBooks,
  scope,
  setBook,
  existingScope = [],
  disableScope = {},
  call = '',
  booksInProject = [],
}) {
  const [openNT, setOpenNT] = useState(true);
  const [openOT, setOpenOT] = useState(true);
  function toggleNT() {
    setOpenNT(true);
    setOpenOT(false);
  }
  function toggleOT() {
    setOpenOT(true);
    setOpenNT(false);
  }

  function toggle() {
    setOpenNT(true);
    setOpenOT(true);
  }
  const isBookAvailable = (bookKey) => {
    const lowerKey = bookKey.toLowerCase();
    const upperKey = bookKey.toUpperCase();

    if (call === 'audio-project') {
      return Object.prototype.hasOwnProperty.call(disableScope, upperKey);
    }

    if (booksInProject && booksInProject.length > 0) {
      return booksInProject.includes(lowerKey);
    }

    return true;
  };

  const getBookClassName = (book) => {
    const isAvailable = isBookAvailable(book.key);
    const isSelected = selectedBooks.includes(book.key.toUpperCase());

    if (!isAvailable) { return styles.disabled; }

    if (call === 'audio-project') {
      return Object.prototype.hasOwnProperty.call(disableScope, book.key.toUpperCase())
        ? (isSelected ? `${styles.bookSelect} ${styles.active}` : styles.bookSelect)
        : styles.disabled;
    }

    return isSelected ? `${styles.bookSelect} ${styles.active}` : styles.bookSelect;
  };

  function bookSelect(e, bookId) {
    e.preventDefault();

    if (!isBookAvailable(bookId)) { return; }

    onChangeBook(bookId, selectedBooks[0]);
    if (setBook) { setBook(bookId); }
    if (multiSelectBook === false) { selectBook(); }
  }

  function selectMultipleBooks(e, bookID) {
    const upperBook = bookID.toUpperCase();
    if (!selectedBooks.includes(upperBook)) {
      setSelectedBooks([...selectedBooks, upperBook]);
    } else {
      const updated = [...selectedBooks];
      const index = updated.indexOf(upperBook);
      if (!(scope === 'Other' && existingScope?.length > 0 && existingScope.includes(upperBook))) {
        updated.splice(index, 1);
      }
      setSelectedBooks(updated);
    }
  }
  React.useEffect(() => {
    if (scope === 'Old Testament (OT)') {
      toggleOT();
    } else if (scope === 'New Testament (NT)') {
      toggleNT();
    } else {
      toggle();
    }
  }, [scope]);
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-row text-center bg-gray-800 text-white text-sm font-bold tracking-wide uppercase">
        <div className="m-auto grid grid-cols-3 gap-0 bg-primary">
          <div role="button" aria-label="toggle all books" onClick={toggle} className="p-2 bg-black hover:bg-primary backdrop-opacity-20 cursor-pointer" tabIndex={0}>{t('btn-all')}</div>
          <div role="button" aria-label="toggle OT books" onClick={toggleOT} tabIndex={-1} className={openOT === false ? 'p-2 bg-black hover:bg-primary backdrop-opacity-20 cursor-pointer' : 'p-2 border-r-2 border-black hover:bg-black border-opacity-5 cursor-pointer'}>{t('btn-ot')}</div>
          <div role="button" aria-label="toggle NT books" onClick={toggleNT} tabIndex={-2} className={openNT === false ? 'p-2 bg-black hover:bg-primary backdrop-opacity-20 cursor-pointer' : 'p-2 border-r-2 border-black hover:bg-black border-opacity-5 cursor-pointer'}>{t('btn-nt')}</div>
        </div>
        <div className="flex justify-end">
          {children}
        </div>
      </div>

      <Disclosure>
        {openOT && (
          <>
            <div className="p-2 text-center bg-gray-200 text-gray-700 text-xs font-semibold tracking-wide uppercase cursor-pointer">
              {t('label-old-testament')}
            </div>
            <Transition
              show={openOT}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel static>
                <div className="bg-white grid grid-cols-4 gap-1 p-4 text-xxs text-left font-bold tracking-wide uppercase" style={{ pointerEvents: scope !== 'Other' ? 'none' : 'auto' }}>
                  {bookList.map((book, index) => (
                    index <= 38 && (
                      <div
                        role="presentation"
                        key={book.name}
                        aria-label={`ot-${book.name}`}
                        onClick={(e) => (multiSelectBook
                          ? selectMultipleBooks(e, book.key)
                          : bookSelect(e, book.key))}
                        className={getBookClassName(book)}
                      >
                        {book.name}
                      </div>
                    )
                  ))}
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}

      </Disclosure>
      <Disclosure>
        {openNT && (
          <>
            <div className="p-2 text-center bg-gray-200 text-gray-700 text-xs font-semibold tracking-wide uppercase cursor-pointer">
              {t('label-new-testament')}
            </div>
            <Transition
              show={openNT}
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel static>
                <div className="bg-white grid grid-cols-4 gap-1 p-4 text-xxs text-left font-bold tracking-wide uppercase" style={{ pointerEvents: scope !== 'Other' ? 'none' : 'auto' }}>
                  {bookList.map((book, index) => (index > 38 && (
                    <div
                      key={book.name}
                      role="presentation"
                      aria-label={`nt-${book.name}`}
                      onClick={(e) => (multiSelectBook
                        ? selectMultipleBooks(e, book.key)
                        : bookSelect(e, book.key))}
                      className={getBookClassName(book)}
                    >
                      {book.name}
                    </div>
                  )
                  ))}
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}

      </Disclosure>
    </>
  );
}

SelectBook.propTypes = {
  children: PropTypes.any,
  selectBook: PropTypes.func,
  onChangeBook: PropTypes.func,
  bookList: PropTypes.array,
  selectedBooks: PropTypes.array,
  multiSelectBook: PropTypes.bool,
  setSelectedBooks: PropTypes.func,
  scope: PropTypes.string,
};
