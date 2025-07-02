import React, {
  useEffect, useState, useContext,
  useCallback,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
// import { debounce } from 'lodash';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import EditorMenuBar from './EditorMenuBar';
import { saveToFile } from './hooks/saveToFile';

// eslint-disable-next-line import/extensions
import USFMEditor from './verseEditor/USFMEditor';

export default function TextEditor() {
  const {
    state: {
      bookId: defaultBookId,
      chapter, verse,
      selectedFont,
      editorFontSize,
      projectScriptureDir,
    },
    actions: {
      handleSelectedFont,
      handleEditorFontSize,
      goToBookChapterVerse,
    },
  } = useContext(ReferenceContext);

  const [scrRef, setScrRef] = useState();
  const [navRef, setNavRef] = useState();
  const {
    loading,
    bookAvailable, booksInProject, usfmString, filePath,
  } = useReadUsfmFile(defaultBookId);

  useEffect(() => {
    setScrRef({
      bookCode: defaultBookId,
      chapterNum: chapter,
      verseNum: verse,
    });
    goToBookChapterVerse(defaultBookId, chapter, verse, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter, verse, defaultBookId]);

  useEffect(() => {
    if (navRef) {
      const { bookCode, chapterNum, verseNum } = navRef;
      goToBookChapterVerse(bookCode, chapterNum, verseNum);
      console.log(bookCode, chapterNum, verseNum, 'usfm editor index');
    }
  }, [navRef]);

  const handleUsfmChange = useCallback(async (updatedUsfm) => {
    try {
      await saveToFile(updatedUsfm, defaultBookId);
    } catch (error) {
      console.error('Failed to save USFM:', error);
    }
  }, [defaultBookId]);

  const _props = {
    selectedFont,

    handleSelectedFont,
    bookId: defaultBookId,
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
    bookId: defaultBookId,
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
