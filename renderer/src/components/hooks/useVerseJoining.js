import { useState, useCallback } from 'react';
import {
  getOriginalVerseText,
  deleteVerseVideos,
  hasVerseRecordings,
  validateVerseJoin,
  validateVerseDisjoin,
} from '@/core/editor/verseJoining';
import * as logger from '../../logger';

export const useVerseJoining = ({
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
}) => {
  const [pendingOperation, setPendingOperation] = useState(null);

  const saveVerseStructure = useCallback(async (updatedContent) => {
    try {
      const fs = window.require('fs');
      const path = require('path');

      const bookFolder = path.dirname(videoPath);
      const bookIdUpper = bookId.toUpperCase();
      const bookIdLower = bookId.toLowerCase();
      const structureFile = path.join(bookFolder, `${bookIdLower}.json`);
      const chapterKey = chapter.toString();

      let allStructure = {};
      if (fs.existsSync(structureFile)) {
        try {
          const existingData = fs.readFileSync(structureFile, 'utf8');
          allStructure = JSON.parse(existingData);
        } catch (parseError) {
          logger.warn('Could not parse existing structure file, creating new:', parseError);
          allStructure = {};
        }
      }
      if (!allStructure[bookIdUpper]) {
        allStructure[bookIdUpper] = {};
      }

      allStructure[bookIdUpper][chapterKey] = {
        chapter: chapterKey,
        lastModified: new Date().toISOString(),
        verses: updatedContent
          .filter((verse) => verse.verseNumber && verse.verseText !== undefined)
          .map((verse) => {
            const verseData = {
              verseNumber: verse.verseNumber,
              verseText: verse.verseText,
              joinedVerses: verse.joinedVerses || null,
              isPreCombined: verse.isPreCombined || false,
            };

            if (verse.joinedVerses && verse.joinedVerses.length > 0) {
              verseData.verseSegments = verse.joinedVerses.map((vNum) => {
                const text = getOriginalVerseText(
                  originalBookContent,
                  chapter.toString(),
                  vNum,
                );
                return {
                  verse: vNum,
                  text: text || '',
                };
              });
              logger.info(`Stored ${verse.joinedVerses.length} verse segments for ${verse.verseNumber}`);
            }

            return verseData;
          }),
      };

      const dir = path.dirname(structureFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(structureFile, JSON.stringify(allStructure, null, 2), 'utf8');
      logger.info('Verse structure saved successfully:', structureFile);

      return true;
    } catch (err) {
      logger.error('Error saving verse structure:', err);
      return false;
    }
  }, [videoPath, chapter, bookId, originalBookContent]);

  const loadVerseStructure = useCallback(async () => {
    try {
      const fs = window.require('fs');
      const path = require('path');

      const bookFolder = path.dirname(videoPath);
      const bookIdUpper = bookId.toUpperCase();
      const bookIdLower = bookId.toLowerCase();
      const structureFile = path.join(bookFolder, `${bookIdLower}.json`);
      const chapterKey = chapter.toString();

      if (!fs.existsSync(structureFile)) {
        logger.info(`No ${bookId}.json found`);
        return null;
      }

      const data = fs.readFileSync(structureFile, 'utf8');
      const allStructure = JSON.parse(data);

      if (allStructure[bookIdUpper] && allStructure[bookIdUpper][chapterKey]) {
        logger.info(`Loaded verse structure for ${bookIdUpper} chapter ${chapterKey}`);

        const verses = allStructure[bookIdUpper][chapterKey].verses.map((verse) => {
          const isRangeVerse = verse.verseNumber.includes('-');

          const hasVerseSegments = verse.verseSegments && Array.isArray(verse.verseSegments) && verse.verseSegments.length > 0;

          const isPreCombined = verse.isPreCombined === true
            || (isRangeVerse && !hasVerseSegments);

          if (isPreCombined && !verse.isPreCombined) {
            logger.warn(`Detected pre-combined verse ${verse.verseNumber} missing isPreCombined flag - correcting`);
          }

          if (isPreCombined) {
            logger.info(`Verse ${verse.verseNumber} is pre-combined (locked) - no verseSegments present`);

            let joinedVerses = verse.joinedVerses;
            if (!joinedVerses || joinedVerses === null) {
              const parts = verse.verseNumber.split('-').map(Number);
              joinedVerses = parts.length === 2
                ? Array.from({ length: parts[1] - parts[0] + 1 }, (_, i) => parts[0] + i)
                : null;
            }

            return {
              ...verse,
              isPreCombined: true,
              joinedVerses,
            };
          }

          if (isRangeVerse && hasVerseSegments) {
            logger.info(`✓ Verse ${verse.verseNumber} is app-joined - has verseSegments`);
          }

          return {
            ...verse,
            isPreCombined: false,
          };
        });

        return verses;
      }

      logger.info(`No structure for ${bookId} chapter ${chapterKey}`);
      return null;
    } catch (err) {
      logger.error('Error loading verse structure:', err);
      return null;
    }
  }, [videoPath, chapter, bookId]);

  const executeJoinVerse = useCallback((currentVerseNumber, currentVerseIndex, previousVerseIndex) => {
    try {
      const currentVerse = videoContent[currentVerseIndex];
      const previousVerse = videoContent[previousVerseIndex];
      const currentVerseNum = parseInt(currentVerse.verseNumber.split('-')[0], 10);
      const previousVerseNum = previousVerse.verseNumber;

      logger.info('Attempting to join verses:', {
        current: currentVerseNumber,
        previous: previousVerseNum,
        previousIsPreCombined: previousVerse.isPreCombined,
        currentIsPreCombined: currentVerse.isPreCombined,
      });

      if (previousVerse.isPreCombined) {
        logger.warn('BLOCKED: Cannot join to pre-combined verse from USFM');
        setNotify('failure');
        setSnackText(
          t('msg-cannot-join-to-precombined')
          || `Cannot join to verse ${previousVerseNum} - it is combined in the original USFM and must remain as a single unit`,
        );
        setOpenSnackBar(true);
        return false;
      }

      if (currentVerse.isPreCombined) {
        logger.warn('BLOCKED: Cannot join pre-combined verse from USFM');
        setNotify('failure');
        setSnackText(
          t('msg-cannot-join-precombined')
          || `Cannot join verse ${currentVerseNumber} - it is combined in the original USFM and must remain as a single unit`,
        );
        setOpenSnackBar(true);
        return false;
      }

      logger.info('Join allowed - proceeding with join operation');

      let newVerseNumber;
      let joinedVerses;

      if (previousVerseNum.includes('-')) {
        const parts = previousVerseNum.split('-').map(Number);
        const start = parts[0];
        const end = Math.max(...parts);

        newVerseNumber = `${start}-${currentVerseNum}`;

        joinedVerses = previousVerse.joinedVerses
          ? [...previousVerse.joinedVerses, currentVerseNum]
          : Array.from({ length: end - start + 1 }, (_, i) => start + i).concat(currentVerseNum);
      } else {
        const prevNum = parseInt(previousVerseNum, 10);
        newVerseNumber = `${prevNum}-${currentVerseNum}`;
        joinedVerses = [prevNum, currentVerseNum];
      }

      const textArray = joinedVerses
        .map((num) => getOriginalVerseText(originalBookContent, chapter.toString(), num))
        .filter(Boolean);

      const combinedText = textArray.join(' ').trim();

      const updatedContent = [...videoContent];
      updatedContent[previousVerseIndex] = {
        verseNumber: newVerseNumber,
        verseText: combinedText,
        joinedVerses,
        isPreCombined: false,
      };
      updatedContent.splice(currentVerseIndex, 1);

      setVideoContent(updatedContent);

      saveVerseStructure(updatedContent).then((saved) => {
        if (saved) {
          try {
            if (hasVerseRecordings(currentVerse)) {
              deleteVerseVideos(currentVerse, videoPath);
              logger.info('Deleted current verse videos after join');
            }
            if (hasVerseRecordings(previousVerse)) {
              deleteVerseVideos(previousVerse, videoPath);
              logger.info('Deleted previous verse videos after join');
            }
          } catch (deleteErr) {
            logger.error('Error deleting videos after join:', deleteErr);
          }
        } else {
          logger.error('Failed to save structure, videos not deleted');
        }
      });

      setNotify('success');
      setSnackText(t('msg-verses-joined') || `Verses joined successfully: ${newVerseNumber}`);
      setOpenSnackBar(true);

      return true;
    } catch (err) {
      logger.error('Error joining verses:', err);
      setNotify('failure');
      setSnackText(t('msg-join-failed') || 'Failed to join verses');
      setOpenSnackBar(true);
      return false;
    }
  }, [videoContent, setVideoContent, originalBookContent, chapter, videoPath, t, setNotify, setSnackText, setOpenSnackBar, saveVerseStructure]);

  const executeDisjoinVerse = useCallback((joinedVerseNumber, verseIndex) => {
    try {
      const verse = videoContent[verseIndex];

      if (verse.isPreCombined) {
        logger.warn('BLOCKED: Cannot disjoin pre-combined verse from USFM');
        setNotify('failure');
        setSnackText(
          t('msg-cannot-disjoin-precombined')
        || `Cannot separate verse ${joinedVerseNumber} - it was combined in the original USFM and must remain as a single unit`,
        );
        setOpenSnackBar(true);
        return false;
      }

      const parts = joinedVerseNumber.split('-').map(Number);
      if (parts.length < 2) {
        logger.warn('Not enough parts to disjoin');
        return false;
      }

      const firstVerseNum = parts[0];
      const lastVerseNum = parts[parts.length - 1];

      logger.info('Attempting incremental split:', {
        original: joinedVerseNumber,
        firstVerse: firstVerseNum,
        remaining: lastVerseNum > firstVerseNum + 1 ? `${firstVerseNum + 1}-${lastVerseNum}` : `${lastVerseNum}`,
      });

      const firstVerseText = getOriginalVerseText(
        originalBookContent,
        chapter.toString(),
        firstVerseNum,
      );

      if (!firstVerseText || firstVerseText.trim() === '') {
        logger.error('Cannot disjoin - first verse not found in original USFM:', firstVerseNum);
        setNotify('failure');
        setSnackText(
          t('msg-cannot-disjoin-missing-verses')
        || `Cannot separate verses - verse ${firstVerseNum} not found in original text`,
        );
        setOpenSnackBar(true);
        return false;
      }

      const updatedContent = [...videoContent];

      const firstVerseEntry = {
        verseNumber: firstVerseNum.toString(),
        verseText: firstVerseText,
        isPreCombined: false,
      };

      let remainingVerseEntry;

      if (lastVerseNum === firstVerseNum + 1) {
        const lastVerseText = getOriginalVerseText(
          originalBookContent,
          chapter.toString(),
          lastVerseNum,
        );

        if (!lastVerseText || lastVerseText.trim() === '') {
          logger.error('Cannot disjoin - last verse not found in original USFM:', lastVerseNum);
          setNotify('failure');
          setSnackText(
            t('msg-cannot-disjoin-missing-verses')
          || `Cannot separate verses - verse ${lastVerseNum} not found in original text`,
          );
          setOpenSnackBar(true);
          return false;
        }

        remainingVerseEntry = {
          verseNumber: lastVerseNum.toString(),
          verseText: lastVerseText,
          isPreCombined: false,
        };

        logger.info('Split into two single verses:', {
          first: firstVerseEntry.verseNumber,
          second: remainingVerseEntry.verseNumber,
        });
      } else {
        const remainingStart = firstVerseNum + 1;
        const remainingVerseNumber = `${remainingStart}-${lastVerseNum}`;

        const remainingVerses = Array.from(
          { length: lastVerseNum - remainingStart + 1 },
          (_, i) => remainingStart + i,
        );

        const remainingJoinedVerses = remainingVerses;

        let segments = null;

        if (verse.verseSegments && verse.verseSegments.length > 0) {
          segments = verse.verseSegments.filter((seg) => seg.verse !== firstVerseNum);
          logger.info('Using stored verseSegments for remaining verses:', segments);
        } else if (verse.joinedVerses && verse.joinedVerses.length > 0) {
          segments = verse.joinedVerses
            .filter((vNum) => vNum !== firstVerseNum)
            .map((vNum) => {
              const text = getOriginalVerseText(originalBookContent, chapter.toString(), vNum);
              return {
                verse: vNum,
                text: text || '',
              };
            });
          logger.info('Rebuilt verseSegments for remaining verses:', segments);
        } else {
          segments = remainingVerses.map((vNum) => ({
            verse: vNum,
            text: getOriginalVerseText(originalBookContent, chapter.toString(), vNum) || '',
          }));
        }

        const remainingTextArray = segments.map((seg) => seg.text).filter(Boolean);
        const remainingCombinedText = remainingTextArray.join(' ').trim();

        const missingVerses = [];
        remainingVerses.forEach((verseNum) => {
          const text = getOriginalVerseText(originalBookContent, chapter.toString(), verseNum);
          if (!text || text.trim() === '') {
            missingVerses.push(verseNum);
          }
        });

        if (missingVerses.length > 0) {
          logger.error('Cannot disjoin - missing verses in original USFM:', missingVerses);
          setNotify('failure');
          setSnackText(
            t('msg-cannot-disjoin-missing-verses')
          || `Cannot separate verses - verse(s) ${missingVerses.join(', ')} not found in original text`,
          );
          setOpenSnackBar(true);
          return false;
        }

        remainingVerseEntry = {
          verseNumber: remainingVerseNumber,
          verseText: remainingCombinedText,
          joinedVerses: remainingJoinedVerses,
          verseSegments: segments,
          isPreCombined: false,
        };

        logger.info('Split into single verse and range:', {
          first: firstVerseEntry.verseNumber,
          remaining: remainingVerseEntry.verseNumber,
          remainingJoinedVerses,
        });
      }

      updatedContent.splice(verseIndex, 1, firstVerseEntry, remainingVerseEntry);

      logger.info('Updated content after incremental disjoin:', {
        originalIndex: verseIndex,
        newVerses: [firstVerseEntry.verseNumber, remainingVerseEntry.verseNumber],
      });

      setVideoContent(updatedContent);

      saveVerseStructure(updatedContent).then((saved) => {
        if (saved) {
          logger.info('Verse structure saved after incremental disjoin');

          try {
            if (hasVerseRecordings(verse)) {
              deleteVerseVideos(verse, videoPath);
              logger.info('Deleted joined verse videos after disjoin');
            }
          } catch (deleteErr) {
            logger.error('Error deleting videos after disjoin:', deleteErr);
          }
        } else {
          logger.error('Failed to save verse structure after disjoin, videos not deleted');
        }
      });

      setNotify('success');
      setSnackText(
        t('msg-verses-disjoined')
      || `Verse ${firstVerseNum} separated from ${remainingVerseEntry.verseNumber}`,
      );
      setOpenSnackBar(true);

      return true;
    } catch (err) {
      setNotify('failure');
      setSnackText(t('msg-disjoin-failed') || 'Failed to separate verses');
      logger.error('Error disjoining verses:', err);
      setOpenSnackBar(true);
      return false;
    }
  }, [videoContent, setVideoContent, originalBookContent, chapter, videoPath, t, setNotify, setSnackText, setOpenSnackBar, saveVerseStructure]);
  const handleJoinVerse = useCallback((currentVerseNumber) => {
    const validation = validateVerseJoin(videoContent, currentVerseNumber);

    if (!validation.valid) {
      setNotify('failure');
      setSnackText(t(`msg-${validation.message.toLowerCase().replace(/\s/g, '-')}`) || validation.message);
      setOpenSnackBar(true);
      return null;
    }

    const { currentVerseIndex, previousVerseIndex } = validation;
    const currentVerse = videoContent[currentVerseIndex];
    const previousVerse = videoContent[previousVerseIndex];
    const currentHasVideo = hasVerseRecordings(currentVerse);
    const previousHasVideo = hasVerseRecordings(previousVerse);

    if (currentHasVideo || previousHasVideo) {
      const operation = {
        type: 'join',
        data: {
          currentVerseNumber,
          currentVerseIndex,
          previousVerseIndex,
        },
      };
      setPendingOperation(operation);
      return operation;
    }

    executeJoinVerse(currentVerseNumber, currentVerseIndex, previousVerseIndex);
    return null;
  }, [videoContent, t, setNotify, setSnackText, setOpenSnackBar, executeJoinVerse]);

  const handleDisjoinVerse = useCallback((joinedVerseNumber) => {
    const validation = validateVerseDisjoin(videoContent, joinedVerseNumber);

    if (!validation.valid) {
      setNotify('failure');
      setSnackText(t(`msg-${validation.message.toLowerCase().replace(/\s/g, '-')}`) || validation.message);
      setOpenSnackBar(true);
      return null;
    }

    const { verseIndex } = validation;
    const verse = videoContent[verseIndex];
    const hasVideo = hasVerseRecordings(verse);

    if (hasVideo) {
      const operation = {
        type: 'disjoin',
        data: {
          joinedVerseNumber,
          verseIndex,
        },
      };
      setPendingOperation(operation);
      return operation;
    }

    executeDisjoinVerse(joinedVerseNumber, verseIndex);
    return null;
  }, [videoContent, t, setNotify, setSnackText, setOpenSnackBar, executeDisjoinVerse]);

  const executePendingOperation = useCallback(() => {
    if (!pendingOperation) { return false; }

    let success = false;
    if (pendingOperation.type === 'join') {
      success = executeJoinVerse(
        pendingOperation.data.currentVerseNumber,
        pendingOperation.data.currentVerseIndex,
        pendingOperation.data.previousVerseIndex,
      );
    } else if (pendingOperation.type === 'disjoin') {
      success = executeDisjoinVerse(
        pendingOperation.data.joinedVerseNumber,
        pendingOperation.data.verseIndex,
      );
    }

    setPendingOperation(null);
    return success;
  }, [pendingOperation, executeJoinVerse, executeDisjoinVerse]);

  const cancelPendingOperation = useCallback(() => {
    setPendingOperation(null);
  }, []);

  return {
    handleJoinVerse,
    handleDisjoinVerse,
    executePendingOperation,
    cancelPendingOperation,
    pendingOperation,
    loadVerseStructure,
    saveVerseStructure,
  };
};
