import React, { useState } from 'react';
import { useBibleReference } from 'bible-reference-rcl';
import ScopeHead from './ScopeHead';
import TitleBar from './TitleBar';
import BookButton from '../Common/Button/BookButton';
import BulkSelectionGroup from './BulkSelectionGroup';
import Button from '../Common/Button/Button';
import File from '@/icons/file.svg';

const initialBook = 'gen';
const initialChapter = '1';
const initialVerse = '1';

const ToggleBookOptions = [
  { key: 'all', name: 'All' },
  { key: 'old', name: 'Old' },
  { key: 'new', name: 'New' },
  { key: 'none', name: 'Deselect' },
];

const ToggleChapterOptions = [
  { key: 'all', name: 'All' },
  { key: 'none', name: 'Deselect' },
];

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

  const handleChangeBook = (bookId) => {
    console.log({ bookId });
    onChangeBook(bookId, bookId);
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
    console.log({ start, end });
    // e.target.start.value = '';
    // e.target.end.value = '';
  };

  return (
    <div className="w-full h-full pt-5 px-5">
      <ScopeHead>Project Scope Management</ScopeHead>
      <TitleBar>
        <p className="text-gray-900 text-center text-sm">Book Selection</p>
        <BulkSelectionGroup
          selectedOption={selectedOption}
          handleSelect={handleChangeBookToggle}
          toggleOptions={ToggleBookOptions}
        />
      </TitleBar>

      <div className="grid grid-cols-2 gap-5">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] grid grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase">
          {bookList?.slice(0, 39)?.map((book) => (
            <div key={book.key} className="flex justify-between gap-2">
              <BookButton
                onClick={(e) => handleSelectBook(e, book)}
                className="flex justify-between gap-2 flex-1"
              >
                <span className="" title="Select Book">
                  {book.name}
                </span>
              </BookButton>
              <button type="button" className="pr-2" title="Modify Chapter Scope">
                <File className="w-3 items-center cursor-pointer hover:text-primary" onClick={() => handleChangeBook(book.key)} />
              </button>
            </div>
          ))}
        </div>

        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] grid grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase content-start">
          {bookList?.slice(39)?.map((book) => (
            <div key={book.key} className="flex justify-between gap-2">
              <BookButton
                onClick={(e) => handleSelectBook(e, book)}
                className="flex justify-between gap-2 flex-1"
              >
                <span className="" title="Select Book">
                  {book.name}
                </span>

              </BookButton>
              <button type="button" title="Modify Chapter Scope">
                <File className="w-3 items-center cursor-pointer hover:text-primary" onClick={() => handleChangeBook(book.key)} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <TitleBar>
        <p className="text-gray-900 text-center text-sm flex gap-2">
          <span>Chapter Selection :</span>
          <span className="font-medium">{bookName}</span>
        </p>
        <BulkSelectionGroup
          selectedOption={selectedOption}
          handleSelect={handleChangeBookToggle}
          toggleOptions={ToggleChapterOptions}
        />
      </TitleBar>

      <form className="w-full my-2 flex gap-3 h-6  text-xxs justify-end" onSubmit={handleChapterRangeSelection}>
        <div className="flex gap-1 items-center ">
          <label>Start :</label>
          <input
            type="number"
            className="w-12 h-full  px-1 text-xs border-gray-400 outline-none rounded-[4px]"
            name="start"
            min={1}
            required
            max={149}
          />
        </div>
        <div className="flex gap-1 items-center">
          <label>End :</label>
          <input
            type="text"
            className="w-12 h-full  px-1 text-xs border-gray-400 outline-none rounded-[4px]"
            name="end"
            min={1}
            required
            max={150}
          />
        </div>

        <Button type="submit">
          Select
        </Button>
      </form>

      <div className="grid grid-cols-1">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] flex flex-wrap gap-2 p-4 text-xxs text-left  uppercase">
          {chapterList?.map((ch) => (
            <BookButton
              onClick={(e) => handleSelectBook(e, ch)}
              key={ch.key}
              className="border min-w-8 text-center"
            >
              {ch.name}
            </BookButton>
          ))}
        </div>
      </div>

    </div>
  );
}

export default ScopeManagement;
