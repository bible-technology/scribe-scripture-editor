import React, {
  useEffect, useState, useContext,
  useMemo,
  //  useMemo,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { debounce } from 'lodash';
import { LoadingSpinner } from '@/components/LoadingSpinner';
// import { useAutoSnackbar } from '@/components/SnackBar';
// import { useTranslation } from 'react-i18next';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import EditorMenuBar from './EditorMenuBar';
// import LexicalEditor from './LexicalEditor';
// import { updateCacheNSaveFile } from './updateAndSave';
import { saveToFile } from './hooks/saveToFile';

// import EmptyScreen from './EmptyScreen';
// import ErrorScreen from './ErrorScreen';
// eslint-disable-next-line import/extensions
import USFMEditor from './verseEditor/USFMEditor';

const defaultScrRef = {
  bookCode: 'PSA',
  chapterNum: '1',
  verseNum: '1',
};

export default function TextEditor() {
  const [chapterNumber, setChapterNumber] = useState(1);
  const [verseNumber, setVerseNumber] = useState(1);

  // const [usjInput, setUsjInput] = useState();
  const [scrRef, setScrRef] = useState(defaultScrRef);
  const [navRef, setNavRef] = useState();
  // const [parseError, setParseError] = useState(false);
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
  // const { showSnackbar } = useAutoSnackbar();
  // const { t } = useTranslation();
  const [book, setBook] = useState(defaultBookId);

  const {
    loading,
    bookAvailable, booksInProject, usfmString, filePath,
  } = useReadUsfmFile(book);

  // useEffect(() => { console.log('sourceFilePath', filePath); }, []);
  // useEffect(() => {
  //   if (!loading) {
  //     console.log('Returned filePath:', filePath);
  //   }
  // }, [filePath, loading]);

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

  // useEffect(() => { console.log('index scrRef', scrRef); }, [scrRef]);

  // const handleUsfmChange = useMemo(
  //   () => debounce(async (updatedUsfm) => {
  //     updateCacheNSaveFile(updatedUsfm, book);
  //     // console.log('usj updated', updatedUsj);
  //   }, 3000),
  //   [book],
  // );

  // In your parent component, modify the handleUsfmChange function:
  const handleUsfmChange = useMemo(
    () => debounce(async (updatedUsfm) => {
      try {
        await saveToFile(updatedUsfm, book);
        // console.log('USFM updated and saved successfully');
        return Promise.resolve(); // Explicitly return resolved promise
      } catch (error) {
        // console.error('Failed to save USFM:', error);
        return Promise.reject(error); // Return rejected promise on error
      }
    }, 3000),
    [book],
  );

  // const handleVerseSelect = (chapter, verse) => {
  //   setScrRef({ chapter, verse });
  //   console.log(typeof chapter, chapter, verse);
  //   // Do something with the selected verse
  // };

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
    // parseError,
  };

  const props = {
    selectedFont,
    fontSize: editorFontSize,
    textDirection: projectScriptureDir?.toLowerCase(),
    usfmString,
    onUsfmChange: handleUsfmChange,
    filePath,
    setNavRef,
    scrRef,
    setScrRef,
    bookId: book,
  };
  return (
    <div className="flex flex-col h-editor rounded-md shadow relative ">

      <EditorMenuBar {..._props} />
      {
        loading ? (
          <LoadingSpinner />
        )
          : (
            <>
              {/* {parseError && <ErrorScreen />}
          {!parseError && !bookAvailable && <EmptyScreen />}
          {!parseError && bookAvailable && usfmString && ( */}

              {/* {<ErrorScreen />} */}
              {/* {!bookAvailable && <EmptyScreen />} */}
              {bookAvailable && usfmString && (
                // <LexicalEditor {...props} />
                // console.log('usfmString', usfmString)
                <USFMEditor {...props} />
              )}
            </>
          )
      }
    </div>
  );
}
