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

export const deleteVerseVideos = (chapter, verseNumber, videoDirPath) => {
  try {
    const fs = window.require('fs');
    const path = require('path');

    const filename = `${chapter}_${verseNumber}.webm`;
    const fullVideoPath = path.join(videoDirPath, filename);

    if (fs.existsSync(fullVideoPath)) {
      fs.unlinkSync(fullVideoPath);
      logger.debug('Deleted video:', fullVideoPath);
      return true;
    }

    logger.warn('Video file not found:', fullVideoPath);
    return false;
  } catch (error) {
    logger.error('Error deleting verse video:', error);
    return false;
  }
};

export const hasVerseRecordings = (chapter, verseNumber, videoDirPath) => {
  try {
    const fs = window.require('fs');
    const path = require('path');

    const filename = `${chapter}_${verseNumber}.webm`;
    const fullVideoPath = path.join(videoDirPath, filename);

    return fs.existsSync(fullVideoPath);
  } catch (error) {
    logger.error('Error checking verse recording:', error);
    return false;
  }
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
