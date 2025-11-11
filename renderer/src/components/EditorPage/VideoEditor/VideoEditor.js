import PropTypes from 'prop-types';
import Editor from '@/modules/editor/Editor';
import { useTranslation } from 'react-i18next';
import { SnackBar } from '@/components/SnackBar';
import { readFile } from '@/core/editor/readFile';
import { isElectron } from '@/core/handleElectron';
import { useState, useEffect, useContext } from 'react';
import { useVerseJoining } from '@/hooks/useVerseJoining';
import EmptyScreen from '@/components/Loading/EmptySrceen';
import { readRefMeta } from '@/core/reference/readRefMeta';
import LoadingScreen from '@/components/Loading/LoadingScreen';
import { readRefBurrito } from '@/core/reference/readRefBurrito';
import ConfirmationModal from '@/layouts/editor/ConfirmationModal';
import { ReferenceContext } from '@/components/context/ReferenceContext';
import VideoPlayer from '@/components/EditorPage/VideoEditor/VideoPlayer';

import { getDetails } from '../ObsEditor/utils/getDetails';
import * as logger from '../../../logger';

const grammar = require('usfm-grammar');

const doesVideoMatchVerse = (videoVerseNumber, targetVerseNumber) => {
  const videoStr = String(videoVerseNumber);
  const targetStr = String(targetVerseNumber);

  if (videoStr === targetStr) {
    return true;
  }

  if (videoStr.includes('-') && targetStr.includes('-')) {
    return videoStr === targetStr;
  }

  return false;
};

const loadVerseStructureFromFile = (projectsDir, bookId, chapter) => {
  try {
    const fs = window.require('fs');
    const path = require('path');
    const bookIdLower = bookId.toLowerCase();
    const bookIdUpper = bookId.toUpperCase();
    const bookFolder = path.join(projectsDir, 'video', 'ingredients', bookIdUpper);
    const structureFile = path.join(bookFolder, `${bookIdLower}.json`);

    if (fs.existsSync(structureFile)) {
      const data = fs.readFileSync(structureFile, 'utf8');
      const allStructure = JSON.parse(data);

      const chapterKey = chapter.toString();
      if (allStructure[bookIdUpper]
        && allStructure[bookIdUpper][chapterKey]
        && allStructure[bookIdUpper][chapterKey].verses) {
        logger.info(`✓ Loaded verse structure from ${bookIdLower}.json for chapter ${chapterKey}`);
        logger.info(`  - Found ${allStructure[bookIdUpper][chapterKey].verses.length} verses in structure`);
        return {
          success: true,
          verses: allStructure[bookIdUpper][chapterKey].verses,
          source: `${bookIdLower}.json`,
        };
      }
      logger.info(`Chapter ${chapterKey} not found in ${bookIdLower}.json structure`);
    } else {
      logger.info(`${bookIdLower}.json not found at ${structureFile}`);
    }

    return { success: false, verses: null, source: null };
  } catch (err) {
    logger.error(`Error loading ${bookId}.json:`, err);
    return { success: false, verses: null, source: null };
  }
};

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
      logger.info('USFM file not found');
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
        success: false, bookContent: null, verses: null, sjoinource: null,
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

    logger.info('Loaded verses from USFM file');
    return {
      success: true,
      bookContent,
      verses: chapterData.contents,
      source: 'USFM',
    };
  } catch (err) {
    logger.error('Error loading USFM:', err);
    return {
      success: false, bookContent: null, verses: null, source: null,
    };
  }
};

const loadVersesFromVersification = async (projectName, username, bookId, chapter) => {
  try {
    logger.info('Attempting to load from versification.json');

    const value = await readFile({
      projectname: projectName,
      filename: 'video/ingredients/versification.json',
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

    logger.info('Loaded verses from versification.json (empty text)');
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

const attachVideosToVerses = (verses, videoPath, chapter) => {
  try {
    const fs = window.require('fs');
    const path = require('path');

    if (!fs.existsSync(videoPath)) {
      logger.warn('Video path does not exist:', videoPath);
      return verses;
    }

    const videoFiles = fs.readdirSync(videoPath);
    logger.info('Scanning for video files:', {
      videoPath,
      fileCount: videoFiles.length,
      chapter: chapter.toString(),
    });

    const updatedVerses = verses.map((verse) => ({ ...verse }));

    let attachedCount = 0;
    let skippedCount = 0;

    videoFiles.forEach((fileName) => {
      const parsed = path.parse(fileName);
      const parts = parsed.name.split('_');

      if (parts.length >= 3) {
        const fileChapter = parts[0];
        const fileVerseNumber = parts[1];
        const fileTakeNumber = parts[2];
        const isDefault = parts[3] === 'default';

        logger.info(`  Checking video: ${fileName}`, {
          fileChapter,
          fileVerseNumber,
          targetChapter: chapter.toString(),
          fileTakeNumber,
          isDefault,
        });

        if (fileChapter === chapter.toString()) {
          const verseIndex = updatedVerses.findIndex((v) => doesVideoMatchVerse(fileVerseNumber, v.verseNumber));

          if (verseIndex !== -1) {
            const take = `take${fileTakeNumber}`;
            updatedVerses[verseIndex][take] = fileName;

            if (isDefault) {
              updatedVerses[verseIndex].default = take;
            }

            attachedCount += 1;
            logger.info(`Attached video to verse ${updatedVerses[verseIndex].verseNumber}:`, {
              verse: updatedVerses[verseIndex].verseNumber,
              file: fileName,
              take,
              isDefault,
            });
          } else {
            skippedCount += 1;
            logger.warn('Video file found but no matching verse:', {
              fileName,
              fileVerseNumber,
              availableVerses: updatedVerses.map((v) => v.verseNumber),
            });
          }
        } else {
          logger.info(`Skipping video from different chapter: ${fileChapter} (current: ${chapter})`);
        }
      } else {
        logger.warn(`Invalid video filename format: ${fileName}`);
      }
    });

    logger.info('Video attachment complete:', {
      total: videoFiles.length,
      attached: attachedCount,
      skipped: skippedCount,
    });

    return updatedVerses;
  } catch (err) {
    logger.error('Error attaching videos to verses:', err);
    return verses;
  }
};

const VideoEditor = ({ editor }) => {
  const { t } = useTranslation();
  const [notify, setNotify] = useState();
  const [snackText, setSnackText] = useState('');
  const [snackBar, setOpenSnackBar] = useState(false);
  const [displyScreen, setDisplayScreen] = useState(false);
  const [originalBookContent, setOriginalBookContent] = useState(null);
  const [model, setModel] = useState({
    openModel: false,
    title: '',
    confirmMessage: '',
    buttonName: '',
    action: '',
    actionData: {},
  });

  const modelClose = () => {
    setModel({
      openModel: false,
      title: '',
      confirmMessage: '',
      buttonName: '',
      action: '',
      actionData: {},
    });
  };

  const {
    state: {
      bookId,
      chapter,
      verse,
      isLoading,
      videoContent,
      videoPath,
      selectedFont,
      editorFontSize,
      updateVideoWave,
    },
    actions: {
      onChangeVerse,
      setIsLoading,
      setVideoContent,
      setVideoCurrentChapter,
      setVideoPath,
    },
  } = useContext(ReferenceContext);

  const {
    handleJoinVerse,
    handleDisjoinVerse,
    executePendingOperation,
  } = useVerseJoining({
    videoContent,
    setVideoContent,
    originalBookContent,
    chapter,
    videoPath,
    bookId,
    t,
    setNotify,
    setSnackText,
    setOpenSnackBar,
  });

  const executeDeleteVideo = (verseNumber, videoFileName) => {
    try {
      const fs = window.require('fs');
      const path = require('path');
      const filePath = path.join(videoPath, videoFileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info('Video file deleted:', filePath);
      }

      const updatedContent = videoContent.map((item) => {
        if (item.verseNumber === verseNumber) {
          const updated = { ...item };
          delete updated.take1;
          delete updated[updated.default];
          updated.default = '';
          return updated;
        }
        return item;
      });

      setVideoContent(updatedContent);
      setNotify('success');
      setSnackText(t('msg-video-deleted-success'));
      setOpenSnackBar(true);
    } catch (err) {
      setNotify('failure');
      setSnackText(t('msg-video-delete-failed'));
      logger.error('Error deleting video file:', err);
      setOpenSnackBar(true);
      return false;
    }
  };

  const onJoinVerse = (currentVerseNumber) => {
    const operation = handleJoinVerse(currentVerseNumber);

    if (operation) {
      setModel({
        openModel: true,
        title: t('msg-confirm-join-title'),
        confirmMessage:
          t('msg-join-warning-videos'),
        buttonName: t('btn-continue'),
        action: 'joinVerse',
        actionData: operation.data,
      });
    }
  };

  const onDisjoinVerse = (joinedVerseNumber) => {
    const operation = handleDisjoinVerse(joinedVerseNumber);

    if (operation) {
      setModel({
        openModel: true,
        title: t('msg-confirm-disjoin-title'),
        confirmMessage:
          t('msg-disjoin-warning-videos'),
        buttonName: t('btn-continue') || 'Continue',
        action: 'disjoinVerse',
        actionData: operation.data,
      });
    }
  };

  const handleModalConfirm = () => {
    if (model.action === 'deleteVideo') {
      executeDeleteVideo(model.actionData.verseNumber, model.actionData.videoFileName);
    } else if (model.action === 'reRecordVideo') {
      try {
        const fs = window.require('fs');
        if (fs.existsSync(model.actionData.filePath)) {
          fs.unlinkSync(model.actionData.filePath);
          logger.info('Deleted existing video for re-recording');
        }
      } catch (err) {
        setNotify('failure');
        setSnackText('Failed to delete existing video');
        logger.error('Error deleting existing video file:', err);
        setOpenSnackBar(true);
      }
    } else if (model.action === 'joinVerse' || model.action === 'disjoinVerse') {
      executePendingOperation();
    }
    modelClose();
  };

  useEffect(() => {
    if (isElectron()) {
      setIsLoading(true);
      setDisplayScreen(false);
      setVideoCurrentChapter();
      setVideoPath();

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

                  logger.info('='.repeat(60));
                  logger.info(`LOADING VERSES FOR ${bookId.toUpperCase()} CHAPTER ${chapter}`);
                  logger.info('='.repeat(60));

                  const bookFolder = path.join(
                    projectsDir,
                    'video',
                    'ingredients',
                    bookId.toUpperCase(),
                  );
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

                  const structureResult = loadVerseStructureFromFile(
                    projectsDir,
                    bookId,
                    chapter,
                  );

                  if (structureResult.success) {
                    logger.info('Using saved verse structure, fetching text from USFM...');

                    const usfmResult = loadVersesFromUSFM(projectsDir, bookId, chapter);

                    if (usfmResult.success) {
                      logger.info('Merging structure with USFM text');
                      finalVerses = updateVerseTextsFromUSFM(
                        structureResult.verses,
                        usfmResult.bookContent,
                        chapter,
                      );
                      bookContent = usfmResult.bookContent;
                      dataSource = `${bookId.toLowerCase()}.json + USFM`;
                    } else {
                      logger.warn('USFM not available, using structure with existing text');
                      finalVerses = structureResult.verses;
                      dataSource = `${bookId.toLowerCase()}.json`;
                    }
                  } else {
                    logger.info('No structure found, trying USFM...');
                    const usfmResult = loadVersesFromUSFM(projectsDir, bookId, chapter);

                    if (usfmResult.success) {
                      finalVerses = usfmResult.verses;
                      bookContent = usfmResult.bookContent;
                      dataSource = 'USFM';
                    } else {
                      logger.warn('USFM not available, trying versification.json...');
                      const versificationResult = await loadVersesFromVersification(
                        projectName,
                        username,
                        bookId,
                        chapter,
                      );

                      if (versificationResult.success) {
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

                  logger.info('='.repeat(60));
                  logger.info(`DATA SOURCE: ${dataSource}`);
                  logger.info(`VERSES LOADED: ${finalVerses.length}`);
                  logger.info('='.repeat(60));

                  setOriginalBookContent(bookContent);

                  logger.info('Starting video attachment process...');
                  const versesWithVideos = attachVideosToVerses(
                    finalVerses,
                    chapterFolder,
                    chapter,
                  );

                  logger.info('Video attachment complete, updating state...');

                  setVideoPath(chapterFolder);
                  setVideoCurrentChapter({
                    bookContent,
                    filePath: bookFolder,
                    chapterNum: chapter.toString(),
                  });
                  setVideoContent(versesWithVideos);

                  setIsLoading(false);
                  setOpenSnackBar(true);
                  setSnackText(
                    t('dynamic-msg-load-ref-bible-snack', {
                      refName: `${projectName} (${dataSource})`,
                    }),
                  );
                  setNotify('success');
                  setDisplayScreen(false);
                }
              }),
            );

            if (_books.includes(bookId.toUpperCase()) === false) {
              setVideoContent();
              setDisplayScreen(true);
            }
          }
        } catch (error) {
          logger.error('Error in useEffect:', error);
          setIsLoading(false);
          setDisplayScreen(true);
        }
      });
    }
  }, [bookId, chapter]);

  return (
    <Editor callFrom="textTranslation" editor={editor}>
      {isLoading || (!videoContent && displyScreen) ? <EmptyScreen call="video" /> : null}
      {isLoading && !displyScreen ? <LoadingScreen /> : null}
      {videoContent && !isLoading ? (
        <VideoPlayer
          verse={verse}
          location={videoPath}
          content={videoContent}
          fontSize={editorFontSize}
          selectedFont={selectedFont}
          updateWave={updateVideoWave}
          onChangeVerse={onChangeVerse}
          onDeleteVideo={executeDeleteVideo}
          onDisjoinVerse={onDisjoinVerse}
          onJoinVerse={onJoinVerse}
          setOpenModal={setModel}
          chapter={chapter}
          bookId={bookId}
        />
      ) : null}
      <ConfirmationModal
        openModal={model.openModel}
        title={model.title}
        setOpenModal={() => modelClose()}
        confirmMessage={model.confirmMessage}
        buttonName={model.buttonName}
        closeModal={() => handleModalConfirm()}
      />
      <SnackBar
        openSnackBar={snackBar}
        snackText={snackText}
        setOpenSnackBar={setOpenSnackBar}
        setSnackText={setSnackText}
        error={notify}
      />
    </Editor>
  );
};

export default VideoEditor;

VideoEditor.propTypes = {
  editor: PropTypes.string,
};
