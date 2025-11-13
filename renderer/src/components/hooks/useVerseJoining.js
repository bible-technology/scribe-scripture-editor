import { useState, useCallback } from 'react';
import {
  getOriginalVerseText,
  deleteVerseVideos,
  hasVerseRecordings,
  validateVerseJoin,
  validateVerseDisjoin,
} from '@/core/editor/verseJoining';
import * as logger from '../../logger';

const parseVpMarkers = (verseText, verseNumber) => {
  try {
    // Pattern: \vp NUMBER\vp*
    const vpRegex = /\\vp\s+(\d+)\\vp\*/g;
    const segments = [];

    let lastIndex = 0;
    let match;
    let currentVerse = null;

    // eslint-disable-next-line no-cond-assign
    while ((match = vpRegex.exec(verseText)) !== null) {
      const markerVerse = parseInt(match[1], 10);
      const markerEnd = match.index + match[0].length;

      if (currentVerse !== null && lastIndex < match.index) {
        const text = verseText.substring(lastIndex, match.index).trim();
        if (text) {
          segments.push({ verse: currentVerse, text });
        }
      }

      currentVerse = markerVerse;
      lastIndex = markerEnd;
    }
    if (currentVerse !== null && lastIndex < verseText.length) {
      const text = verseText.substring(lastIndex).trim();
      if (text) {
        segments.push({ verse: currentVerse, text });
      }
    }

    if (segments.length === 0) {
      return null;
    }

    logger.info('Parsed verse segments from \\vp markers:', {
      verseNumber,
      segmentCount: segments.length,
      verses: segments.map((s) => s.verse),
    });

    return segments;
  } catch (err) {
    logger.error('Error parsing \\vp markers:', err);
    return null;
  }
};

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
        return allStructure[bookIdUpper][chapterKey].verses;
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

      const parts = joinedVerseNumber.split('-').map(Number);
      if (parts.length < 2) {
        logger.warn('Not enough parts to disjoin');
        return false;
      }

      const firstVerseNum = parts[0];
      const lastVerseNum = parts[parts.length - 1];

      const allVerseNumbers = Array.from(
        { length: lastVerseNum - firstVerseNum + 1 },
        (_, i) => firstVerseNum + i,
      );

      const remainingVerses = allVerseNumbers.slice(1);

      logger.info('Splitting verses:', {
        allVerseNumbers,
        firstVerseNum,
        remainingVerses,
        hasStoredSegments: !!verse.verseSegments,
        hasVpMarkers: verse.verseText.includes('\\vp'),
      });

      const updatedContent = [...videoContent];

      let segments = null;

      if (verse.verseSegments && verse.verseSegments.length > 0) {
        segments = verse.verseSegments;
        logger.info('Using stored verseSegments from JSON');
      } else if (verse.verseText.includes('\\vp')) {
        segments = parseVpMarkers(verse.verseText, joinedVerseNumber);
        if (segments) {
          logger.info('Parsed segments from \\vp USFM markers');
        }
      }

      let firstVerseText;
      if (segments) {
        const firstSegment = segments.find((seg) => seg.verse === firstVerseNum);
        firstVerseText = firstSegment ? firstSegment.text : '';
      } else {
        firstVerseText = getOriginalVerseText(
          originalBookContent,
          chapter.toString(),
          firstVerseNum,
        );
      }

      updatedContent[verseIndex] = {
        verseNumber: firstVerseNum.toString(),
        verseText: firstVerseText || '',
      };

      let newVerseEntry;

      if (remainingVerses.length === 1) {
        let remainingText;
        if (segments) {
          const remainingSegment = segments.find((seg) => seg.verse === remainingVerses[0]);
          remainingText = remainingSegment ? remainingSegment.text : '';
        } else {
          remainingText = getOriginalVerseText(
            originalBookContent,
            chapter.toString(),
            remainingVerses[0],
          );
        }

        newVerseEntry = {
          verseNumber: remainingVerses[0].toString(),
          verseText: remainingText || '',
        };
      } else {
        const remainingRange = `${remainingVerses[0]}-${remainingVerses[remainingVerses.length - 1]}`;

        let textArray;
        if (segments) {
          textArray = remainingVerses
            .map((verseNum) => {
              const segment = segments.find((seg) => seg.verse === verseNum);
              return segment ? segment.text : '';
            })
            .filter((text) => text);
        } else {
          textArray = remainingVerses
            .map((verseNum) => getOriginalVerseText(originalBookContent, chapter.toString(), verseNum))
            .filter((text) => text);
        }

        const remainingText = textArray.join(' ').trim();

        newVerseEntry = {
          verseNumber: remainingRange,
          verseText: remainingText || '',
          joinedVerses: remainingVerses,
        };
      }

      logger.info('New verse entry:', newVerseEntry);

      updatedContent.splice(verseIndex + 1, 0, newVerseEntry);

      setVideoContent(updatedContent);

      saveVerseStructure(updatedContent).then((saved) => {
        if (saved) {
          logger.info('Verse structure saved after disjoin');

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
      setSnackText(t('msg-verses-disjoined') || 'Verses separated successfully');
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
