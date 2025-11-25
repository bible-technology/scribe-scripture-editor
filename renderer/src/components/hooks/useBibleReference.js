import {
  useState, useCallback, useMemo, useEffect,
} from 'react';
import { BIBLE_BOOKS } from '../../lib/BooksOfTheBible';

export const useBibleReference = ({
  initialBook = 'gen',
  initialChapter = '1',
  initialVerse = '1',
  projectPath = null,
}) => {
  const [bookId, setBookId] = useState(initialBook?.toLowerCase() || 'gen');
  const [chapter, setChapter] = useState(initialChapter || '1');
  const [verse, setVerse] = useState(initialVerse || '1');
  const [filteredBooks, setFilteredBooks] = useState(null);
  const [versificationData, setVersificationData] = useState(null);

  useEffect(() => {
    const loadVersification = async () => {
      if (!projectPath) { return; }

      try {
        const fs = window.require('fs');
        const path = window.require('path');

        const possiblePaths = [
          path.join(projectPath, 'ingredients', 'versification.json'),
          path.join(projectPath, 'audio', 'ingredients', 'versification.json'),
          path.join(projectPath, 'text', 'ingredients', 'versification.json'),
          path.join(projectPath, 'video', 'ingredients', 'versification.json'),
        ];

        const versificationPath = possiblePaths.find((p) => fs.existsSync(p)) || null;

        if (versificationPath) {
          const data = JSON.parse(fs.readFileSync(versificationPath, 'utf8'));
          setVersificationData(data.maxVerses || data);
        } else {
          setVersificationData(null);
        }
      } catch (error) {
        setVersificationData(null);
      }
    };

    loadVersification();
  }, [projectPath]);

  const allBooks = useMemo(() => {
    const books = [];

    Object.entries(BIBLE_BOOKS.oldTestament).forEach(([key, name]) => {
      books.push({
        key,
        name,
        testament: 'OT',
      });
    });

    Object.entries(BIBLE_BOOKS.newTestament).forEach(([key, name]) => {
      books.push({
        key,
        name,
        testament: 'NT',
      });
    });

    return books;
  }, []);

  const currentBook = useMemo(() => allBooks.find((b) => b.key === bookId) || allBooks[0], [bookId, allBooks]);

  const bookName = currentBook.name;

  const bookList = useMemo(() => {
    if (filteredBooks) {
      return allBooks.filter((book) => filteredBooks.some((f) => f.toLowerCase() === book.key.toLowerCase()));
    }
    return allBooks;
  }, [allBooks, filteredBooks]);

  const chapterList = useMemo(() => {
    if (!versificationData) { return []; }

    const bookCode = bookId.toUpperCase();
    const bookVerses = versificationData[bookCode];

    if (!bookVerses || !Array.isArray(bookVerses)) { return []; }

    return Array.from({ length: bookVerses.length }, (_, i) => ({
      key: String(i + 1),
      name: String(i + 1),
    }));
  }, [bookId, versificationData]);

  const verseList = useMemo(() => {
    if (!versificationData) { return []; }

    const bookCode = bookId.toUpperCase();
    const bookVerses = versificationData[bookCode];

    if (!bookVerses || !Array.isArray(bookVerses)) { return []; }

    const chapterIndex = parseInt(chapter, 10) - 1;
    if (chapterIndex < 0 || chapterIndex >= bookVerses.length) { return []; }

    const verseCount = parseInt(bookVerses[chapterIndex], 10);
    if (!verseCount || verseCount <= 0) { return []; }

    return Array.from({ length: verseCount }, (_, i) => ({
      key: String(i + 1),
      name: String(i + 1),
    }));
  }, [bookId, chapter, versificationData]);

  const onChangeBook = useCallback((bookKey) => {
    if (!bookKey) { return; }
    const newBookKey = bookKey.toLowerCase();
    setBookId(newBookKey);
    setChapter('1');
    setVerse('1');
  }, []);

  const onChangeChapter = useCallback((chapterNum) => {
    setChapter(String(chapterNum));
    setVerse('1');
  }, []);

  const onChangeVerse = useCallback((verseNum) => {
    setVerse(String(verseNum));
  }, []);

  const applyBooksFilter = useCallback((bookKeys) => {
    if (!bookKeys || bookKeys.length === 0) {
      setFilteredBooks(null);
      return;
    }
    setFilteredBooks(bookKeys);
  }, []);

  const goToBookChapterVerse = useCallback((bookKey, chapterNum, verseNum) => {
    setBookId(bookKey.toLowerCase());
    setChapter(String(chapterNum));
    setVerse(String(verseNum));
  }, []);

  return {
    state: {
      bookId,
      bookList,
      bookName,
      chapter,
      chapterList,
      verse,
      verseList,
      versificationLoaded: !!versificationData,
    },
    actions: {
      onChangeBook,
      onChangeChapter,
      onChangeVerse,
      applyBooksFilter,
      goToBookChapterVerse,
    },
  };
};

export default useBibleReference;
