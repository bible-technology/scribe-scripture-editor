import React, { useEffect, useState } from 'react';
import { useBibleReference } from '@/hooks/useBibleReference';
import { useTranslation } from 'react-i18next';
import TitleBar from './TitleBar';
import BookButton from '../Common/Button/BookButton';
import BulkSelectionGroup from './BulkSelectionGroup';
import Button from '../Common/Button/Button';
import BookItem from './BookItem';
import * as logger from '../../../logger';
import { getDetails } from '../../EditorPage/ObsEditor/utils/getDetails';

const initialBook = 'gen';
const initialChapter = '1';
const initialVerse = '1';

const parseVerseFromFilename = (filename, fileExtension) => {
  const pattern = new RegExp(`^\\d+_([\\d-]+)_\\d+_default\\.${fileExtension}$`);
  const match = filename.match(pattern);
  if (!match) {
    return null;
  }
  const verseStr = match[1];

  if (verseStr.includes('-')) {
    const [start, end] = verseStr.split('-').map((v) => parseInt(v, 10));
    const verses = [];
    for (let i = start; i <= end; i++) {
      verses.push(i);
    }
    return verses;
  }

  return [parseInt(verseStr, 10)];
};

const countRecordedVersesFromFiles = (chapterMediaPath, fileExtension, fs) => {
  if (!fs.existsSync(chapterMediaPath)) {
    return { recordedVerses: 0, recordedFiles: 0, coveredVerses: [] };
  }

  try {
    const files = fs.readdirSync(chapterMediaPath);
    const recordedVerseSet = new Set();
    let recordedFiles = 0;

    files.forEachO((file) => {
      const verses = parseVerseFromFilename(file, fileExtension);
      if (verses) {
        recordedFiles += 1;
        verses.forEach((v) => recordedVerseSet.add(v));
      }
    });

    return {
      recordedVerses: recordedVerseSet.size,
      recordedFiles,
      coveredVerses: Array.from(recordedVerseSet).sort((a, b) => a - b),
    };
  } catch (error) {
    logger.error('Error reading chapter media path:', error);
    return { recordedVerses: 0, recordedFiles: 0, coveredVerses: [] };
  }
};

function ScopeManagement({
  metadata, currentScope, setCurrentScope, backendScope, projectName, projectId,
}) {
  const { t } = useTranslation();
  const ToggleBookOptions = [
    { key: 'all', name: t('btn-all') },
    { key: 'old', name: t('btn-ot') },
    { key: 'new', name: t('btn-nt') },
    { key: 'none', name: t('label-deselect') },
  ];
  const ToggleChapterOptions = [
    { key: 'all', name: t('btn-all') },
    { key: 'none', name: t('label-deselect') },
  ];
  const [bookFilter, setBookFilter] = useState('');
  const [chapterFilter, setChapterFilter] = useState('');
  const [selectedChaptersSet, setSelectedChaptersSet] = useState(new Set([]));
  const [bookCompletion, setBookCompletion] = useState({});
  const [completionMap, setCompletionMap] = useState({});
  const [versificationData, setVersificationData] = useState({});
  const [projectBasePath, setProjectBasePath] = useState('');

  const fs = window.require('fs');
  const path = window.require('path');
  const projectType = metadata?.type?.flavorType?.flavor?.name;
  const ingredientsFolder = projectType === 'videoTranslation' ? 'video' : 'audio';
  const fileExtension = projectType === 'videoTranslation' ? 'mp4' : 'mp3';
  useEffect(() => {
    const loadVersification = async () => {
      try {
        const details = await getDetails();
        const currentProjectDir = details?.projectsDir;
        if (!currentProjectDir || !projectName || !projectId) {
          return;
        }
        const baseProjectsDir = path.dirname(currentProjectDir);
        const projectFolderName = `${projectName}_${projectId}`;
        const projectBasePath = path.join(baseProjectsDir, projectFolderName);
        setProjectBasePath(projectBasePath);
        const versificationPath = path.join(projectBasePath, ingredientsFolder, 'ingredients', 'versification.json');
        if (fs.existsSync(versificationPath)) {
          const data = JSON.parse(fs.readFileSync(versificationPath, 'utf8'));
          setVersificationData(data.maxVerses || {});
        } else {
          logger.warn('Versification file not found:', versificationPath);
          if (!fs.existsSync(projectBasePath)) {
            logger.error('Project directory does not exist:', projectBasePath);
          }
          const mediaDir = path.join(projectBasePath, ingredientsFolder);
          if (!fs.existsSync(mediaDir)) {
            logger.error('Audio/Video directory does not exist:', mediaDir);
          }
          const ingredientsDir = path.join(projectBasePath, ingredientsFolder, 'ingredients');
          if (!fs.existsSync(ingredientsDir)) {
            logger.error('Ingredients directory does not exist:', ingredientsDir);
          }
        }
      } catch (err) {
        logger.error('Error loading versification:', err);
      }
    };

    loadVersification();
  }, [projectName, projectId]);

  const {
    state: {
      // chapter,
      // verse,
      bookList,
      chapterList,
      // verseList,
      bookName,
      bookId,
    }, actions: {
      onChangeBook,
      // onChangeChapter,
      // onChangeVerse,
      // applyBooksFilter,
    },
  } = useBibleReference({
    initialBook,
    initialChapter,
    initialVerse,
    projectPath: projectBasePath,
  });

  const checkChapterCompletion = (bookCode, chapterNumber) => {
    if (!projectBasePath) {
      logger.log('Project base path not available yet');
      return false;
    }

    // Ensure consistent case handling
    const normalizedBookCode = bookCode.toLowerCase();
    const normalizedChapterNumber = String(parseInt(chapterNumber, 10));
    const mediaPath = path.join(
      projectBasePath,
      ingredientsFolder,
      'ingredients',
      normalizedBookCode.toUpperCase(),
      normalizedChapterNumber,
    );

    if (!fs.existsSync(mediaPath)) {
      return false;
    }
    const bookVerses = versificationData?.[bookCode.toUpperCase()];

    if (!bookVerses) {
      logger.log(`No versification data for ${bookCode.toUpperCase()}, available keys:`, Object.keys(versificationData?.maxVerses || {}));
      return false;
    }
    const chapterIndex = parseInt(normalizedChapterNumber, 10) - 1;
    if (chapterIndex < 0 || chapterIndex >= bookVerses.length) {
      logger.log(`Invalid chapter index: ${chapterIndex} for ${normalizedBookCode}`);
      return false;
    }

    const totalVerses = parseInt(bookVerses[chapterIndex], 10);
    if (!totalVerses || totalVerses <= 0) {
      logger.log(`Invalid verse count: ${totalVerses}`);
      return false;
    }

    const { recordedVerses } = countRecordedVersesFromFiles(
      mediaPath,
      fileExtension,
      fs,
    );

    const isComplete = recordedVerses === totalVerses;
    return isComplete;
  };

  const checkBookCompletion = (bookCode) => {
    const normalizedBookCode = bookCode.toLowerCase();
    const bookVerses = versificationData[bookCode.toUpperCase()];
    if (!bookVerses) {
      return false;
    }
    for (let chapterIndex = 0; chapterIndex < bookVerses.length; chapterIndex++) {
      const chapterNumber = chapterIndex + 1; // Convert to 1-based chapter number
      if (!checkChapterCompletion(normalizedBookCode, chapterNumber.toString())) {
        return false;
      }
    }

    return true;
  };

  const buildCompletionMap = () => {
    if (!projectBasePath || !versificationData || Object.keys(versificationData).length === 0) {
      return;
    }

    const completion = {};
    const bookCompletionTemp = {};

    bookList?.forEach((book) => {
      const bookCode = book.key.toUpperCase();
      const normalizedBookCode = book.key.toLowerCase();
      const isInScope = bookCode in currentScope;
      const isDisabled = backendScope && bookCode in backendScope;

      if (!isInScope) {
        return;
      }
      if (!isDisabled) {
        return;
      }

      completion[normalizedBookCode] = {};
      const bookVerses = versificationData[bookCode];

      if (!bookVerses) {
        bookCompletionTemp[bookCode] = false;
        return;
      }

      const bookMediaPath = path.join(
        projectBasePath,
        ingredientsFolder,
        'ingredients',
        bookCode,
      );

      if (!fs.existsSync(bookMediaPath)) {
        for (let chapterIndex = 0; chapterIndex < bookVerses.length; chapterIndex++) {
          const chapterNumber = (chapterIndex + 1).toString();
          const normalizedChapterKey = String(parseInt(chapterNumber, 10));
          completion[normalizedBookCode][normalizedChapterKey] = { fullyRecorded: false };
        }
        bookCompletionTemp[bookCode] = false;
        return;
      }

      for (let chapterIndex = 0; chapterIndex < bookVerses.length; chapterIndex++) {
        const chapterNumber = (chapterIndex + 1).toString();
        const isFullyRecorded = checkChapterCompletion(normalizedBookCode, chapterNumber);
        const normalizedChapterKey = String(parseInt(chapterNumber, 10));
        completion[normalizedBookCode][normalizedChapterKey] = { fullyRecorded: isFullyRecorded };
      }

      bookCompletionTemp[bookCode] = checkBookCompletion(normalizedBookCode);
    });

    setCompletionMap(completion);
    setBookCompletion(bookCompletionTemp);
  };

  const handleChangeBookToggle = (event) => {
    setBookFilter(event.target.value);
    const bookObj = {};
    if (chapterFilter) {
      setChapterFilter('');
    }
    if (event.target.value === 'all') {
      bookList.forEach((book) => {
        bookObj[book.key.toUpperCase()] = [];
      });
    } else if (event.target.value === 'old') {
      bookList?.slice(0, 39)?.forEach((book) => {
        bookObj[book.key.toUpperCase()] = [];
      });
    } else if (event.target.value === 'new') {
      bookList?.slice(39)?.forEach((book) => {
        bookObj[book.key.toUpperCase()] = [];
      });
    }
    const bookCode = Object.keys(bookObj)[0];
    onChangeBook(bookCode, bookCode);
    setCurrentScope(bookObj);
  };

  const handleChangeChapterToggle = (event) => {
    setChapterFilter(event.target.value);
    let stringArray = [];
    if (event.target.value === 'all') {
      const numberArray = Array(chapterList.length).fill().map((_, idx) => 1 + idx);
      stringArray = numberArray.map(String);
    }
    setCurrentScope((prev) => {
      // check and change the selectedChapters
      setSelectedChaptersSet(new Set(stringArray));
      return ({ ...prev, [bookId.toUpperCase()]: stringArray });
    });
  };

  const handleSelectBook = (e, book) => {
    if (bookFilter) {
      setBookFilter('');
    }
    if (chapterFilter) {
      setChapterFilter('');
    }
    const bookCode = book.key.toUpperCase();
    setCurrentScope((prev) => {
      // check and change the selectedChapters
      setSelectedChaptersSet(new Set(prev[bookCode]) || new Set([]));
      return ({ ...prev, [bookCode]: prev[bookCode] || [] });
    });
    onChangeBook(book.key, book.key);
  };

  const handleChapterRangeSelection = (e) => {
    e.preventDefault();
    let start = parseInt(e.target?.start?.value, 10) || null;
    let end = parseInt(e.target?.end?.value, 10) || null;
    // hanlde start greater and end smaller
    if (start > end) {
      const temp = start;
      start = end;
      end = temp;
    }
    const numberArray = Array(end - start + 1).fill().map((_, idx) => start + idx);
    const stringArray = numberArray.map(String);
    setCurrentScope((prev) => {
      // check and change the selectedChapters
      setSelectedChaptersSet(new Set(stringArray));
      return ({ ...prev, [bookId.toUpperCase()]: stringArray });
    });
    // e.target.start.value = '';
    // e.target.end.value = '';
  };

  const handleRemoveScope = (e, book) => {
    e.stopPropagation();
    if (bookFilter) {
      setBookFilter('');
    }
    const bukId = book.key.toUpperCase();
    const newScopeObj = { ...currentScope };
    delete newScopeObj[bukId];
    setCurrentScope(newScopeObj);
  };

  /**
   * Fn to toggle chapter selection for the active book
   */
  const handleChapterSelection = (e, chapter) => {
    if (chapterFilter) {
      setChapterFilter('');
    }
    const bukId = bookId.toUpperCase();
    if (bukId in currentScope) {
      setCurrentScope((prev) => {
        const currentCh = new Set(prev[bukId] || new Set([]));
        if (currentCh.has(chapter)) {
          currentCh.delete(chapter);
        } else {
          currentCh.add(chapter);
        }
        setSelectedChaptersSet(currentCh);
        return {
          ...prev,
          [bukId]: Array.from(currentCh),
        };
      });
    } else {
      logger.error('ScopeManagement.js', 'Active book is not in scope');
    }
  };

  useEffect(() => {
    if (bookList && versificationData && Object.keys(versificationData).length > 0 && projectBasePath && Object.keys(currentScope).length > 0) {
      buildCompletionMap();
    }
  }, [currentScope]);

  useEffect(() => {
    if (bookList && versificationData && Object.keys(versificationData).length > 0 && projectBasePath) {
      buildCompletionMap();
    }
  }, [bookList, versificationData, projectBasePath]);

  useEffect(() => {
    if (metadata?.type?.flavorType?.currentScope) {
      const scopeObj = metadata.type.flavorType.currentScope;
      const bookKeys = Object.keys(scopeObj);
      if (bookKeys.length > 0) {
        setSelectedChaptersSet(new Set(scopeObj[bookKeys[0]]) || new Set([]));
        const bookCode = bookKeys[0];
        onChangeBook(bookCode.toLowerCase(), bookCode.toLowerCase());
      } else {
        setSelectedChaptersSet(new Set());
        onChangeBook(null);
      }
      setCurrentScope(scopeObj);
    } else {
      logger.error('ScopeManagement.js', 'Unable to read the scope from burrito');
    }
  }, []);
  return (
    <div className="w-full h-full pt-5 px-5">
      <TitleBar>
        <p className="text-gray-900 text-center text-sm">
          {t('label-book-selection')}
          {' '}
          :
        </p>
        <BulkSelectionGroup
          selectedOption={bookFilter}
          handleSelect={handleChangeBookToggle}
          toggleOptions={ToggleBookOptions}
        />
      </TitleBar>

      <div className="grid grid-cols-2 gap-5">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9]
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase"
        >
          {bookList?.slice(0, 39)?.map((book) => {
            const isScope = book?.key?.toUpperCase() in currentScope;
            return (
              <BookItem
                key={book.key}
                book={book}
                handleRemoveScope={handleRemoveScope}
                handleSelectBook={handleSelectBook}
                isInScope={isScope}
                disable={backendScope && book?.key?.toUpperCase() in backendScope}
                fullyRecorded={bookCompletion[book.key.toUpperCase()]}
              />
            );
          })}
        </div>

        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9]
          grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 p-4 text-xxs text-left  uppercase content-start"
        >
          {bookList?.slice(39)?.map((book) => {
            const isScope = book?.key?.toUpperCase() in currentScope;
            return (
              <BookItem
                key={book.key}
                book={book}
                handleRemoveScope={handleRemoveScope}
                handleSelectBook={handleSelectBook}
                isInScope={isScope}
                disable={backendScope && book?.key?.toUpperCase() in backendScope}
                fullyRecorded={bookCompletion[book.key.toUpperCase()]}
              />
            );
          })}
        </div>
      </div>
      {bookName
        && (
          <TitleBar>
            <p className="text-gray-900 text-center text-sm flex gap-2">
              <span>
                {t('label-chapter-selection')}
                {' '}
                :
              </span>
              <span className="font-medium">{bookName}</span>
            </p>
            <BulkSelectionGroup
              selectedOption={chapterFilter}
              handleSelect={handleChangeChapterToggle}
              toggleOptions={ToggleChapterOptions}
            />
          </TitleBar>
        )}

      <form className="w-full my-2 flex gap-3 h-6  text-xxs justify-end" onSubmit={handleChapterRangeSelection}>
        <div className="flex gap-1 items-center ">
          <label>
            {t('label-start')}
            {' '}
            :
          </label>
          <input
            type="number"
            className="w-12 h-full  px-1 text-xs border-gray-400 outline-none rounded-[4px]"
            name="start"
            min={1}
            required
            max={(chapterList && chapterList.length - 1) || 149}
          />
        </div>
        <div className="flex gap-1 items-center">
          <label>
            {t('label-end')}
            {' '}
            :
          </label>
          <input
            type="number"
            className="w-12 h-full  px-1 text-xs border-gray-400 outline-none rounded-[4px]"
            name="end"
            min={1}
            required
            max={chapterList?.length || 150}
          />
        </div>

        <Button type="submit">
          {t('label-select')}
        </Button>
      </form>

      <div className="grid grid-cols-1">
        <div className="border border-[#eeecec] shadow-sm rounded-lg bg-[#F9F9F9] flex flex-wrap gap-2 p-4 text-xxs text-left  uppercase">
          {chapterList?.map(({ key, name }) => {
            const isInScope = selectedChaptersSet.has(key);
            const disable = backendScope && backendScope[bookId.toUpperCase()]?.includes(key);

            const normalizedKey = String(parseInt(key, 10));
            const isFullyRecorded = completionMap[bookId?.toLowerCase()]?.[normalizedKey]?.fullyRecorded || false;

            const totalVerses = versificationData[bookId?.toUpperCase()]?.[parseInt(key, 10) - 1] || 0;
            const chapterMediaPath = path.join(
              projectBasePath,
              ingredientsFolder,
              'ingredients',
              bookId?.toUpperCase(),
              normalizedKey,
            );

            const { recordedVerses } = countRecordedVersesFromFiles(
              chapterMediaPath,
              fileExtension,
              fs,
            );
            function getBookButtonClass({ isFullyRecorded, disable, isInScope }) {
              if (isFullyRecorded) {
                return 'border min-w-8 text-center bg-success text-white font-medium pointer-events-none cursor-default';
              }
              if (disable) {
                return 'border min-w-8 text-center bg-gray-400 hover:bg-gray-500';
              }
              if (isInScope) {
                return 'border min-w-8 text-center bg-primary text-white font-medium';
              }
              return 'border min-w-8 text-center';
            }
            return (
              <BookButton
                onClick={(e) => handleChapterSelection(e, name)}
                key={key}
                className={getBookButtonClass({ isFullyRecorded, disable, isInScope })}
                title={disable ? `${recordedVerses}/${totalVerses} verses recorded` : ''}
              >
                {name}
              </BookButton>
            );
          })}

        </div>
      </div>

    </div>
  );
} export default ScopeManagement;
