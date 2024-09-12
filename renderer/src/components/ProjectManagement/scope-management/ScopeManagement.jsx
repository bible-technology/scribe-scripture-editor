import React, { useEffect, useState } from 'react';
import { useBibleReference } from 'bible-reference-rcl';
import { useTranslation } from 'react-i18next';
import ScopeHead from './ScopeHead';
import TitleBar from './TitleBar';
import BookButton from '../Common/Button/BookButton';
import BulkSelectionGroup from './BulkSelectionGroup';
import Button from '../Common/Button/Button';
import BookItem from './BookItem';
import * as logger from '../../../logger';

const initialBook = 'gen';
const initialChapter = '1';
const initialVerse = '1';

function ScopeManagement({
  metadata, currentScope, setCurrentScope, backendScope,
}) {
  const { t } = useTranslation();
  const ToggleBookOptions = [
    { key: 'all', name: t('btn-all') },
    { key: 'old', name: t('btn-ot') },
    { key: 'new', name: t('btn-nt') },
    { key: 'none', name: t('label-deselect') },
  ];

  const ToggleChapterOptions = [
    { key: 'all', name: t('btn-all') },
    { key: 'none', name: t('label-deselect') },
  ];
  const [bookFilter, setBookFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [selectedChaptersSet, setSelectedChaptersSet] = useState(new Set([]));

  const {
    state: {
      // chapter,
      // verse,
      bookList,
      chapterList,
      // verseList,
      bookName,
      bookId,
    }, actions: {
      onChangeBook,
      // onChangeChapter,
      // onChangeVerse,
      // applyBooksFilter,
    },
  } = useBibleReference({
    initialBook,
    initialChapter,
    initialVerse,
  });

  const handleChangeBookToggle = (event) => {
    setBookFilter(event.target.value);
    const bookObj = {};
    if (event.target.value === 'all') {
      bookList.forEach((book) => {
        bookObj[book.key.toUpperCase()] = [];
      });
    } else if (event.target.value === 'old') {
      bookList?.slice(0, 39)?.forEach((book) => {
        bookObj[book.key.toUpperCase()] = [];
      });
    } else if (event.target.value === 'new') {
      bookList?.slice(39)?.forEach((book) => {
        bookObj[book.key.toUpperCase()] = [];
      });
    }
    const bookCode = Object.keys(bookObj)[0];
    onChangeBook(bookCode, bookCode);
    setCurrentScope(bookObj);
  };

  const handleChangeChapterToggle = (event) => {
    setChapterFilter(event.target.value);
    let stringArray = [];
    if (event.target.value === 'all') {
      const numberArray = Array(chapterList.length).fill().map((_, idx) => 1 + idx);
      stringArray = numberArray.map(String);
    }
    setCurrentScope((prev) => {
      // check and change the selectedChapters
      setSelectedChaptersSet(new Set(stringArray));
      return ({ ...prev, [bookId.toUpperCase()]: stringArray });
    });
  };

  const handleSelectBook = (e, book) => {
    if (bookFilter) {
      setBookFilter('');
    }
    const bookCode = book.key.toUpperCase();
    setCurrentScope((prev) => {
      // check and change the selectedChapters
      setSelectedChaptersSet(new Set(prev[bookCode]) || new Set([]));
      return ({ ...prev, [bookCode]: prev[bookCode] || [] });
    });
    onChangeBook(book.key, book.key);
  };

  const handleChapterRangeSelection = (e) => {
    e.preventDefault();
    let start = parseInt(e.target?.start?.value, 10) || null;
    let end = parseInt(e.target?.end?.value, 10) || null;
    // hanlde start greater and end smaller
    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    const numberArray = Array(end - start + 1).fill().map((_, idx) => start + idx);
    const stringArray = numberArray.map(String);
    setCurrentScope((prev) => {
      // check and change the selectedChapters
      setSelectedChaptersSet(new Set(stringArray));
      return ({ ...prev, [bookId.toUpperCase()]: stringArray });
    });
    // e.target.start.value = '';
    // e.target.end.value = '';
  };

  const handleRemoveScope = (e, book) => {
    e.stopPropagation();
    if (bookFilter) {
      setBookFilter('');
    }
    const bukId = book.key.toUpperCase();
    const newScopeObj = { ...currentScope };
    delete newScopeObj[bukId];
    setCurrentScope(newScopeObj);
  };

  /**
   * Fn to toggle chapter selection for the active book
   */
  const handleChapterSelection = (e, chapter) => {
    if (chapterFilter) {
      setChapterFilter('');
    }
    const bukId = bookId.toUpperCase();
    if (bukId in currentScope) {
      setCurrentScope((prev) => {
        const currentCh = new Set(prev[bukId] || new Set([]));
        if (currentCh.has(chapter)) {
          currentCh.delete(chapter);
        } else {
          currentCh.add(chapter);
        }
        setSelectedChaptersSet(currentCh);
        return {
          ...prev,
          [bukId]: Array.from(currentCh),
        };
      });
    } else {
      logger.error('ScopeManagement.js', 'Active book is not in scope');
    }
  };

  // set current scope from meta
  useEffect(() => {
    if (metadata?.type?.flavorType?.currentScope) {
      const scopeObj = metadata?.type?.flavorType?.currentScope;
      // expect at least 1 scope - because creation and scope modification won't allow 0 scope
      setSelectedChaptersSet(new Set(scopeObj[0]) || new Set([]));
      const bookCode = Object.keys(scopeObj)[0].toUpperCase();
      onChangeBook(bookCode, bookCode);
      setCurrentScope(scopeObj);
    } else {
      logger.error('ScopeManagement.js', 'Unable to read the scope from burrito');
    }
  }, []);

  return (
    <div className="w-full h-full pt-5 px-5">
      <ScopeHead>Project Scope Management</ScopeHead>
      <TitleBar>
        <p className="text-gray-900 text-center text-sm">
          {t('label-book-selection')}
          {' '}
          :
        </p>
        <BulkSelectionGroup
          selectedOption={bookFilter}
          handleSelect={handleChangeBookToggle}
          toggleOptions={ToggleBookOptions}
        />
      </TitleBar>

      <div className="grid grid-cols-2 gap-5">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9]
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase"
        >
          {bookList?.slice(0, 39)?.map((book) => {
            const isScope = book?.key?.toUpperCase() in currentScope;
            return (
              <BookItem
                key={book.key}
                book={book}
                handleRemoveScope={handleRemoveScope}
                handleSelectBook={handleSelectBook}
                isInScope={isScope}
                disable={backendScope && book?.key?.toUpperCase() in backendScope}
              />
            );
          })}
        </div>

        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9]
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase content-start"
        >
          {bookList?.slice(39)?.map((book) => {
            const isScope = book?.key?.toUpperCase() in currentScope;
            return (
              <BookItem
                key={book.key}
                book={book}
                handleRemoveScope={handleRemoveScope}
                handleSelectBook={handleSelectBook}
                isInScope={isScope}
                disable={backendScope && book?.key?.toUpperCase() in backendScope}
              />
            );
          })}
        </div>
      </div>
      {bookName
        && (
        <TitleBar>
          <p className="text-gray-900 text-center text-sm flex gap-2">
            <span>
              {t('label-chapter-selection')}
              {' '}
              :
            </span>
            <span className="font-medium">{bookName}</span>
          </p>
          <BulkSelectionGroup
            selectedOption={chapterFilter}
            handleSelect={handleChangeChapterToggle}
            toggleOptions={ToggleChapterOptions}
          />
        </TitleBar>
      )}

      <form className="w-full my-2 flex gap-3 h-6  text-xxs justify-end" onSubmit={handleChapterRangeSelection}>
        <div className="flex gap-1 items-center ">
          <label>
            {t('label-start')}
            {' '}
            :
          </label>
          <input
            type="number"
            className="w-12 h-full  px-1 text-xs border-gray-400 outline-none rounded-[4px]"
            name="start"
            min={1}
            required
            max={(chapterList && chapterList.length - 1) || 149}
          />
        </div>
        <div className="flex gap-1 items-center">
          <label>
            {t('label-end')}
            {' '}
            :
          </label>
          <input
            type="number"
            className="w-12 h-full  px-1 text-xs border-gray-400 outline-none rounded-[4px]"
            name="end"
            min={1}
            required
            max={chapterList?.length || 150}
          />
        </div>

        <Button type="submit">
          {t('label-select')}
        </Button>
      </form>

      <div className="grid grid-cols-1">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] flex flex-wrap gap-2 p-4 text-xxs text-left  uppercase">
          {chapterList?.map(({ key, name }) => {
            const isInScope = selectedChaptersSet.has(key);
            const disable = backendScope && backendScope[bookId.toUpperCase()]?.includes(key);
            return (
              <BookButton
                onClick={(e) => handleChapterSelection(e, name)}
                key={key}
                // eslint-disable-next-line no-nested-ternary
                className={`border min-w-8 text-center ${disable ? 'bg-gray-400' : isInScope ? 'bg-primary text-white font-medium' : ''}`}
              >
                {name}
              </BookButton>
            );
          })}
        </div>
      </div>

    </div>
  );
}

export default ScopeManagement;
