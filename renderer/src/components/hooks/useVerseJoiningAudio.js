import { useCallback } from 'react';
import {
  mergeDefaultAudios,
  splitMergedAudio,
  deleteAllAudioForVerse,
  hasAnyAudioForVerse,
  getDefaultAudioForVerse,
  mergeExistingAudioFiles,
} from '@/components/AudioRecorder/core/audioMergeUtils';
import * as logger from '../../logger';

function getOriginalVerseText(bookContent, chapter, verseNumber) {
  try {
    const chapterData = bookContent.find(
      (ch) => ch.chapterNumber === chapter.toString(),
    );

    if (!chapterData) {
      logger.warn('Chapter not found in bookContent:', chapter);
      return '';
    }

    const verseData = chapterData.contents.find(
      (v) => v.verseNumber === verseNumber.toString(),
    );

    return verseData ? verseData.verseText : '';
  } catch (error) {
    logger.error('Error getting original verse text:', error);
    return '';
  }
}

function validateVerseJoin(audioContent, currentVerseNumber) {
  const currentVerseIndex = audioContent.findIndex(
    (item) => item.verseNumber === currentVerseNumber,
  );

  if (currentVerseIndex === -1) {
    return {
      valid: false,
      message: 'Verse not found',
    };
  }

  if (currentVerseIndex === 0) {
    return {
      valid: false,
      message: 'Cannot join the first verse',
    };
  }

  return {
    valid: true,
    currentVerseIndex,
    previousVerseIndex: currentVerseIndex - 1,
  };
}

function validateVerseDisjoin(audioContent, joinedVerseNumber) {
  const verseIndex = audioContent.findIndex(
    (item) => item.verseNumber === joinedVerseNumber,
  );

  if (verseIndex === -1) {
    return {
      valid: false,
      message: 'Verse not found',
    };
  }

  if (!joinedVerseNumber.includes('-')) {
    return {
      valid: false,
      message: 'This verse is not joined',
    };
  }

  return {
    valid: true,
    verseIndex,
  };
}

export const useVerseJoiningAudio = ({
  audioContent,
  setAudioContent,
  originalBookContent,
  chapter,
  audioPath,
  bookId,
  t,
  setNotify,
  setSnackText,
  setOpenSnackBar,
}) => {
  const saveVerseStructure = useCallback(async (updatedContent) => {
    try {
      const fs = window.require('fs');
      const path = require('path');

      const bookFolder = path.dirname(audioPath);
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
          logger.warn('Could not parse existing structure file:', parseError);
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
              verseSegments: verse.verseSegments || null,
            };

            if (verse.take1) {
              verseData.take1 = verse.take1;
            }
            if (verse.default) {
              verseData.default = verse.default;
            }
            if (verse.timestamps) {
              verseData.timestamps = verse.timestamps;
            }

            return verseData;
          }),
      };

      const dir = path.dirname(structureFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(structureFile, JSON.stringify(allStructure, null, 2), 'utf8');
      logger.debug('Verse structure saved successfully');
      return true;
    } catch (err) {
      logger.error('Error saving verse structure:', err);
      return false;
    }
  }, [audioPath, chapter, bookId]);

  const executeJoinVerse = useCallback(async (currentVerseNumber, currentVerseIndex, previousVerseIndex) => {
    try {
      const path = require('path');
      const currentVerse = audioContent[currentVerseIndex];
      const previousVerse = audioContent[previousVerseIndex];
      const currentVerseNum = parseInt(currentVerse.verseNumber.split('-')[0], 10);
      const previousVerseNum = previousVerse.verseNumber;

      logger.debug('Joining verses with audio:', {
        current: currentVerseNumber,
        previous: previousVerseNum,
      });

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

      let mergedAudio = null;
      let hasAudio = false;

      const previousHasAudio = previousVerse.take1 || hasAnyAudioForVerse(chapter, previousVerseNum, audioPath);
      const currentHasAudio = currentVerse.take1 || hasAnyAudioForVerse(chapter, currentVerseNumber, audioPath);

      hasAudio = previousHasAudio || currentHasAudio;

      if (hasAudio) {
        logger.debug('Audio detected, attempting merge...');

        const audioFilesToMerge = [];

        if (previousVerse.take1) {
          audioFilesToMerge.push({
            path: path.join(audioPath, previousVerse.take1),
            verseNumber: previousVerseNum,
          });
        }

        if (currentVerse.take1) {
          audioFilesToMerge.push({
            path: path.join(audioPath, currentVerse.take1),
            verseNumber: currentVerseNumber,
          });
        }

        if (audioFilesToMerge.length > 0) {
          logger.debug('Files to merge:', audioFilesToMerge);

          const mergeResult = await mergeExistingAudioFiles(
            audioFilesToMerge,
            chapter,
            audioPath,
            newVerseNumber,
            joinedVerses,
          );

          logger.debug('Merge result:', mergeResult);

          if (mergeResult.success) {
            mergedAudio = {
              filename: mergeResult.filename,
              timestamps: mergeResult.timestamps,
            };
            logger.debug('Audio merged successfully:', mergedAudio);

            deleteAllAudioForVerse(chapter, previousVerseNum, audioPath);
            deleteAllAudioForVerse(chapter, currentVerseNumber, audioPath);

            logger.debug('Original audio files deleted');
          } else if (mergeResult.hasAudio === false) {
            logger.debug('No audio files to merge');
          } else {
            logger.error('Audio merge failed:', mergeResult.error);
            setNotify('failure');
            setSnackText(t('msg-audio-merge-failed') || 'Audio merge failed. Operation cancelled.');
            setOpenSnackBar(true);
            return false;
          }
        }
      }

      const updatedVerseEntry = {
        verseNumber: newVerseNumber,
        verseText: combinedText,
        joinedVerses,
        verseSegments: joinedVerses.map((vnum) => ({
          verse: vnum,
          text: getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '',
        })),
      };

      if (mergedAudio) {
        updatedVerseEntry.take1 = mergedAudio.filename;
        updatedVerseEntry.default = 'take1';
        updatedVerseEntry.timestamps = mergedAudio.timestamps;
      }

      const updatedContent = [...audioContent];
      updatedContent[previousVerseIndex] = updatedVerseEntry;
      updatedContent.splice(currentVerseIndex, 1);

      setAudioContent(updatedContent);
      await saveVerseStructure(updatedContent);

      setNotify('success');
      setSnackText(t('msg-verses-joined') || 'Verses joined successfully');
      setOpenSnackBar(true);

      return true;
    } catch (err) {
      logger.error('Error joining verses:', err);
      setNotify('failure');
      setSnackText(t('msg-join-failed') || 'Failed to join verses');
      setOpenSnackBar(true);
      return false;
    }
  }, [audioContent, setAudioContent, originalBookContent, chapter, audioPath, t, setNotify, setSnackText, setOpenSnackBar, saveVerseStructure]);

  const executeDisjoinVerse = useCallback(async (joinedVerseNumber, verseIndex) => {
    try {
      const verse = audioContent[verseIndex];

      if (!verse) {
        logger.error('Verse not found at index', verseIndex);
        setNotify('failure');
        setSnackText(t('msg-disjoin-failed') || 'Failed to separate verses');
        setOpenSnackBar(true);
        return false;
      }

      const parts = joinedVerseNumber.split('-').map(Number);
      if (parts.length < 2) {
        logger.warn('Invalid joined verse number:', joinedVerseNumber);
        return false;
      }

      const start = parts[0];
      const end = parts[parts.length - 1];
      const firstVerseNum = start;
      const remainingStart = start + 1;

      const firstVerseText = getOriginalVerseText(
        originalBookContent,
        chapter.toString(),
        firstVerseNum,
      ) || '';

      let canSplitAudio = false;
      const mergedAudioInfo = getDefaultAudioForVerse(chapter, joinedVerseNumber, audioPath);

      if (mergedAudioInfo.exists && verse.timestamps && Array.isArray(verse.timestamps)) {
        canSplitAudio = true;
        logger.debug('Can split audio - timestamps available');
      } else if (mergedAudioInfo.exists && (!verse.timestamps || !Array.isArray(verse.timestamps))) {
        logger.warn('Audio exists but no timestamps for splitting');

        setNotify('warning');
        setSnackText(
          t('msg-cannot-split-audio-no-timestamps')
          || 'Cannot split audio - no timestamp data. Audio will be deleted.',
        );
        setOpenSnackBar(true);

        deleteAllAudioForVerse(chapter, joinedVerseNumber, audioPath);
        logger.debug('Merged audio deleted (no timestamps)');
      }

      if (canSplitAudio) {
        logger.debug('Splitting audio with timestamps...');

        const splitResult = await splitMergedAudio(
          mergedAudioInfo.path,
          verse.timestamps,
          chapter,
          audioPath,
        );

        if (splitResult.success) {
          logger.debug('Audio split successfully:', splitResult.files);

          deleteAllAudioForVerse(chapter, joinedVerseNumber, audioPath);
        } else {
          logger.error('Audio split failed:', splitResult.error);
          setNotify('failure');
          setSnackText(t('msg-audio-split-failed') || 'Audio split failed. Operation cancelled.');
          setOpenSnackBar(true);
          return false;
        }
      }

      const firstVerseEntry = {
        verseNumber: firstVerseNum.toString(),
        verseText: firstVerseText,
      };

      if (canSplitAudio) {
        const firstAudioFile = `${chapter}_${firstVerseNum}_1_default.mp3`;
        firstVerseEntry.take1 = firstAudioFile;
        firstVerseEntry.default = 'take1';
      }

      const remainingVerses = [];
      for (let v = remainingStart; v <= end; v++) {
        remainingVerses.push(v);
      }

      let remainingVerseEntry;
      if (remainingVerses.length === 1) {
        const singleNum = remainingVerses[0];
        const singleText = getOriginalVerseText(
          originalBookContent,
          chapter.toString(),
          singleNum,
        ) || '';

        remainingVerseEntry = {
          verseNumber: singleNum.toString(),
          verseText: singleText,
        };

        if (canSplitAudio) {
          const singleAudioFile = `${chapter}_${singleNum}_1_default.mp3`;
          remainingVerseEntry.take1 = singleAudioFile;
          remainingVerseEntry.default = 'take1';
        }
      } else {
        const segments = remainingVerses.map((vnum) => ({
          verse: vnum,
          text: getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '',
        }));

        const remainingText = segments.map((s) => s.text).filter(Boolean).join(' ').trim();

        remainingVerseEntry = {
          verseNumber: `${remainingVerses[0]}-${remainingVerses[remainingVerses.length - 1]}`,
          verseText: remainingText,
          joinedVerses: remainingVerses,
          verseSegments: segments,
        };

        if (canSplitAudio) {
          logger.debug('Merging audio for remaining verses:', remainingVerses);

          const remainingMergeResult = await mergeDefaultAudios(
            remainingVerses,
            chapter,
            audioPath,
            `${remainingVerses[0]}-${remainingVerses[remainingVerses.length - 1]}`,
          );

          if (remainingMergeResult.success) {
            remainingVerseEntry.take1 = remainingMergeResult.filename;
            remainingVerseEntry.default = 'take1';
            remainingVerseEntry.timestamps = remainingMergeResult.timestamps;

            for (let i = 1; i < remainingVerses.length; i++) {
              deleteAllAudioForVerse(chapter, remainingVerses[i], audioPath);
            }
          }
        }
      }

      const updatedContent = [...audioContent];
      updatedContent.splice(verseIndex, 1, firstVerseEntry, remainingVerseEntry);

      setAudioContent(updatedContent);
      await saveVerseStructure(updatedContent);

      setNotify('success');
      setSnackText(t('msg-verses-disjoined') || 'Verses separated successfully');
      setOpenSnackBar(true);

      return true;
    } catch (err) {
      logger.error('Error disjoining verses:', err);
      setNotify('failure');
      setSnackText(t('msg-disjoin-failed') || 'Failed to separate verses');
      setOpenSnackBar(true);
      return false;
    }
  }, [audioContent, setAudioContent, originalBookContent, chapter, audioPath, t, setNotify, setSnackText, setOpenSnackBar, saveVerseStructure]);

  const handleJoinVerse = useCallback((currentVerseNumber) => {
    const validation = validateVerseJoin(audioContent, currentVerseNumber);

    if (!validation.valid) {
      setNotify('failure');
      setSnackText(validation.message);
      setOpenSnackBar(true);
      return;
    }

    const { currentVerseIndex, previousVerseIndex } = validation;
    executeJoinVerse(currentVerseNumber, currentVerseIndex, previousVerseIndex);
  }, [audioContent, setNotify, setSnackText, setOpenSnackBar, executeJoinVerse]);

  const handleDisjoinVerse = useCallback((joinedVerseNumber) => {
    const validation = validateVerseDisjoin(audioContent, joinedVerseNumber);

    if (!validation.valid) {
      setNotify('failure');
      setSnackText(validation.message);
      setOpenSnackBar(true);
      return;
    }

    const { verseIndex } = validation;
    executeDisjoinVerse(joinedVerseNumber, verseIndex);
  }, [audioContent, setNotify, setSnackText, setOpenSnackBar, executeDisjoinVerse]);

  const loadVerseStructure = useCallback(async () => {
    try {
      const fs = window.require('fs');
      const path = require('path');

      const bookFolder = path.dirname(audioPath);
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
        return allStructure[bookIdUpper][chapterKey].verses;
      }

      return null;
    } catch (err) {
      logger.error('Error loading verse structure:', err);
      return null;
    }
  }, [audioPath, chapter, bookId]);

  return {
    handleJoinVerse,
    handleDisjoinVerse,
    saveVerseStructure,
    loadVerseStructure,
  };
};
