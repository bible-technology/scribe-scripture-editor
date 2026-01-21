import { useCallback } from 'react';
import {
  mergeAudioFiles,
  splitMergedAudio,
  deleteAllAudioForVerse,
  hasAnyAudioForVerse,
  getDefaultAudioForVerse,
  getAllAudioForVerse,
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
  setConfirmModal,
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

            if (verse.take1) { verseData.take1 = verse.take1; }
            if (verse.default) { verseData.default = verse.default; }
            if (verse.timestamps) { verseData.timestamps = verse.timestamps; }

            return verseData;
          }),
      };

      const dir = path.dirname(structureFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(structureFile, JSON.stringify(allStructure, null, 2), 'utf8');
      logger.debug('Verse structure saved');
      return true;
    } catch (err) {
      logger.error('Error saving verse structure:', err);
      return false;
    }
  }, [audioPath, chapter, bookId]);

  const executeJoinVerse = useCallback(async (
    currentVerseNumber,
    currentVerseIndex,
    previousVerseIndex,
    skipAudioCheck = false,
  ) => {
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
      let atomicGroups = [];

      if (previousVerseNum.includes('-')) {
        const parts = previousVerseNum.split('-').map(Number);
        const start = parts[0];
        const end = Math.max(...parts);
        newVerseNumber = `${start}-${currentVerseNum}`;
        joinedVerses = previousVerse.joinedVerses
          ? [...previousVerse.joinedVerses, currentVerseNum]
          : Array.from({ length: end - start + 1 }, (_, i) => start + i).concat(currentVerseNum);
        if (!previousVerse.timestamps || previousVerse.timestamps.length === 0) {
          atomicGroups.push(previousVerseNum);
          logger.debug(`Detected atomic group: ${previousVerseNum}`);
        } else if (previousVerse.atomicGroups && Array.isArray(previousVerse.atomicGroups)) {
          atomicGroups = [...previousVerse.atomicGroups];
        }
      } else {
        const prevNum = parseInt(previousVerseNum, 10);
        newVerseNumber = `${prevNum}-${currentVerseNum}`;
        joinedVerses = [prevNum, currentVerseNum];
      }

      const textArray = joinedVerses
        .map((num) => getOriginalVerseText(originalBookContent, chapter.toString(), num))
        .filter(Boolean);
      const combinedText = textArray.join(' ').trim();

      const previousHasAudio = previousVerse.default && previousVerse[previousVerse.default];
      const currentHasAudio = currentVerse.default && currentVerse[currentVerse.default];

      const previousHasAnyAudio = previousHasAudio || hasAnyAudioForVerse(chapter, previousVerseNum, audioPath);
      const currentHasAnyAudio = currentHasAudio || hasAnyAudioForVerse(chapter, currentVerseNumber, audioPath);

      if (!skipAudioCheck && ((previousHasAudio && !currentHasAudio) || (!previousHasAudio && currentHasAudio))) {
        setConfirmModal({
          open: true,
          title: t('modal-title-join-warning'),
          message: t('msg-join-audio-mismatch'),
          confirmText: t('label-continue'),
          onConfirm: () => {
            executeJoinVerse(currentVerseNumber, currentVerseIndex, previousVerseIndex, true);
          },
        });
        return false;
      }

      if (previousHasAnyAudio) {
        const prevAudios = getAllAudioForVerse(chapter, previousVerseNum, audioPath);
        prevAudios.forEach((audio) => {
          if (!audio.isDefault) {
            const fs = window.require('fs');
            fs.unlinkSync(audio.path);
            logger.debug(`Deleted non-default: ${audio.filename}`);
          }
        });
      }

      if (currentHasAnyAudio) {
        const currAudios = getAllAudioForVerse(chapter, currentVerseNumber, audioPath);
        currAudios.forEach((audio) => {
          if (!audio.isDefault) {
            const fs = window.require('fs');
            fs.unlinkSync(audio.path);
            logger.debug(`Deleted non-default: ${audio.filename}`);
          }
        });
      }

      let mergedAudio = null;

      if (previousHasAudio && currentHasAudio) {
        logger.debug('Both verses have audio - merging...');

        const audioFilesToMerge = [];

        if (previousVerse.timestamps && Array.isArray(previousVerse.timestamps)) {
          audioFilesToMerge.push({
            path: path.join(audioPath, previousVerse[previousVerse.default]),
            verseNumber: previousVerseNum,
            timestamps: previousVerse.timestamps,
            isMerged: true,
            atomicGroups: previousVerse.atomicGroups || [],
          });
        } else {
          audioFilesToMerge.push({
            path: path.join(audioPath, previousVerse[previousVerse.default]),
            verseNumber: previousVerseNum,
            isMerged: false,
            isAtomic: true,
          });
        }
        audioFilesToMerge.push({
          path: path.join(audioPath, currentVerse[currentVerse.default]),
          verseNumber: currentVerseNumber,
          isMerged: false,
        });

        const mergeResult = await mergeAudioFiles(
          audioFilesToMerge,
          chapter,
          audioPath,
          newVerseNumber,
          joinedVerses,
          atomicGroups,
        );

        if (mergeResult.success) {
          mergedAudio = {
            filename: mergeResult.filename,
            timestamps: mergeResult.timestamps,
            atomicGroups: mergeResult.atomicGroups,
          };
          logger.debug('Audio merged successfully');

          deleteAllAudioForVerse(chapter, previousVerseNum, audioPath);
          deleteAllAudioForVerse(chapter, currentVerseNumber, audioPath);
        } else {
          logger.error('Audio merge failed:', mergeResult.error);
          setNotify('failure');
          setSnackText(t('msg-audio-merge-failed'));
          setOpenSnackBar(true);
          return false;
        }
      } else if (previousHasAudio || currentHasAudio) {
        if (previousHasAnyAudio) {
          deleteAllAudioForVerse(chapter, previousVerseNum, audioPath);
        }
        if (currentHasAnyAudio) {
          deleteAllAudioForVerse(chapter, currentVerseNumber, audioPath);
        }
        logger.debug('Deleted audio from verses with mismatched audio');
      }

      const updatedVerseEntry = {
        verseNumber: newVerseNumber,
        verseText: combinedText,
        joinedVerses,
        atomicGroups,
        verseSegments: joinedVerses.map((vnum) => ({
          verse: vnum,
          text: getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '',
        })),
      };

      if (mergedAudio) {
        updatedVerseEntry.take1 = mergedAudio.filename;
        updatedVerseEntry.default = 'take1';
        updatedVerseEntry.timestamps = mergedAudio.timestamps;
        updatedVerseEntry.atomicGroups = mergedAudio.atomicGroups;
      }

      const updatedContent = [...audioContent];
      updatedContent[previousVerseIndex] = updatedVerseEntry;
      updatedContent.splice(currentVerseIndex, 1);

      setAudioContent(updatedContent);
      await saveVerseStructure(updatedContent);

      setNotify('success');
      setSnackText(t('msg-verses-joined'));
      setOpenSnackBar(true);

      return true;
    } catch (err) {
      logger.error('Error joining verses:', err);
      setNotify('failure');
      setSnackText(t('msg-join-failed'));
      setOpenSnackBar(true);
      return false;
    }
  }, [
    audioContent,
    setAudioContent,
    originalBookContent,
    chapter,
    audioPath,
    t,
    setNotify,
    setSnackText,
    setOpenSnackBar,
    setConfirmModal,
    saveVerseStructure,
  ]);

  const executeDisjoinVerse = useCallback(async (
    joinedVerseNumber,
    verseIndex,
    skipAudioCheck = false,
  ) => {
    try {
      const verse = audioContent[verseIndex];
      const path = require('path');

      if (!verse) {
        logger.error('Verse not found at index', verseIndex);
        setNotify('failure');
        setSnackText(t('msg-disjoin-failed'));
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

      const hasAtomicGroups = verse.atomicGroups && verse.atomicGroups.length > 0;
      let firstVerseNum;
      let firstVerseText;
      let firstIsAtomic = false;

      if (hasAtomicGroups) {
        const firstAtomicGroup = verse.atomicGroups[0];
        firstVerseNum = firstAtomicGroup;
        firstIsAtomic = true;

        const atomicParts = firstAtomicGroup.split('-').map(Number);
        const texts = atomicParts.map((num) => getOriginalVerseText(originalBookContent, chapter.toString(), num)).filter(Boolean);
        firstVerseText = texts.join(' ').trim();

        logger.debug(`First verse is atomic group: ${firstAtomicGroup}`);
      } else {
        firstVerseNum = start;
        firstVerseText = getOriginalVerseText(
          originalBookContent,
          chapter.toString(),
          firstVerseNum,
        ) || '';
      }

      const mergedAudioInfo = getDefaultAudioForVerse(chapter, joinedVerseNumber, audioPath);
      const hasTimestamps = verse.timestamps && Array.isArray(verse.timestamps) && verse.timestamps.length > 0;

      if (!skipAudioCheck && mergedAudioInfo.exists && !hasTimestamps) {
        setConfirmModal({
          open: true,
          title: t('modal-title-disjoin-warning'),
          message: t('msg-disjoin-no-timestamps'),
          confirmText: t('label-continue'),
          onConfirm: () => {
            executeDisjoinVerse(joinedVerseNumber, verseIndex, true);
          },
        });
        return false;
      }

      let canSplitAudio = false;
      if (mergedAudioInfo.exists && hasTimestamps) {
        canSplitAudio = true;
        logger.debug('Can split audio - timestamps available');

        const splitResult = await splitMergedAudio(
          mergedAudioInfo.path,
          verse.timestamps,
          chapter,
          audioPath,
        );

        if (splitResult.success) {
          logger.debug('Audio split successfully');
          deleteAllAudioForVerse(chapter, joinedVerseNumber, audioPath);
        } else {
          logger.error('Audio split failed:', splitResult.error);
          setNotify('failure');
          setSnackText(t('msg-audio-split-failed'));
          setOpenSnackBar(true);
          return false;
        }
      } else if (mergedAudioInfo.exists && !hasTimestamps) {
        deleteAllAudioForVerse(chapter, joinedVerseNumber, audioPath);
        logger.debug('Deleted merged audio (no timestamps)');
      }

      const firstVerseEntry = {
        verseNumber: firstVerseNum.toString(),
        verseText: firstVerseText,
      };

      if (firstIsAtomic) {
        const atomicParts = firstVerseNum.split('-').map(Number);
        firstVerseEntry.joinedVerses = atomicParts;
        firstVerseEntry.verseSegments = atomicParts.map((vnum) => ({
          verse: vnum,
          text: getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '',
        }));
      }

      if (canSplitAudio) {
        const firstAudioFile = `${chapter}_${firstVerseNum}_1_default.mp3`;
        firstVerseEntry.take1 = firstAudioFile;
        firstVerseEntry.default = 'take1';
      }

      let remainingStart;
      if (firstIsAtomic) {
        const atomicParts = firstVerseNum.split('-').map(Number);
        remainingStart = atomicParts[atomicParts.length - 1] + 1;
      } else {
        remainingStart = start + 1;
      }

      const remainingVerses = [];
      for (let v = remainingStart; v <= end; v += 1) {
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
        const remainingVerseNum = `${remainingVerses[0]}-${remainingVerses[remainingVerses.length - 1]}`;

        remainingVerseEntry = {
          verseNumber: remainingVerseNum,
          verseText: remainingText,
          joinedVerses: remainingVerses,
          verseSegments: segments,
        };

        if (hasAtomicGroups && verse.atomicGroups.length > 1) {
          remainingVerseEntry.atomicGroups = verse.atomicGroups.slice(1);
        }

        if (canSplitAudio) {
          logger.debug('Merging remaining verses:', remainingVerses);

          const audioFilesToMerge = remainingVerses.map((vnum) => ({
            path: path.join(audioPath, `${chapter}_${vnum}_1_default.mp3`),
            verseNumber: vnum,
            isMerged: false,
          }));

          const remainingMergeResult = await mergeAudioFiles(
            audioFilesToMerge,
            chapter,
            audioPath,
            remainingVerseNum,
            remainingVerses,
            remainingVerseEntry.atomicGroups || [],
          );

          if (remainingMergeResult.success) {
            remainingVerseEntry.take1 = remainingMergeResult.filename;
            remainingVerseEntry.default = 'take1';
            remainingVerseEntry.timestamps = remainingMergeResult.timestamps;
            if (remainingMergeResult.atomicGroups) {
              remainingVerseEntry.atomicGroups = remainingMergeResult.atomicGroups;
            }

            for (let i = 1; i < remainingVerses.length; i += 1) {
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
      setSnackText(t('msg-verses-disjoined'));
      setOpenSnackBar(true);

      return true;
    } catch (err) {
      logger.error('Error disjoining verses:', err);
      setNotify('failure');
      setSnackText(t('msg-disjoin-failed'));
      setOpenSnackBar(true);
      return false;
    }
  }, [
    audioContent,
    setAudioContent,
    originalBookContent,
    chapter,
    audioPath,
    t,
    setNotify,
    setSnackText,
    setOpenSnackBar,
    setConfirmModal,
    saveVerseStructure,
  ]);

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
