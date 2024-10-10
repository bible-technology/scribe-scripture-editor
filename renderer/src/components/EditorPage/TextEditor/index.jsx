import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { debounce } from 'lodash';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import EditorMenuBar from './EditorMenuBar';
import LexicalEditor from './LexicalEditor';
import { updateCacheNSaveFile } from './updateAndSave';
import EmptyScreen from './EmptyScreen';

const defaultScrRef = {
  bookCode: 'PSA',
  chapterNum: 1,
  verseNum: 1,
};

export default function TextEditor() {
  const [chapterNumber, setChapterNumber] = useState(1);
  const [verseNumber, setVerseNumber] = useState(1);

  const [usjInput, setUsjInput] = useState();
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const [navRef, setNavRef] = useState();
  const {
    state: {
      bookId: defaultBookId, selectedFont, editorFontSize, projectScriptureDir,
    },
    actions: {
      handleSelectedFont, onChangeChapter, onChangeVerse, handleEditorFontSize,
    },
  } = useContext(ReferenceContext);
  const [book, setBook] = useState(defaultBookId);

  const {
    cachedData, loading, bookAvailable, booksInProject,
  } = useReadUsfmFile(book);

  useEffect(() => {
    if (cachedData.error) {
      console.error('Error parsing USFM', cachedData.error);
      return;
    }
    const { usj } = cachedData;
    if (!usj && usj?.entries(usj).length === 0) { return; }
    console.log(usj);
    setUsjInput(usj);
  }, [book, cachedData]);

  useEffect(() => {
    setScrRef({
      bookCode: book,
      chapterNum: chapterNumber,
      verseNum: verseNumber,
    });
    onChangeChapter(chapterNumber, 1);
    onChangeVerse(verseNumber, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterNumber, verseNumber, book]);

  useEffect(() => {
    if (navRef) {
      const { chapterNum, verseNum } = navRef;
      setChapterNumber(chapterNum);
      setVerseNumber(verseNum);
    }
  }, [navRef]);

  const handleUsjChange = useMemo(
    () => debounce(async (updatedUsj) => {
      updateCacheNSaveFile(updatedUsj, book);
      console.log('usj updated', updatedUsj);
    }, 1000),
    [book],
  );

  const _props = {
    selectedFont,
    chapterNumber,
    setChapterNumber,
    verseNumber,
    setVerseNumber,
    book,
    setBook,
    handleSelectedFont,
    bookId: book,
    loading,
    editorFontSize,
    handleEditorFontSize,
    bookAvailable,
    booksInProject,
  };

  const props = {
    selectedFont,
    fontSize: editorFontSize,
    textDirection: projectScriptureDir?.toLowerCase(),
    usjInput,
    onUsjChange: handleUsjChange,
    setNavRef,
    scrRef,
    setScrRef,
    bookId: book,

  };
  return (
    <div className="flex flex-col h-editor rounded-md shadow overflow-hidden">
      <EditorMenuBar {..._props} />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {!bookAvailable && <EmptyScreen />}
          {bookAvailable && usjInput && <LexicalEditor {...props} />}
        </>
      )}
    </div>
  );
}
