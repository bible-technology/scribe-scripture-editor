import React, {
  useEffect, useState, useContext, useMemo,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { debounce } from 'lodash';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAutoSnackbar } from '@/components/SnackBar';
import { useTranslation } from 'react-i18next';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import EditorMenuBar from './EditorMenuBar';
import LexicalEditor from './LexicalEditor';
import { updateCacheNSaveFile } from './updateAndSave';
import EmptyScreen from './EmptyScreen';
import ErrorScreen from './ErrorScreen';

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
  const [parseError, setParseError] = useState(false);
  const {
    state: {
      bookId: defaultBookId,
      selectedFont,
      editorFontSize,
      projectScriptureDir,
    },
    actions: {
      handleSelectedFont,
      onChangeChapter,
      onChangeVerse,
      handleEditorFontSize,
    },
  } = useContext(ReferenceContext);
  const { showSnackbar } = useAutoSnackbar();
  const { t } = useTranslation();
  const [book, setBook] = useState(defaultBookId);

  const {
    cachedData, loading, bookAvailable, booksInProject,
  } = useReadUsfmFile(book);

  useEffect(() => {
    if (loading) {
      showSnackbar(`Preparing ${book.toUpperCase()} file`, 'update');
    }
    const { usj, error } = cachedData;
    if (!loading) {
      if (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing USFM:', error);
        setParseError(true);
        showSnackbar(
          t('dynamic-msg-load-ref-bible-snack-fail', {
            refName: book.toUpperCase(),
          }),
          'failure',
        );
        setUsjInput(null);
        return;
      }
    }
    if (!usj || Object.entries(usj).length === 0) {
      setParseError(false);
      setUsjInput(null);
      return;
    }
    setParseError(false);
    setUsjInput(usj);
    !loading
      && showSnackbar(
        t('dynamic-msg-load-ref-bible-snack', { refName: book.toUpperCase() }),
        'success',
      );
  }, [cachedData, loading]);

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
      // console.log('usj updated', updatedUsj);
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
    parseError,
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
          {parseError && <ErrorScreen />}
          {!parseError && !bookAvailable && <EmptyScreen />}
          {!parseError && bookAvailable && usjInput && (
            <LexicalEditor {...props} />
          )}
        </>
      )}
    </div>
  );
}
