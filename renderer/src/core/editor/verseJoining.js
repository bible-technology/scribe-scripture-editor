import * as logger from '../../logger';

const grammar = require('usfm-grammar');

export const getCombinedVerseText = (bookContent, chapter, verseNumbers) => {
  try {
    const chapterData = bookContent.find(
      (ch) => ch.chapterNumber === chapter.toString(),
    );

    if (!chapterData) {
      logger.warn('Chapter not found in bookContent:', chapter);
      return '';
    }

    const texts = verseNumbers.map((verseNum) => {
      const verseData = chapterData.contents.find(
        (v) => v.verseNumber === verseNum.toString(),
      );
      return verseData ? verseData.verseText : '';
    });

    return texts.filter((text) => text).join(' ').trim();
  } catch (error) {
    logger.error('Error combining verse texts:', error);
    return '';
  }
};

export const getOriginalVerseText = (bookContent, chapter, verseNumber) => {
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
};

export const parseJoinedVerseNumber = (joinedVerseNumber) => {
  try {
    const parts = joinedVerseNumber.split('-');
    return parts.map((num) => parseInt(num, 10));
  } catch (error) {
    logger.error('Error parsing joined verse number:', error);
    return [];
  }
};

export const isJoinedVerse = (verseNumber) => verseNumber.includes('-');

export const getJoinedVerseRange = (joinedVerseNumber) => {
  const parts = joinedVerseNumber.split('-');
  return {
    start: parseInt(parts[0], 10),
    end: parseInt(parts[parts.length - 1], 10),
  };
};

export const deleteVerseVideos = (verse, videoDirPath) => {
  try {
    const fs = window.require('fs');
    const path = require('path');

    const videoKeys = Object.keys(verse).filter((key) => key.startsWith('take'));

    logger.info('Deleting videos for verse:', {
      verseNumber: verse.verseNumber,
      videoKeys,
      videoDirPath,
    });

    let deletedCount = 0;
    videoKeys.forEach((take) => {
      const videoFileName = verse[take];
      const fullVideoPath = path.join(videoDirPath, videoFileName);

      logger.info('Attempting to delete video file:', fullVideoPath);

      if (fs.existsSync(fullVideoPath)) {
        try {
          fs.unlinkSync(fullVideoPath);
          logger.info('Successfully deleted video file:', fullVideoPath);
          deletedCount += 1;
        } catch (deleteError) {
          logger.error('Failed to delete video file:', fullVideoPath, deleteError);
        }
      } else {
        logger.warn('Video file not found:', fullVideoPath);
      }
    });

    logger.info(`Deleted ${deletedCount} video file(s) for verse ${verse.verseNumber}`);
    return deletedCount > 0;
  } catch (error) {
    logger.error('Error deleting verse videos:', error);
    return false;
  }
};

export const hasVerseRecordings = (verse) => {
  if (!verse) { return false; }
  return Object.keys(verse).some((key) => key.startsWith('take'));
};

export const readAndParseUSFM = (usfmPath) => {
  try {
    const fs = window.require('fs');

    if (!fs.existsSync(usfmPath)) {
      logger.warn('USFM file not found:', usfmPath);
      return null;
    }

    const usfm = fs.readFileSync(usfmPath, 'utf8');
    const myUsfmParser = new grammar.USFMParser(usfm, grammar.LEVEL.RELAXED);
    const isJsonValid = myUsfmParser.validate();

    if (isJsonValid) {
      return myUsfmParser.toJSON();
    }

    logger.error('Invalid USFM file:', usfmPath);
    return null;
  } catch (error) {
    logger.error('Error reading and parsing USFM:', error);
    return null;
  }
};

export const createCleanVerse = (verseNumber, verseText) => ({
  verseNumber: verseNumber.toString(),
  verseText: verseText || '',
});

export const validateVerseJoin = (videoContent, currentVerseNumber) => {
  const currentVerseIndex = videoContent.findIndex(
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
};

export const validateVerseDisjoin = (videoContent, joinedVerseNumber) => {
  const verseIndex = videoContent.findIndex(
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
};
