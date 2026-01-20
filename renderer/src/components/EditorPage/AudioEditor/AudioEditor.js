/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import Editor from '@/modules/editor/Editor';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import { readFile } from '@/core/editor/readFile';
import { isElectron } from '@/core/handleElectron';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { readRefMeta } from '@/core/reference/readRefMeta';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import {
  useState, useEffect, useContext, useRef,
} from 'react';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { useVerseJoiningAudio } from '@/hooks/useVerseJoiningAudio';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import EditorPage from '@/components/AudioRecorder/components/EditorPage';
import { getDetails } from '../ObsEditor/utils/getDetails';
import * as logger from '../../../logger';

const grammar = require('usfm-grammar');

const normalizeVerseData = (verses) => {
  if (!verses || !Array.isArray(verses)) {
    return verses;
  }

  return verses.map((verse) => {
    const isRangeVerse = verse.verseNumber.includes('-');
    const hasVerseSegments = verse.verseSegments
      && Array.isArray(verse.verseSegments)
      && verse.verseSegments.length > 0;

    const isPreCombined = verse.isPreCombined === true
      || (isRangeVerse && !hasVerseSegments);

    let joinedVerses = verse.joinedVerses;
    if (isPreCombined && (!joinedVerses || joinedVerses === null)) {
      const parts = verse.verseNumber.split('-').map(Number);
      if (parts.length === 2) {
        joinedVerses = Array.from(
          { length: parts[1] - parts[0] + 1 },
          (_, i) => parts[0] + i,
        );
      }
    }

    if (isPreCombined) {
      logger.debug(`Verse ${verse.verseNumber} marked as pre-combined`);
    }

    return {
      ...verse,
      isPreCombined,
      joinedVerses,
    };
  });
};
// Priority 1: Load from bookId.json (saved structure with join info)
const loadVerseStructureFromFile = (projectsDir, bookId, chapter) => {
  try {
    const fs = window.require('fs');
    const path = require('path');
    const bookIdLower = bookId.toLowerCase();
    const bookIdUpper = bookId.toUpperCase();
    const bookFolder = path.join(projectsDir, 'audio', 'ingredients', bookIdUpper);
    const structureFile = path.join(bookFolder, `${bookIdLower}.json`);

    if (fs.existsSync(structureFile)) {
      const data = fs.readFileSync(structureFile, 'utf8');
      const allStructure = JSON.parse(data);

      const chapterKey = chapter.toString();
      if (allStructure[bookIdUpper]
        && allStructure[bookIdUpper][chapterKey]
        && allStructure[bookIdUpper][chapterKey].verses) {
        const normalizedVerses = normalizeVerseData(allStructure[bookIdUpper][chapterKey].verses);

        logger.debug(`Loaded verse structure from ${bookIdLower}.json for chapter ${chapterKey}`);
        return {
          success: true,
          verses: normalizedVerses,
          source: `${bookIdLower}.json`,
        };
      }
      logger.debug(`Chapter ${chapterKey} not found in ${bookIdLower}.json structure`);
    } else {
      logger.debug(`${bookIdLower}.json not found at ${structureFile}`);
    }

    return { success: false, verses: null, source: null };
  } catch (err) {
    logger.error(`Error loading ${bookId}.json:`, err);
    return { success: false, verses: null, source: null };
  }
};

// Priority 2: Load from USFM
const loadVersesFromUSFM = (projectsDir, bookId, chapter) => {
  try {
    const fs = window.require('fs');
    const path = require('path');

    const usfmPath = path.join(
      projectsDir,
      'text-1',
      'ingredients',
      `${bookId.toUpperCase()}.usfm`,
    );

    if (!fs.existsSync(usfmPath)) {
      logger.debug('USFM file not found');
      return {
        success: false, bookContent: null, verses: null, source: null,
      };
    }

    const usfm = fs.readFileSync(usfmPath, 'utf8');
    const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
    const isJsonValid = myUsfmParser.validate();

    if (!isJsonValid) {
      logger.error('Invalid USFM file');
      return {
        success: false, bookContent: null, verses: null, source: null,
      };
    }

    const jsonOutput = myUsfmParser.toJSON();
    const bookContent = jsonOutput.chapters;

    const chapterData = bookContent.find(
      (ch) => ch.chapterNumber === chapter.toString(),
    );

    if (!chapterData) {
      logger.warn('Chapter not found in USFM');
      return {
        success: false, bookContent, verses: null, source: null,
      };
    }

    logger.debug(`Found ${chapterData.contents.length} verses in USFM for chapter ${chapter}`);

    // Mark pre-combined verses from USFM
    const versesWithPreCombinedFlag = chapterData.contents.map((verse) => {
      const isRangeVerse = verse.verseNumber && verse.verseNumber.includes('-');

      if (isRangeVerse) {
        logger.debug(`Found pre-combined verse ${verse.verseNumber} in USFM`);
        return {
          ...verse,
          isPreCombined: true,
          joinedVerses: null,
        };
      }

      return {
        ...verse,
        isPreCombined: false,
        joinedVerses: null,
      };
    });

    logger.debug('Successfully loaded verses from USFM file');
    return {
      success: true,
      bookContent,
      verses: versesWithPreCombinedFlag,
      source: 'USFM',
    };
  } catch (err) {
    logger.error('Error loading USFM:', err);
    return {
      success: false, bookContent: null, verses: null, source: null,
    };
  }
};

// Priority 3: Load from versification.json
const loadVersesFromVersification = async (projectName, username, bookId, chapter) => {
  try {
    logger.debug('Attempting to load from versification.json');

    const value = await readFile({
      projectname: projectName,
      filename: 'audio/ingredients/versification.json',
      username,
    });

    if (!value) {
      logger.error('versification.json not found');
      return {
        success: false, bookContent: null, verses: null, source: null,
      };
    }

    const file = JSON.parse(value);
    const list = file.maxVerses;

    if (!list[bookId.toUpperCase()]) {
      logger.error('Book not found in versification.json');
      return {
        success: false, bookContent: null, verses: null, source: null,
      };
    }

    const bookContent = [];
    list[bookId.toUpperCase()].forEach((verseCount, c) => {
      const verses = [];
      for (let v = 1; v <= parseInt(verseCount, 10); v += 1) {
        verses.push({
          verseNumber: v.toString(),
          verseText: '',
        });
      }
      bookContent.push({
        chapterNumber: (c + 1).toString(),
        contents: verses,
      });
    });

    const chapterData = bookContent.find(
      (ch) => ch.chapterNumber === chapter.toString(),
    );

    if (!chapterData) {
      logger.error('Chapter not found in versification.json');
      return {
        success: false, bookContent, verses: null, source: null,
      };
    }

    logger.debug('Loaded verses from versification.json (empty text)');
    return {
      success: true,
      bookContent,
      verses: chapterData.contents,
      source: 'versification.json',
    };
  } catch (err) {
    logger.error('Error loading versification.json:', err);
    return {
      success: false, bookContent: null, verses: null, source: null,
    };
  }
};

const updateVerseTextsFromUSFM = (savedStructure, bookContent, chapter) => {
  try {
    if (!bookContent) {
      logger.warn('No book content available to update texts');
      return savedStructure;
    }

    const chapterData = bookContent.find(
      (ch) => ch.chapterNumber === chapter.toString(),
    );

    if (!chapterData) {
      logger.warn('Chapter not found in book content:', chapter);
      return savedStructure;
    }

    return savedStructure.map((verse) => {
      if (verse.joinedVerses && verse.joinedVerses.length > 0) {
        const texts = verse.joinedVerses
          .map((verseNum) => {
            const verseData = chapterData.contents.find(
              (v) => v.verseNumber === verseNum.toString(),
            );
            return verseData ? verseData.verseText : '';
          })
          .filter((text) => text);

        return {
          ...verse,
          verseText: texts.join(' ').trim() || verse.verseText,
        };
      }

      const verseData = chapterData.contents.find(
        (v) => v.verseNumber === verse.verseNumber.toString(),
      );

      return {
        ...verse,
        verseText: verseData ? verseData.verseText : verse.verseText,
      };
    });
  } catch (err) {
    logger.error('Error updating verse texts from USFM:', err);
    return savedStructure;
  }
};

const attachAudiosToVerses = (verses, audioPath, chapter) => {
  try {
    const fs = window.require('fs');
    const path = require('path');

    if (!fs.existsSync(audioPath)) {
      logger.warn('Audio path does not exist:', audioPath);
      return verses;
    }

    const audioFiles = fs.readdirSync(audioPath);
    logger.debug('Scanning for audio files:', {
      audioPath,
      fileCount: audioFiles.length,
      chapter: chapter.toString(),
    });

    const updatedVerses = verses.map((verse) => ({ ...verse }));

    audioFiles.forEach((fileName) => {
      const parsed = path.parse(fileName);
      const parts = parsed.name.split('_');

      if (parts.length >= 2) {
        const fileChapter = parts[0];
        const fileVerseNumber = parts[1];
        const fileTakeNumber = parts[2];
        const isDefault = parts[3] === 'default';

        if (fileChapter === chapter.toString()) {
          const verseIndex = updatedVerses.findIndex((v) => {
            if (v.verseNumber === fileVerseNumber) {
              return true;
            }

            if (v.joinedVerses && Array.isArray(v.joinedVerses)) {
              const fileNum = parseInt(fileVerseNumber, 10);
              if (!Number.isNaN(fileNum) && v.joinedVerses.includes(fileNum)) {
                return true;
              }
            }

            if (v.verseNumber && v.verseNumber.includes('-')) {
              const [start, end] = v.verseNumber.split('-').map(Number);

              if (fileVerseNumber.includes('-')) {
                const [fileStart, fileEnd] = fileVerseNumber.split('-').map(Number);
                return start === fileStart && end === fileEnd;
              }

              const fileNum = Number(fileVerseNumber);
              if (!Number.isNaN(fileNum) && fileNum >= start && fileNum <= end) {
                return true;
              }
            }

            return false;
          });

          if (verseIndex !== -1) {
            if (fileTakeNumber) {
              const take = `take${fileTakeNumber}`;
              updatedVerses[verseIndex][take] = fileName;

              if (isDefault) {
                updatedVerses[verseIndex].default = take;
              }

              logger.debug(`Attached ${fileName} to verse ${updatedVerses[verseIndex].verseNumber}`);
            } else {
              const standardFileName = `${chapter}_${fileVerseNumber}_1_default.mp3`;
              updatedVerses[verseIndex].take1 = standardFileName;
              updatedVerses[verseIndex].default = 'take1';

              try {
                const oldPath = path.join(audioPath, fileName);
                const newPath = path.join(audioPath, standardFileName);
                if (oldPath !== newPath && !fs.existsSync(newPath)) {
                  fs.renameSync(oldPath, newPath);
                  logger.debug(`Renamed to ${standardFileName}`);
                }
              } catch (err) {
                logger.error('Error renaming audio file:', err);
              }
            }
          } else {
            logger.warn(`No verse found for audio: ${fileName}`);
          }
        }
      }
    });

    return updatedVerses;
  } catch (err) {
    logger.error('Error attaching audios to verses:', err);
    return verses;
  }
};

const AudioEditor = ({ editor }) => {
  const { t } = useTranslation();
  const [notify, setNotify] = useState();
  const structureAppliedRef = useRef(false);
  const [snackText, setSnackText] = useState('');
  const [snackBar, setOpenSnackBar] = useState(false);
  const [displyScreen, setDisplayScreen] = useState(false);
  const [originalBookContent, setOriginalBookContent] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null,
  });

  const {
    state: {
      bookId,
      chapter,
      verse,
      isLoading,
      audioContent,
      audioPath,
      selectedFont,
      editorFontSize,
      // eslint-disable-next-line no-unused-vars
      updateWave, // updateWave is used to update the waveform in the Editor after recording audio
    }, actions: {
      onChangeVerse,
      setIsLoading,
      setAudioContent,
      setAudioCurrentChapter,
      setAudioPath,
    },
  } = useContext(ReferenceContext);

  const {
    handleJoinVerse,
    handleDisjoinVerse,
  } = useVerseJoiningAudio({
    audioContent: audioContent || [],
    setAudioContent,
    originalBookContent,
    chapter,
    audioPath,
    bookId,
    t,
    setNotify,
    setSnackText,
    setOpenSnackBar,
    setConfirmModal,
  });

  const closeConfirmModal = () => {
    setConfirmModal({
      open: false,
      title: '',
      message: '',
      confirmText: '',
      onConfirm: null,
    });
  };

  const handleConfirm = () => {
    if (confirmModal.onConfirm) {
      confirmModal.onConfirm();
    }
    closeConfirmModal();
  };

  useEffect(() => {
    setTimeout(() => {
      const container = document.getElementById('editor');
      if (!container) { return; }

      let el = container.querySelector(`#ch${chapter}v${verse}`);

      if (!el) {
        const candidates = container.querySelectorAll(`[id^="ch${chapter}v"]`);

        candidates.forEach((node) => {
          const id = node.getAttribute('id');
          const range = id.replace(`ch${chapter}v`, '');

          if (range.includes('-')) {
            const [start, end] = range.split('-').map(Number);

            if (Number(verse) >= start && Number(verse) <= end) {
              el = node;
            }
          }
        });
      }
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  }, [chapter, verse, audioContent]);

  useEffect(() => {
    if (!isElectron()) { return; }

    structureAppliedRef.current = false;

    setIsLoading(true);
    setDisplayScreen(false);
    setAudioCurrentChapter();
    setAudioPath();

    getDetails().then(async ({
      projectName, username, projectsDir, metaPath,
    }) => {
      try {
        const refs = await readRefMeta({ projectsDir });
        const results = await Promise.all(
          refs.map(async () => {
            const data = await readRefBurrito({ metaPath });
            return data;
          }),
        );

        const validData = results.find((data) => data);

        if (validData) {
          const _data = JSON.parse(validData);
          const _books = [];
          const scopeEntries = Object.entries(_data.type.flavorType.currentScope);

          await Promise.all(
            scopeEntries.map(async ([key]) => {
              if (
                key === bookId.toUpperCase()
                && _data.type.flavorType.currentScope[key].includes(chapter.toString())
              ) {
                _books.push(bookId.toUpperCase());
                const fs = window.require('fs');
                const path = require('path');

                const bookFolder = path.join(projectsDir, 'audio', 'ingredients', bookId.toUpperCase());
                if (!fs.existsSync(bookFolder)) {
                  fs.mkdirSync(bookFolder, { recursive: true });
                }

                const chapterFolder = path.join(bookFolder, chapter.toString());
                if (!fs.existsSync(chapterFolder)) {
                  fs.mkdirSync(chapterFolder, { recursive: true });
                }

                let finalVerses = [];
                let bookContent = null;
                let dataSource = null;

                logger.debug('=== Starting data load priority chain ===');
                const structureResult = loadVerseStructureFromFile(projectsDir, bookId, chapter);

                if (structureResult.success) {
                  logger.debug('Found saved structure');
                  const usfmResult = loadVersesFromUSFM(projectsDir, bookId, chapter);

                  if (usfmResult.success) {
                    logger.debug('Merging saved structure with USFM text');
                    finalVerses = updateVerseTextsFromUSFM(
                      structureResult.verses,
                      usfmResult.bookContent,
                      chapter,
                    );
                    bookContent = usfmResult.bookContent;
                    dataSource = `${bookId.toLowerCase()}.json + USFM`;
                  } else {
                    logger.debug('Using saved structure as-is');
                    finalVerses = structureResult.verses;
                    dataSource = `${bookId.toLowerCase()}.json`;
                  }
                } else {
                  logger.debug('No saved structure, trying USFM...');
                  const usfmResult = loadVersesFromUSFM(projectsDir, bookId, chapter);

                  if (usfmResult.success) {
                    logger.debug('Using USFM data');
                    finalVerses = usfmResult.verses;
                    bookContent = usfmResult.bookContent;
                    dataSource = 'USFM';
                  } else {
                    logger.debug('Trying versification.json...');
                    const versificationResult = await loadVersesFromVersification(
                      projectName,
                      username,
                      bookId,
                      chapter,
                    );

                    if (versificationResult.success) {
                      logger.debug('Using versification.json');
                      finalVerses = versificationResult.verses;
                      bookContent = versificationResult.bookContent;
                      dataSource = 'versification.json';
                    } else {
                      logger.error('All data sources failed!');
                      setDisplayScreen(true);
                      setIsLoading(false);
                      setNotify('failure');
                      setSnackText(t('msg-no-verse-data'));
                      setOpenSnackBar(true);
                      return;
                    }
                  }
                }

                logger.debug('=== Data load complete ===');
                logger.debug('Data source:', dataSource);
                logger.debug('Verse count:', finalVerses.length);

                setOriginalBookContent(bookContent);

                const versesWithAudios = structureAppliedRef.current
                  ? finalVerses
                  : attachAudiosToVerses(finalVerses, chapterFolder, chapter);

                setAudioPath(chapterFolder);
                setAudioCurrentChapter({
                  bookContent,
                  filePath: bookFolder,
                  chapterNum: chapter.toString(),
                });
                setAudioContent(versesWithAudios);
                structureAppliedRef.current = true;

                setIsLoading(false);
                setOpenSnackBar(true);
                setSnackText(t('dynamic-msg-load-ref-bible-snack', { refName: projectName }));
                setNotify('success');
                setDisplayScreen(false);
              }
            }),
          );

          if (_books.includes(bookId.toUpperCase()) === false) {
            setAudioContent();
            setDisplayScreen(true);
          }
        }
      } catch (error) {
        logger.error('Error in useEffect:', error);
        setIsLoading(false);
        setDisplayScreen(true);
      }
    });
  }, [bookId, chapter]);

  return (
    <div id="editor">
      <Editor callFrom="textTranslation" editor={editor}>
        {((isLoading || !audioContent) && displyScreen) && <EmptyScreen call="audio" />}
        {isLoading && !displyScreen && <LoadingScreen />}
        {audioContent && isLoading === false
          && (
            <EditorPage
              verse={verse}
              location={audioPath}
              content={audioContent}
              updateWave={updateWave}
              onChangeVerse={onChangeVerse}
              onDisjoinVerse={handleDisjoinVerse}
              onJoinVerse={handleJoinVerse}
              selectedFont={selectedFont}
              fontSize={editorFontSize}
              chapter={chapter}
            />
          )}
        <SnackBar
          openSnackBar={snackBar}
          snackText={snackText}
          setOpenSnackBar={setOpenSnackBar}
          setSnackText={setSnackText}
          error={notify}
        />
        <ConfirmationModal
          openModal={confirmModal.open}
          title={confirmModal.title}
          setOpenModal={closeConfirmModal}
          confirmMessage={confirmModal.message}
          buttonName={confirmModal.confirmText}
          closeModal={handleConfirm}
        />
      </Editor>
    </div>
  );
};
export default AudioEditor;

AudioEditor.propTypes = {
  editor: PropTypes.string,
};
