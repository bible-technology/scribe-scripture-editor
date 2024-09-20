/* eslint-disable react/jsx-no-constructed-context-values */
import React, { createContext } from 'react';
import PropTypes from 'prop-types';
import { useBibleReference } from 'bible-reference-rcl';

export const CustomNavigationContext = createContext({});

export default function CustomNavigationContextProvider({ children }) {
  const initialBook = '1TI';
  const initialChapter = '1';
  const initialVerse = '1';

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

  const value = {
    state: {
      chapter,
      verse,
      bookList,
      chapterList,
      verseList,
      bookName,
      bookId,
    },
    actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
    },
  };

  return (
    <CustomNavigationContext.Provider value={value}>
      {children}
    </CustomNavigationContext.Provider>
  );
}

CustomNavigationContextProvider.propTypes = {
  children: PropTypes.any,
};
