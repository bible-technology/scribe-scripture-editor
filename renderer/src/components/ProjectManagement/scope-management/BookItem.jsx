import React from 'react';
import BookButton from '../Common/Button/BookButton';
import XMark from '@/icons/Xelah/XMark.svg';

function BookItem({
  book, handleSelectBook, handleRemoveScope, isInScope,
}) {
  return (
    <div className="flex items-center">
      <BookButton
        className={`flex items-center gap-1.5 w-full border ${isInScope ? 'bg-primary/25' : ''}`}
        onClick={(e) => handleSelectBook(e, book)}
      >
        <div
          title={isInScope ? 'Modify Chapters' : 'Add to scope'}
          role="button"
          tabIndex={-2}
          className="flex-[3.5] truncate text-left"
        >
          {book.name}
        </div>

        <XMark
          title="Remove Scope"
          className={`flex-1 w-2 h-5 text-black hover:text-white  ${isInScope ? 'visible' : 'opacity-0 pointer-events-none'}`}
          onClick={(e) => handleRemoveScope(e, book)}
        />
      </BookButton>
    </div>
  );
}

export default BookItem;
