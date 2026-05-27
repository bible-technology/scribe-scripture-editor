import * as logger from '../../../logger';

const getBookFolder = (videoPath) => {
  const path = window.require('path');
  return path.dirname(videoPath);
};

const updateCommentsIngredient = (videoPath, bookId, commentsFile) => {
  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const md5 = require('md5');
    const projectPath = path.resolve(videoPath, '..', '..', '..', '..');
    const metadataPath = path.join(projectPath, 'metadata.json');

    if (!fs.existsSync(metadataPath) || !fs.existsSync(commentsFile)) {
      return;
    }

    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const content = fs.readFileSync(commentsFile, 'utf8');
    const stats = fs.statSync(commentsFile);
    const ingredientPath = path.join(
      'video',
      'ingredients',
      bookId.toUpperCase(),
      path.basename(commentsFile),
    );

    metadata.ingredients[ingredientPath] = {
      checksum: {
        md5: md5(content),
      },
      mimeType: 'application/json',
      size: stats.size,
      role: 'x-scribe',
    };

    fs.writeFileSync(metadataPath, JSON.stringify(metadata), 'utf8');
  } catch (err) {
    logger.warn('Could not update video comments metadata ingredient:', err);
  }
};

export const getCommentsFilePath = (videoPath, bookId) => {
  const path = window.require('path');
  return path.join(getBookFolder(videoPath), `${bookId.toLowerCase()}_comments.json`);
};

export const readCommentsFile = (videoPath, bookId) => {
  const fs = window.require('fs');
  const commentsFile = getCommentsFilePath(videoPath, bookId);

  if (!fs.existsSync(commentsFile)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(commentsFile, 'utf8'));
  } catch (err) {
    logger.warn('Could not parse video comments file:', err);
    return {};
  }
};

const getChapterComments = (commentsData, bookId, chapter) => {
  const bookIdUpper = bookId.toUpperCase();
  return commentsData?.[bookIdUpper]?.[chapter.toString()] || {};
};

const getVerseCommentKeys = (verse) => {
  const keys = new Set([verse.verseNumber]);

  if (Array.isArray(verse.joinedVerses)) {
    verse.joinedVerses.forEach((verseNumber) => keys.add(verseNumber.toString()));
  } else if (typeof verse.verseNumber === 'string' && verse.verseNumber.includes('-')) {
    const [start, end] = verse.verseNumber.split('-').map(Number);
    if (!Number.isNaN(start) && !Number.isNaN(end)) {
      for (let verseNumber = start; verseNumber <= end; verseNumber += 1) {
        keys.add(verseNumber.toString());
      }
    }
  }

  return Array.from(keys);
};

export const mergeCommentsIntoVerses = (verses, videoPath, bookId, chapter) => {
  const commentsData = readCommentsFile(videoPath, bookId);
  const chapterComments = getChapterComments(commentsData, bookId, chapter);

  return (verses || []).map((verse) => {
    const comments = getVerseCommentKeys(verse)
      .flatMap((key) => chapterComments[key] || []);

    if (comments.length === 0) {
      const { comments: _comments, ...verseWithoutComments } = verse;
      return verseWithoutComments;
    }

    return {
      ...verse,
      comments,
    };
  });
};

export const writeVerseComments = ({
  bookId,
  chapter,
  verseNumber,
  verseData,
  videoPath,
  comments,
}) => {
  const fs = window.require('fs');
  const path = window.require('path');
  const bookIdUpper = bookId.toUpperCase();
  const commentsFile = getCommentsFilePath(videoPath, bookId);
  const allComments = readCommentsFile(videoPath, bookId);
  const chapterKey = chapter.toString();

  if (!allComments[bookIdUpper]) {
    allComments[bookIdUpper] = {};
  }
  if (!allComments[bookIdUpper][chapterKey]) {
    allComments[bookIdUpper][chapterKey] = {};
  }

  getVerseCommentKeys(verseData || { verseNumber }).forEach((key) => {
    delete allComments[bookIdUpper][chapterKey][key];
  });

  if (comments.length > 0) {
    allComments[bookIdUpper][chapterKey][verseNumber] = comments;
  }

  fs.mkdirSync(path.dirname(commentsFile), { recursive: true });
  fs.writeFileSync(commentsFile, JSON.stringify(allComments, null, 2), 'utf8');
  updateCommentsIngredient(videoPath, bookId, commentsFile);
};

export const replaceChapterCommentsFromVerses = ({
  bookId,
  chapter,
  videoPath,
  verses,
}) => {
  const fs = window.require('fs');
  const path = window.require('path');
  const bookIdUpper = bookId.toUpperCase();
  const commentsFile = getCommentsFilePath(videoPath, bookId);
  const allComments = readCommentsFile(videoPath, bookId);
  const chapterKey = chapter.toString();
  const nextChapterComments = {};

  verses.forEach((verse) => {
    if (Array.isArray(verse.comments) && verse.comments.length > 0) {
      nextChapterComments[verse.verseNumber] = verse.comments;
    }
  });

  if (!allComments[bookIdUpper]) {
    allComments[bookIdUpper] = {};
  }

  if (Object.keys(nextChapterComments).length > 0) {
    allComments[bookIdUpper][chapterKey] = nextChapterComments;
  } else {
    delete allComments[bookIdUpper][chapterKey];
  }

  fs.mkdirSync(path.dirname(commentsFile), { recursive: true });
  fs.writeFileSync(commentsFile, JSON.stringify(allComments, null, 2), 'utf8');
  updateCommentsIngredient(videoPath, bookId, commentsFile);
};
