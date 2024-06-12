import PropTypes from 'prop-types';
import {
  LockOpenIcon,
  LockClosedIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';
import * as localforage from 'localforage';
import {
  useContext, useEffect, useState,
} from 'react';
import { useTranslation } from 'react-i18next';
// import ObsNavigation from '@/components/EditorPage/ObsEditor/ObsNavigation';
import NavigationObs from '@/components/EditorPage/ObsEditor/NavigationObs';
import BibleNavigation from '@/modules/biblenavigation/BibleNavigation';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import { ProjectContext } from '@/components/context/ProjectContext';
import { splitStringByLastOccurence } from '@/util/splitStringByLastMarker';
import MenuDropdown from '@/components/MenuDropdown/MenuDropdown';
import * as logger from '../../logger';

export default function Editor({
  children, callFrom, editor,
}) {
  const {
    states: {
      scrollLock,
    },
    actions: {
      setScrollLock,
    },
  } = useContext(ProjectContext);
  const {
    state: {
      selectedFont,
      editorFontSize,
      bookmarksVerses,
      bookName,
      chapter,
      projectScriptureDir,
      obsNavigation,
    },
    actions: {
      setBookmarksVerses,
      setObsNavigation,
      handleSelectedFont,
      handleEditorFontSize,
    },
  } = useContext(ReferenceContext);
  const [bookMarked, setBookMarks] = useState(false);

  const handleUnlockScroll = (e) => {
    e.preventDefault();
    setScrollLock(!scrollLock);
  };

  const handleFontSize = (status) => {
    if (status === 'dec' && editorFontSize > 0.70) {
      handleEditorFontSize(editorFontSize - 0.2);
    }
    if (status === 'inc' && editorFontSize < 2) {
      handleEditorFontSize(editorFontSize + 0.2);
    }
  };

  useEffect(() => {
      if (((bookmarksVerses?.find((x) => x.bookname === bookName && x.chapter === chapter)
            !== undefined))) {
        setBookMarks(true);
      } else {
        setBookMarks(false);
      }
  }, [bookName, bookmarksVerses, chapter]);

  const updateBookMarksDB = (bookmarksVerses) => {
    localforage.getItem('currentProject').then(async (projectName) => {
      const _projectname = await splitStringByLastOccurence(projectName, '_');
      // const _projectname = projectName?.split('_');
      localforage.getItem('projectmeta').then((value) => {
        Object?.entries(value).forEach(
          ([, _value]) => {
            Object?.entries(_value).forEach(
              ([, resources]) => {
                if (resources.identification.name.en === _projectname[0]) {
                  resources.project.textTranslation.bookMarks = [...bookmarksVerses];
                  localforage.setItem('projectmeta', value).then((val) => {
                    logger.debug('Editor.js', val);
                  });
                }
              },
            );
          },
        );
      });
    });
  };

  const handleBookmarks = () => {
    const temp = [...bookmarksVerses];
    if (bookmarksVerses.length !== 0) {
      bookmarksVerses.forEach((markedVerses) => {
        if (bookmarksVerses.find((x) => x.bookname === bookName && x.chapter === chapter)
        !== undefined) {
          const selectedIndex = bookmarksVerses.indexOf(bookmarksVerses.find((x) => x.bookname === bookName && x.chapter === chapter));
          bookmarksVerses.splice(selectedIndex, 1);
          setBookMarks(false);
        }
        if (markedVerses.bookname === bookName && markedVerses.chapter !== chapter) {
          if (bookmarksVerses.find((x) => x.bookname === bookName && x.chapter === chapter)
          === undefined) {
            temp.push({ bookname: bookName, chapter });
            bookmarksVerses.push({ bookname: bookName, chapter });
            setBookmarksVerses(temp);
            setBookMarks(true);
          } else {
            setBookMarks(false);
            const selectedIndex = bookmarksVerses.indexOf(bookmarksVerses.find((x) => x.bookname === bookName && x.chapter === chapter));
            bookmarksVerses.splice(selectedIndex, 1);
          }
        }
        if (markedVerses.bookname !== bookName) {
          if (bookmarksVerses.find((x) => x.bookname === bookName && x.chapter === chapter) === undefined) {
            temp.push({ bookname: bookName, chapter });
            bookmarksVerses.push({ bookname: bookName, chapter });
            setBookmarksVerses(temp);
            setBookMarks(true);
          } else {
            setBookMarks(false);
            const selectedIndex = bookmarksVerses.indexOf(bookmarksVerses.find((x) => x.bookname === bookName && x.chapter === chapter));
            bookmarksVerses.splice(selectedIndex, 1);
          }
        }
      });
    } else {
            temp.push({ bookname: bookName, chapter });
            bookmarksVerses.push({ bookname: bookName, chapter });
            setBookmarksVerses(temp);
            setBookMarks(true);
    }
    updateBookMarksDB(bookmarksVerses);
  };
  const { t } = useTranslation();
  return (
    <div className={`flex flex-col bg-white border-b-2 border-secondary ${editor === 'audioTranslation' ? 'md:max-h-[64vh] lg:max-h-[70vh]' : 'h-editor'} rounded-md shadow scrollbar-width`}>
      <div className="flex flex-wrap items-center justify-between bg-secondary ">
        {/* {(callFrom === 'textTranslation' && <BibleNavigation />) || (callFrom === 'obs' && <ObsNavigation value={value} onChange={onChange} />)} */}
        {(callFrom === 'textTranslation' && <BibleNavigation />) || (callFrom === 'obs'
          && (
          <NavigationObs
            onChangeNumber={(value) => setObsNavigation(value)}
            number={obsNavigation}
          />
        ))}
        {/* <div className="text-center h-6 rounded-t text-gray-100  text-xs uppercase tracking-widest font-bold leading-3">
          <div className="text-center pt-1">
            Editor
          </div>
        </div> */}
        <div aria-label="editor-pane" className="h-4 flex flex-1 justify-center text-white text-xxs uppercase tracking-wider font-bold leading-3 truncate">
          {t('label-editor-pane')}
        </div>
        <div className="flex ml-auto items-center gap-4">
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
          <MenuDropdown selectedFont={selectedFont || 'sans-serif'} setSelectedFont={handleSelectedFont} buttonStyle="h-6 mr-2 w-6 text-white cursor-pointer" />
          {/* <InsertMenu handleClick={handleClick} selectedText={selectedText} /> */}
        </div>
        <div title={t('tooltip-editor-lock')} className="flex items-center">
          {scrollLock === true ? (
            <div>
              <LockOpenIcon aria-label="open-lock" onClick={() => setScrollLock(!scrollLock)} className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            )
          : (
            <div>
              <LockClosedIcon aria-label="close-lock" onClick={(e) => handleUnlockScroll(e)} className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
          )}
          {callFrom === 'textTranslation'
            && (
            <div
              onClick={(event) => handleBookmarks(event)}
              role="button"
              tabIndex="0"
              title={t('tooltip-editor-bookmark')}
              aria-label="save-bookmark"
              className="mx-1 px-2 focus:outline-none border-r-2 border-l-2 border-white border-opacity-10"
            >
              <BookmarkIcon className={`${bookMarked ? 'fill-current' : ''}  h-5 w-5 text-white`} aria-hidden="true" />

            </div>
            )}

        </div>
      </div>
      <div
        style={{
          fontFamily: selectedFont || 'sans-serif',
          fontSize: `${editorFontSize}rem`,
          lineHeight: (editorFontSize > 1.3) ? 1.5 : '',
          direction: `${projectScriptureDir === 'RTL' ? 'rtl' : 'auto'}`,
        }}
        aria-label="editor"
        className="border-l-2 border-r-2 border-secondary pb-16 max-w-none overflow-auto h-full scrollbars-width"
      >
        {children}

      </div>
    </div>
  );
}

Editor.propTypes = {
  children: PropTypes.any,
  callFrom: PropTypes.string,
  editor: PropTypes.string,
};
