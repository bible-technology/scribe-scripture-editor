import React, {
  useEffect, useState, useContext,
  useCallback,
} from 'react';
import { ReferenceContext } from '@/components/context/ReferenceContext';
// import { debounce } from 'lodash';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import BookOutOfScope from '@/components/Loading/BookOutOfScope';
import { useReadUsfmFile } from './hooks/useReadUsfmFile';
import EditorMenuBar from './EditorMenuBar';
import { saveToFile } from './hooks/saveToFile';
import * as logger from '../../../logger';

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
      navFlag,
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
  } = useReadUsfmFile(navFlag ? defaultBookId : null);

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
    }
  }, [navRef]);

  const handleUsfmChange = useCallback(async (updatedUsfm) => {
    try {
      await saveToFile(updatedUsfm, defaultBookId);
    } catch (error) {
      logger.error('Failed to save USFM:', error);
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

              {!bookAvailable && <BookOutOfScope />}
              {bookAvailable && usfmString && (
                <USFMEditor {...props} />
              )}
            </>
          )
      }
    </div>
  );
}
