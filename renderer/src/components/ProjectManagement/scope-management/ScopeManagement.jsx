import React, { useState } from 'react';
import { useBibleReference } from 'bible-reference-rcl';
import ScopeHead from './ScopeHead';
import TitleBar from './TitleBar';
import BookButton from '../Common/Button/BookButton';

const initialBook = 'gen';
const initialChapter = '1';
const initialVerse = '1';

function ScopeManagement() {
  const [selectedOption, setSelectedOption] = useState('');

  const {
    state: {
      chapter,
      verse,
      bookList,
      chapterList,
      verseList,
      bookName,
      bookId,
    }, actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
    },
  } = useBibleReference({
    initialBook,
    initialChapter,
    initialVerse,
  });

  console.log('BOOK ============>', {
    bookList, chapterList, verseList, chapter, verse, bookName, bookId,
  });

  const handleChangeBookToggle = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleSelectBook = (e, book) => {
    console.log('clicked book : ', book);
  };

  return (
    <div className="w-full h-full pt-5 px-5">
      <ScopeHead>Project Scope Management</ScopeHead>
      <TitleBar>
        <p className="text-gray-900 text-center text-sm">Book Selection</p>

        <div className="px-2 h-8 flex gap-3 text-sm text-gray-800 items-center">
          <div className="flex gap-1 items-center">
            <input
              type="radio"
              value="all"
              className="pr-2"
              checked={selectedOption === 'all'}
              onChange={handleChangeBookToggle}
            />
            <label className="">
              All
            </label>
          </div>

          <div className="flex gap-1 items-center">
            <input
              type="radio"
              value="old"
              checked={selectedOption === 'old'}
              onChange={handleChangeBookToggle}
            />
            <label className="">
              Old
            </label>
          </div>

          <div className="flex gap-1 items-center">
            <input
              type="radio"
              value="new"
              checked={selectedOption === 'new'}
              onChange={handleChangeBookToggle}
            />
            <label className="">
              New
            </label>
          </div>
        </div>
      </TitleBar>

      <div className="grid grid-cols-2 gap-5">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] grid grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase">
          {bookList?.slice(0, 39)?.map((book) => (
            <BookButton
              onClick={(e) => handleSelectBook(e, book)}
              key={book.key}
            >
              {book.name}
            </BookButton>
          ))}
        </div>

        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] grid grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase content-start">
          {bookList?.slice(39)?.map((book) => (
            <BookButton
              onClick={(e) => handleSelectBook(e, book)}
              key={book.key}
            >
              {book.name}
            </BookButton>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ScopeManagement;
