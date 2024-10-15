import React, { useContext } from 'react';

import { ProjectContext } from '@/components/context/ProjectContext';
import MenuDropdown from '@/components/MenuDropdown/MenuDropdown';
import { LockClosedIcon, BookmarkIcon, LockOpenIcon } from '@heroicons/react/24/outline';
// import BibleNavigationX from '@/components/EditorPage/TextEditor/BibleNavigationX';
import { useTranslation } from 'react-i18next';
import BibleNavigationX from './BibleNavigationX';

export default function EditorMenuBar(props) {
  const {
    selectedFont,
    chapterNumber,
    setChapterNumber,
    verseNumber,
    setVerseNumber,
    handleSelectedFont,
    handleEditorFontSize,
    editorFontSize,
    book,
    setBook,
    loading,
    bookAvailable,
    booksInProject,
  } = props;

  const { t } = useTranslation();

  const {
    states: { scrollLock },
    actions: { setScrollLock },
  } = useContext(ProjectContext);

  const handleFontSize = (status) => {
    if (status === 'dec' && editorFontSize > 0.70) {
      handleEditorFontSize(editorFontSize - 0.2);
    }
    if (status === 'inc' && editorFontSize < 2) {
      handleEditorFontSize(editorFontSize + 0.2);
    }
  };

  return (
    <div className="h-[33px] flex flex-col bg-secondary rounded-t-md sticky top-0 z-10">
      <div className="flex min-h-[33px] items-center justify-between gap-2">
        <BibleNavigationX
          chapterNumber={chapterNumber}
          setChapterNumber={setChapterNumber}
          verseNumber={verseNumber}
          setVerseNumber={setVerseNumber}
          book={book}
          setBook={setBook}
          loading={loading}
          bookAvailable={bookAvailable}
          booksInProject={booksInProject}
        />
        <div
          aria-label="editor-pane"
          className="flex flex-1 justify-center text-white text-xxs uppercase tracking-wider font-bold leading-3 truncate"
        >
          Editor
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center border rounded-md shadow-sm
                  text-xs h-fit py-1
                  focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-offset-gray-300 focus:ring-gray-300"
        >
          <div
            aria-label="decrease-font"
            onClick={() => { handleFontSize('dec'); }}
            role="button"
            tabIndex="0"
            title={t('tooltip-editor-font-dec')}
            className="h-5 w-5 text-gray-300 hover:text-white font-bold border-r border-gray-200 text-center flex items-center pl-1.5 "
          >
            {t('label-editor-font-char')}
          </div>
          <div
            aria-label="increase-font"
            className="h-5 w-5  hover:text-white font-bold text-lg text-center flex items-center pl-1 text-gray-300"
            onClick={() => { handleFontSize('inc'); }}
            role="button"
            title={t('tooltip-editor-font-inc')}
            tabIndex="0"
          >
            {t('label-editor-font-char')}
          </div>
        </button>

        <div
          title="navigation lock/unlock"
          className="flex items-center mr-auto"
        >
          <div>
            {scrollLock === true ? (
              <LockOpenIcon
                aria-label="open-lock"
                className="h-6 mr-2 w-6 text-white cursor-pointer"
                aria-hidden="true"
                onClick={() => setScrollLock(!scrollLock)}
              />
            ) : (
              <LockClosedIcon
                aria-label="close-lock"
                className="h-5 mr-3 w-5 text-white cursor-pointer"
                aria-hidden="true"
                onClick={() => setScrollLock(!scrollLock)}
              />
            )}
          </div>
          <div
            role="button"
            tabIndex="0"
            aria-label="bookmark"
            title="bookmark"
            className="focus:outline-none border-r-2 border-l-2 border-white border-opacity-10"
          >
            <BookmarkIcon
              className="h-5 mr-4 w-5 text-white cursor-pointer"
              aria-hidden="true"
            />
          </div>
          <MenuDropdown selectedFont={selectedFont || 'sans-serif'} setSelectedFont={handleSelectedFont} buttonStyle="button text-gray-200 bg-primary-500 hover:bg-primary-500/90 text-highlight-300 gap-1" />
        </div>
      </div>
    </div>
  );
}
