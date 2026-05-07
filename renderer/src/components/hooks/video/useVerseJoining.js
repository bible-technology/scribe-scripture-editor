import { useState, useCallback } from 'react';
import {
  getOriginalVerseText,
  deleteVerseVideos,
  hasVerseRecordings,
  validateVerseJoin,
  validateVerseDisjoin,
} from '@/core/editor/verseJoining';
import * as logger from '../../../logger';

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

            if (Array.isArray(verse.comments) && verse.comments.length > 0) {
              verseData.comments = verse.comments;
            }

            if (verse.joinedVerses && verse.joinedVerses.length > 0) {
              verseData.verseSegments = verse.joinedVerses.map((vNum) => {
                const freshText = getOriginalVerseText(
                  originalBookContent,
                  chapter.toString(),
                  vNum,
                );
                const existingSegment = verse.verseSegments?.find((s) => Number(s.verse) === vNum);

                return {
                  verse: vNum,
                  text: freshText || existingSegment?.text || '',
                };
              });

              if (!verse.verseText || verse.verseText.trim() === '') {
                const combinedText = verseData.verseSegments
                  .map((seg) => seg.text)
                  .filter(Boolean)
                  .join(' ')
                  .trim();
                verseData.verseText = combinedText;
              }

              logger.debug(`Stored ${verse.joinedVerses.length} verse segments for ${verse.verseNumber}`);
            }

            return verseData;
          }),
      };

      const dir = path.dirname(structureFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(structureFile, JSON.stringify(allStructure, null, 2), 'utf8');
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
        logger.debug(`No ${bookId}.json found`);
        return null;
      }

      const data = fs.readFileSync(structureFile, 'utf8');
      const allStructure = JSON.parse(data);

      if (allStructure[bookIdUpper] && allStructure[bookIdUpper][chapterKey]) {
        logger.debug(`Loaded verse structure for ${bookIdUpper} chapter ${chapterKey}`);

        const verses = allStructure[bookIdUpper][chapterKey].verses.map((verse) => {
          const isRangeVerse = verse.verseNumber.includes('-');

          const hasVerseSegments = verse.verseSegments && Array.isArray(verse.verseSegments) && verse.verseSegments.length > 0;

          const isPreCombined = verse.isPreCombined === true
            || (isRangeVerse && !hasVerseSegments);

          if (isPreCombined && !verse.isPreCombined) {
            logger.warn(`Detected pre-combined verse ${verse.verseNumber} missing isPreCombined flag - correcting`);
          }

          if (isPreCombined) {
            logger.debug(`Verse ${verse.verseNumber} is pre-combined (locked) - no verseSegments present`);

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
            logger.debug(`Verse ${verse.verseNumber} is app-joined - has verseSegments`);
          }

          return {
            ...verse,
            isPreCombined: false,
          };
        });

        return verses;
      }

      logger.debug(`No structure for ${bookId} chapter ${chapterKey}`);
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

      logger.debug('Attempting to join verses:', {
        current: currentVerseNumber,
        previous: previousVerseNum,
        previousIsPreCombined: previousVerse.isPreCombined,
        currentIsPreCombined: currentVerse.isPreCombined,
      });

      if (previousVerse.isPreCombined) {
        logger.warn('BLOCKED: Cannot join to pre-combined verse from USFM');
        setNotify('failure');
        setSnackText(t('msg-cannot-join-to-precombined'));
        setOpenSnackBar(true);
        return false;
      }

      if (currentVerse.isPreCombined) {
        logger.warn('BLOCKED: Cannot join pre-combined verse from USFM');
        setNotify('failure');
        setSnackText(t('msg-cannot-join-precombined'));
        setOpenSnackBar(true);
        return false;
      }
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
        comments: [
          ...(previousVerse.comments || []),
          ...(currentVerse.comments || []),
        ],
      };
      updatedContent.splice(currentVerseIndex, 1);

      setVideoContent(updatedContent);

      saveVerseStructure(updatedContent).then((saved) => {
        if (saved) {
          try {
            if (hasVerseRecordings(chapter, currentVerse.verseNumber, videoPath)) {
              deleteVerseVideos(
                chapter,
                currentVerse.verseNumber,
                videoPath,
              );
              logger.debug('Deleted current verse videos after join');
            }
            if (hasVerseRecordings(chapter, previousVerse.verseNumber, videoPath)) {
              deleteVerseVideos(
                chapter,
                previousVerse.verseNumber,
                videoPath,
              );
              logger.debug('Deleted previous verse videos after join');
            }
          } catch (deleteErr) {
            logger.error('Error deleting videos after join:', deleteErr);
          }
        } else {
          logger.error('Failed to save structure, videos not deleted');
        }
      });

      setNotify('success');
      setSnackText(t('msg-verses-joined'));
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

      const hasUSFM = !!originalBookContent
        && Object.keys(originalBookContent).length > 0
        && originalBookContent.some((ch) => ch.contents && ch.contents.some((v) => v.verseText && v.verseText.trim() !== ''));
      if (!verse) {
        logger.error('executeDisjoinVerse: verse not found at index', verseIndex);
        setNotify('failure');
        setSnackText(t('msg-disjoin-failed') || 'Failed to separate verses');
        setOpenSnackBar(true);
        return false;
      }

      if (verse.isPreCombined) {
        logger.warn('BLOCKED: Cannot disjoin pre-combined verse from USFM');
        setNotify('failure');
        setSnackText(t('msg-cannot-disjoin-precombined'));
        setOpenSnackBar(true);
        return false;
      }

      const parts = joinedVerseNumber.split('-').map((p) => Number(p));
      if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[parts.length - 1])) {
        logger.warn('executeDisjoinVerse: invalid joinedVerseNumber', joinedVerseNumber);
        return false;
      }

      const start = parts[0];
      const end = parts[parts.length - 1];

      const firstVerseNum = start;
      const remainingStart = start + 1;

      let remainingLabel = 'none';

      if (remainingStart <= end) {
        if (remainingStart === end) {
          remainingLabel = `${end}`;
        } else {
          remainingLabel = `${remainingStart}-${end}`;
        }
      }

      logger.debug('Attempting incremental split:', {
        original: joinedVerseNumber,
        firstVerse: firstVerseNum,
        remaining: remainingLabel,
      });

      let firstVerseText = '';
      if (hasUSFM) {
        firstVerseText = getOriginalVerseText(originalBookContent, chapter.toString(), firstVerseNum) || '';
        if (!firstVerseText || firstVerseText.trim() === '') {
          logger.error('Cannot disjoin - first verse not found in original USFM:', firstVerseNum);
          setNotify('failure');
          setSnackText(t('msg-cannot-disjoin-missing-verses'));
          setOpenSnackBar(true);
          return false;
        }
      } else {
        firstVerseText = verse.verseSegments?.find((s) => Number(s.verse) === firstVerseNum)?.text || '';
        logger.debug('No USFM available, using stored segments for first verse');
      }

      if (remainingStart > end) {
        logger.warn('executeDisjoinVerse: no remaining verses after split', joinedVerseNumber);
        return false;
      }

      const remainingVerses = [];
      for (let v = remainingStart; v <= end; v += 1) {
        remainingVerses.push(v);
      }

      if (hasUSFM) {
        const missing = remainingVerses.filter((vnum) => {
          const txt = getOriginalVerseText(originalBookContent, chapter.toString(), vnum);
          return !txt || txt.trim() === '';
        });

        if (missing.length > 0) {
          logger.error('Cannot disjoin - missing verses in original USFM for remaining range:', missing);
          setNotify('failure');
          setSnackText(t('msg-cannot-disjoin-missing-verses'));
          setOpenSnackBar(true);
          return false;
        }
      } else {
        logger.debug('No USFM available, skipping validation for remaining verses');
      }

      const firstVerseComments = (verse.comments || []).filter(
        (comment) => String(comment.verseNumber) === String(firstVerseNum),
      );

      const remainingVerseComments = (verse.comments || []).filter(
        (comment) => String(comment.verseNumber) !== String(firstVerseNum),
      );

      const firstVerseEntry = {
        verseNumber: firstVerseNum.toString(),
        verseText: firstVerseText || '',
        isPreCombined: false,
        comments: firstVerseComments,
      };

      let remainingVerseEntry;
      if (remainingVerses.length === 1) {
        const singleNum = remainingVerses[0];
        const singleText = hasUSFM
          ? (getOriginalVerseText(originalBookContent, chapter.toString(), singleNum) || '')
          : (verse.verseSegments?.find((s) => Number(s.verse) === singleNum)?.text || '');
        remainingVerseEntry = {
          verseNumber: singleNum.toString(),
          verseText: singleText,
          isPreCombined: false,
          comments: remainingVerseComments,
        };

        logger.debug('Split into two single verses:', {
          first: firstVerseEntry.verseNumber,
          second: remainingVerseEntry.verseNumber,
        });
      } else {
        let segments = null;

        if (Array.isArray(verse.verseSegments) && verse.verseSegments.length > 0) {
          segments = remainingVerses.map((vnum) => {
            if (hasUSFM) {
              const freshText = getOriginalVerseText(originalBookContent, chapter.toString(), vnum);
              if (freshText && freshText.trim() !== '') {
                return { verse: vnum, text: freshText };
              }
            }
            const storedSegment = verse.verseSegments.find((s) => Number(s.verse) === vnum);
            return {
              verse: vnum,
              text: storedSegment?.text || '',
            };
          });
          logger.debug('Rebuilt verseSegments for remaining verses (USFM + stored)');
        } else if (Array.isArray(verse.joinedVerses) && verse.joinedVerses.length > 0) {
          segments = verse.joinedVerses
            .filter((vnum) => Number(vnum) !== firstVerseNum)
            .map((vnum) => ({
              verse: vnum,
              text: hasUSFM
                ? (getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '')
                : '',
            }));
          logger.debug('Rebuilt verseSegments for remaining verses from joinedVerses');
        } else {
          segments = remainingVerses.map((vnum) => ({
            verse: vnum,
            text: hasUSFM
              ? (getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '')
              : '',
          }));
          logger.debug('Built verseSegments for remaining verses from original text');
        }

        const remainingTextArray = segments.map((seg) => (seg.text || '').trim()).filter(Boolean);
        const remainingCombinedText = remainingTextArray.join(' ').trim();

        remainingVerseEntry = {
          verseNumber: `${remainingVerses[0]}-${remainingVerses[remainingVerses.length - 1]}`,
          verseText: remainingCombinedText,
          joinedVerses: remainingVerses,
          verseSegments: segments,
          isPreCombined: false,
          comments: remainingVerseComments,
        };

        logger.debug('Split into single verse and range:', {
          first: firstVerseEntry.verseNumber,
          remaining: remainingVerseEntry.verseNumber,
        });
      }

      const updatedContent = [...videoContent];
      updatedContent.splice(verseIndex, 1, firstVerseEntry, remainingVerseEntry);

      logger.debug('Updated content after incremental disjoin:', {
        originalIndex: verseIndex,
        newVerses: [firstVerseEntry.verseNumber, remainingVerseEntry.verseNumber],
      });

      setVideoContent(updatedContent);

      saveVerseStructure(updatedContent).then((saved) => {
        if (saved) {
          logger.debug('Verse structure saved after incremental disjoin');

          try {
            if (hasVerseRecordings(chapter, verse.verseNumber, videoPath)) {
              deleteVerseVideos(chapter, verse.verseNumber, videoPath);
              logger.debug('Deleted joined verse videos after disjoin');
            }
          } catch (deleteErr) {
            logger.error('Error deleting videos after disjoin:', deleteErr);
          }
        } else {
          logger.error('Failed to save verse structure after disjoin, videos not deleted');
        }
      });

      setNotify('success');
      setSnackText(t('msg-verses-disjoined'));
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
    const currentHasVideo = hasVerseRecordings(
      chapter,
      currentVerse.verseNumber,
      videoPath,
    );

    const previousHasVideo = hasVerseRecordings(
      chapter,
      previousVerse.verseNumber,
      videoPath,
    );

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
    const hasVideo = hasVerseRecordings(
      chapter,
      verse.verseNumber,
      videoPath,
    );

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
