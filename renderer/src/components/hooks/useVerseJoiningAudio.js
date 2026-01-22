import { useCallback } from 'react';
import {
  mergeAudioFiles,
  splitMergedAudio,
  deleteAllAudioForVerse,
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

function resolveVerseText({
  verseNumber,
  verseSegments,
  verseText,
  originalBookContent,
  chapter,
}) {
  if (verseSegments && Array.isArray(verseSegments)) {
    const seg = verseSegments.find(
      (s) => s.verse.toString() === verseNumber.toString(),
    );
    if (seg && seg.text !== undefined) {
      return seg.text;
    }
  }

  if (verseText !== undefined && typeof verseText === 'string') {
    return verseText;
  }

  return getOriginalVerseText(originalBookContent, chapter, verseNumber);
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
            if (verse.take2) { verseData.take2 = verse.take2; }
            if (verse.take3) { verseData.take3 = verse.take3; }
            if (verse.default) { verseData.default = verse.default; }
            if (verse.timestamps) { verseData.timestamps = verse.timestamps; }
            if (verse.atomicGroups) { verseData.atomicGroups = verse.atomicGroups; }

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

      logger.debug('Joining verses:', {
        current: currentVerseNumber,
        previous: previousVerseNum,
      });

      let newVerseNumber;
      let joinedVerses = [];
      let atomicGroups = [];

      if (previousVerseNum.includes('-')) {
        const parts = previousVerseNum.split('-').map(Number);
        const start = parts[0];
        const end = parts[parts.length - 1];

        newVerseNumber = `${start}-${currentVerseNum}`;

        for (let v = start; v <= end; v++) {
          joinedVerses.push(v);
        }
        joinedVerses.push(currentVerseNum);

        const previousHasAudio = previousVerse.default && previousVerse[previousVerse.default];
        const hasNoTimestamps = !previousVerse.timestamps || previousVerse.timestamps.length === 0;

        if (previousHasAudio && hasNoTimestamps) {
          atomicGroups.push(previousVerseNum);
          logger.debug(`Detected atomic group: ${previousVerseNum}`);
        } else if (previousVerse.atomicGroups && Array.isArray(previousVerse.atomicGroups)) {
          atomicGroups = [...previousVerse.atomicGroups];
          logger.debug(`Preserved atomic groups: ${JSON.stringify(atomicGroups)}`);
        }
      } else {
        const prevNum = parseInt(previousVerseNum, 10);
        newVerseNumber = `${prevNum}-${currentVerseNum}`;
        joinedVerses = [prevNum, currentVerseNum];
      }

      const textArray = joinedVerses
        .map((num) => {
          const sourceVerse = audioContent.find((v) => {
            if (!v.verseNumber) { return false; }
            if (v.verseNumber === num.toString()) { return true; }

            if (v.verseNumber.includes('-')) {
              const [start, end] = v.verseNumber.split('-').map(Number);
              return num >= start && num <= end;
            }

            return false;
          });

          if (sourceVerse) {
            return resolveVerseText({
              verseNumber: num,
              verseSegments: sourceVerse.verseSegments,
              verseText: sourceVerse.verseText,
              originalBookContent,
              chapter: chapter.toString(),
            });
          }

          return getOriginalVerseText(originalBookContent, chapter.toString(), num);
        })
        .filter(Boolean);

      const combinedText = textArray.join(' ').trim();

      const previousHasAudio = previousVerse.default && previousVerse[previousVerse.default];
      const currentHasAudio = currentVerse.default && currentVerse[currentVerse.default];

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

      if (previousHasAudio) {
        const prevAudios = getAllAudioForVerse(chapter, previousVerseNum, audioPath);
        prevAudios.forEach((audio) => {
          if (!audio.isDefault) {
            const fs = window.require('fs');
            fs.unlinkSync(audio.path);
            logger.debug(`Deleted non-default: ${audio.filename}`);
          }
        });
      }

      if (currentHasAudio) {
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
        if (previousHasAudio) {
          deleteAllAudioForVerse(chapter, previousVerseNum, audioPath);
        }
        if (currentHasAudio) {
          deleteAllAudioForVerse(chapter, currentVerseNumber, audioPath);
        }
        logger.debug('Deleted audio from verses with mismatched audio');
      }

      const updatedVerseEntry = {
        verseNumber: newVerseNumber,
        verseText: combinedText,
        joinedVerses,
        verseSegments: joinedVerses.map((vnum) => {
          const sourceVerse = audioContent.find((v) => {
            if (!v.verseNumber) { return false; }

            if (v.verseNumber === vnum.toString()) { return true; }

            if (v.verseNumber.includes('-')) {
              const [start, end] = v.verseNumber.split('-').map(Number);
              return vnum >= start && vnum <= end;
            }

            return false;
          });

          if (sourceVerse?.verseSegments) {
            const seg = sourceVerse.verseSegments.find(
              (s) => s.verse.toString() === vnum.toString(),
            );
            if (seg?.text !== undefined) {
              return { verse: vnum, text: seg.text };
            }
          }

          if (sourceVerse?.verseText) {
            return { verse: vnum, text: sourceVerse.verseText };
          }

          return {
            verse: vnum,
            text: getOriginalVerseText(originalBookContent, chapter.toString(), vnum) || '',
          };
        }),

      };

      if (atomicGroups.length > 0) {
        updatedVerseEntry.atomicGroups = atomicGroups;
      }

      if (mergedAudio) {
        updatedVerseEntry.take1 = mergedAudio.filename;
        updatedVerseEntry.default = 'take1';
        updatedVerseEntry.timestamps = mergedAudio.timestamps;
        if (mergedAudio.atomicGroups && mergedAudio.atomicGroups.length > 0) {
          updatedVerseEntry.atomicGroups = mergedAudio.atomicGroups;
        }
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

      const mergedAudioInfo = getDefaultAudioForVerse(chapter, joinedVerseNumber, audioPath);
      const hasTimestamps = verse.timestamps && Array.isArray(verse.timestamps) && verse.timestamps.length > 0;
      const hasAtomicGroups = verse.atomicGroups && verse.atomicGroups.length > 0;
      let firstVerseNum;
      let firstVerseText;
      let firstIsAtomic = false;
      let remainingAtomicGroups = [];

      if (hasAtomicGroups) {
        const firstAtomicGroup = verse.atomicGroups[0];

        const isDisjoinningAtomicGroup = firstAtomicGroup === joinedVerseNumber;

        if (isDisjoinningAtomicGroup && mergedAudioInfo.exists && !hasTimestamps) {
          logger.debug(`Disjoining atomic group ${firstAtomicGroup} - audio will be deleted`);

          firstVerseNum = start;
          firstIsAtomic = false;

          firstVerseText = resolveVerseText({
            verseNumber: firstVerseNum,
            verseSegments: verse.verseSegments,
            verseText: verse.verseText,
            originalBookContent,
            chapter: chapter.toString(),
          }) || '';

          remainingAtomicGroups = [];

          logger.debug(`Split off verse ${firstVerseNum}, no atomic groups preserved (audio deleted)`);
        } else {
          firstVerseNum = firstAtomicGroup;
          firstIsAtomic = true;

          const atomicSegment = verse.verseSegments?.find(
            (seg) => seg.verse.toString() === firstAtomicGroup,
          );

          if (atomicSegment && atomicSegment.text) {
            firstVerseText = atomicSegment.text.trim();
            logger.debug(`Found atomic segment text for ${firstAtomicGroup}`);
          } else {
            const atomicParts = firstAtomicGroup.split('-').map(Number);
            const texts = [];

            for (let v = atomicParts[0]; v <= atomicParts[atomicParts.length - 1]; v++) {
              texts.push(
                resolveVerseText({
                  verseNumber: v,
                  verseSegments: verse.verseSegments,
                  verseText: verse.verseText,
                  originalBookContent,
                  chapter: chapter.toString(),
                }),
              );
            }

            firstVerseText = texts.filter(Boolean).join(' ').trim();
            logger.debug(`Built atomic text from segments for ${firstAtomicGroup}`);
          }

          remainingAtomicGroups = verse.atomicGroups.slice(1);

          logger.debug(`Keeping atomic group together: ${firstAtomicGroup}`);
        }
      } else {
        firstVerseNum = start;
        firstIsAtomic = false;

        firstVerseText = resolveVerseText({
          verseNumber: firstVerseNum,
          verseSegments: verse.verseSegments,
          verseText: verse.verseText,
          originalBookContent,
          chapter: chapter.toString(),
        }) || '';

        logger.debug(`No atomic groups - splitting off verse ${firstVerseNum}`);
      }

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
        verseSegments: verse.verseSegments
          ?.filter((s) => s.verse === firstVerseNum),
      };

      if (firstIsAtomic) {
        const rangeParts = firstVerseNum.split('-').map(Number);
        const completeJoinedVerses = [];

        for (let v = rangeParts[0]; v <= rangeParts[rangeParts.length - 1]; v++) {
          completeJoinedVerses.push(v);
        }

        firstVerseEntry.joinedVerses = completeJoinedVerses;
        firstVerseEntry.atomicGroups = [firstVerseNum];
        firstVerseEntry.verseSegments = completeJoinedVerses.map((vnum) => ({
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
      for (let v = remainingStart; v <= end; v++) {
        remainingVerses.push(v);
      }

      let remainingVerseEntry;

      if (remainingVerses.length === 0) {
        logger.warn('No remaining verses after disjoin');
        remainingVerseEntry = null;
      } else if (remainingVerses.length === 1) {
        const singleNum = remainingVerses[0];

        const singleText = resolveVerseText({
          verseNumber: singleNum,
          verseSegments: verse.verseSegments,
          verseText: verse.verseText,
          originalBookContent,
          chapter: chapter.toString(),
        }) || '';

        remainingVerseEntry = {
          verseNumber: singleNum.toString(),
          verseText: singleText,
          verseSegments: verse.verseSegments
            ?.filter((s) => s.verse === singleNum),
        };

        if (canSplitAudio) {
          const singleAudioFile = `${chapter}_${singleNum}_1_default.mp3`;
          remainingVerseEntry.take1 = singleAudioFile;
          remainingVerseEntry.default = 'take1';
        }
      } else {
        const segments = remainingVerses.map((vnum) => ({
          verse: vnum,
          text: resolveVerseText({
            verseNumber: vnum,
            verseSegments: verse.verseSegments,
            verseText: verse.verseText,
            originalBookContent,
            chapter: chapter.toString(),
          }) || '',
        }));

        const remainingText = segments
          .map((s) => s.text)
          .filter(Boolean)
          .join(' ')
          .trim();

        const remainingVerseNum = `${remainingVerses[0]}-${remainingVerses[remainingVerses.length - 1]}`;

        remainingVerseEntry = {
          verseNumber: remainingVerseNum,
          verseText: remainingText,
          joinedVerses: remainingVerses,
          verseSegments: segments,
        };

        if (remainingAtomicGroups.length > 0) {
          remainingVerseEntry.atomicGroups = remainingAtomicGroups;
          logger.debug(`Remaining verse has atomic groups: ${JSON.stringify(remainingAtomicGroups)}`);
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
            remainingAtomicGroups,
          );

          if (remainingMergeResult.success) {
            remainingVerseEntry.take1 = remainingMergeResult.filename;
            remainingVerseEntry.default = 'take1';
            remainingVerseEntry.timestamps = remainingMergeResult.timestamps;

            if (remainingMergeResult.atomicGroups && remainingMergeResult.atomicGroups.length > 0) {
              remainingVerseEntry.atomicGroups = remainingMergeResult.atomicGroups;
            }

            for (let i = 1; i < remainingVerses.length; i++) {
              deleteAllAudioForVerse(chapter, remainingVerses[i], audioPath);
            }
          }
        }
      }

      const updatedContent = [...audioContent];
      if (remainingVerseEntry) {
        updatedContent.splice(verseIndex, 1, firstVerseEntry, remainingVerseEntry);
      } else {
        updatedContent.splice(verseIndex, 1, firstVerseEntry);
      }

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
