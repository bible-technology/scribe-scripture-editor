import React, { useContext } from 'react';

import { ProjectContext } from '@/components/context/ProjectContext';
import MenuDropdown from '@/components/MenuDropdown/MenuDropdown';
import { LockClosedIcon, BookmarkIcon, LockOpenIcon } from '@heroicons/react/24/outline';
// import BibleNavigationX from '@/components/EditorPage/TextEditor/BibleNavigationX';
import BibleNavigationX from './BibleNavigationX';
import Buttons from './Buttons';
import InsertMenu from './InsertMenu';

export default function EditorMenuBar(props) {
  const {
    selectedFont,
    setInsertNumber,
    setInsertVerseRChapter,
    setTriggerVerseInsert,
    triggerVerseInsert,
    chapterNumber,
    setChapterNumber,
    verseNumber,
    setVerseNumber,
    selectedText,
    setSelectedFont,
  } = props;

  const {
    states: { scrollLock },
    actions: { setScrollLock },
  } = useContext(ProjectContext);

  const handleClick = (number, title) => {
    setInsertNumber(number);
    setInsertVerseRChapter(title);
    setTriggerVerseInsert(!triggerVerseInsert);
  };
  return (
    <div className="relative min-h-[66px] flex flex-col bg-secondary rounded-t-md overflow-hidden">
      <div className="flex min-h-[33px] items-center justify-between ">
        <BibleNavigationX
          chapterNumber={chapterNumber}
          setChapterNumber={setChapterNumber}
          verseNumber={verseNumber}
          setVerseNumber={setVerseNumber}
        />
        <div
          aria-label="editor-pane"
          className="flex flex-1 justify-center text-white text-xxs uppercase tracking-wider font-bold leading-3 truncate"
        >
          Editor
        </div>
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
            title="bookmark"
            className="focus:outline-none border-r-2 border-l-2 border-white border-opacity-10"
          >
            <BookmarkIcon
              className="h-5 mr-4 w-5 text-white cursor-pointer"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
      <div className="mx-2.5 min-h-[33px] flex items-center justify-center">
        <div className="flex items-center">
          <Buttons {...props} />
        </div>
        <div className="flex ml-auto">
          <MenuDropdown selectedFont={selectedFont} setSelectedFont={setSelectedFont} buttonStyle="h-6 mr-2 w-6 text-white cursor-pointer" />
          <InsertMenu handleClick={handleClick} selectedText={selectedText} />
        </div>
      </div>
    </div>
  );
}
