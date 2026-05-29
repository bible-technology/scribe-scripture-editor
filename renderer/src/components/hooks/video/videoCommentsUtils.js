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

const getVerseRange = (verseNumber) => {
  if (typeof verseNumber !== 'string' && typeof verseNumber !== 'number') {
    return null;
  }

  const verseText = verseNumber.toString();
  const [startText, endText = startText] = verseText.split('-');
  const start = Number(startText);
  const end = Number(endText);

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return null;
  }

  return {
    start: Math.min(start, end),
    end: Math.max(start, end),
  };
};

const getVerseRanges = (verse) => {
  if (Array.isArray(verse.joinedVerses) && verse.joinedVerses.length > 0) {
    return verse.joinedVerses
      .map((verseNumber) => getVerseRange(verseNumber))
      .filter(Boolean);
  }

  const range = getVerseRange(verse.verseNumber);
  return range ? [range] : [];
};

const rangesOverlap = (left, right) => left.start <= right.end && right.start <= left.end;

const commentKeyMatchesVerse = (commentKey, verse) => {
  const commentRange = getVerseRange(commentKey);
  const verseRanges = getVerseRanges(verse);

  if (!commentRange || verseRanges.length === 0) {
    return commentKey === verse.verseNumber;
  }

  return verseRanges.some((verseRange) => rangesOverlap(commentRange, verseRange));
};

const getCommentIdentity = (comment, fallbackKey) => (
  comment?.id || `${fallbackKey}:${comment?.videoFileName || ''}:${comment?.note || ''}`
);

const getVisibleCommentsForVerse = (chapterComments, verse) => {
  const seenComments = new Set();

  return Object.entries(chapterComments)
    .filter(([commentKey]) => commentKeyMatchesVerse(commentKey, verse))
    .flatMap(([commentKey, verseComments]) => (
      Array.isArray(verseComments)
        ? verseComments.map((comment) => ({ commentKey, comment }))
        : []
    ))
    .filter(({ commentKey, comment }) => {
      const identity = getCommentIdentity(comment, commentKey);

      if (seenComments.has(identity)) {
        return false;
      }

      seenComments.add(identity);
      return true;
    });
};

const removeEmptyChapterCommentKeys = (chapterComments) => {
  Object.keys(chapterComments).forEach((commentKey) => {
    if (!Array.isArray(chapterComments[commentKey]) || chapterComments[commentKey].length === 0) {
      delete chapterComments[commentKey];
    }
  });
};

export const mergeCommentsIntoVerses = (verses, videoPath, bookId, chapter) => {
  const commentsData = readCommentsFile(videoPath, bookId);
  const chapterComments = getChapterComments(commentsData, bookId, chapter);

  return (verses || []).map((verse) => {
    const comments = getVisibleCommentsForVerse(chapterComments, verse)
      .map(({ comment }) => comment);

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

  const chapterComments = allComments[bookIdUpper][chapterKey];
  const visibleBeforeSave = getVisibleCommentsForVerse(
    chapterComments,
    verseData || { verseNumber },
  );
  const visibleBeforeIds = new Set(
    visibleBeforeSave.map(({ commentKey, comment }) => getCommentIdentity(comment, commentKey)),
  );
  const nextCommentsById = new Map(
    comments.map((comment) => [getCommentIdentity(comment, verseNumber), comment]),
  );

  Object.keys(chapterComments).forEach((commentKey) => {
    chapterComments[commentKey] = (chapterComments[commentKey] || [])
      .map((comment) => {
        const identity = getCommentIdentity(comment, commentKey);

        if (!visibleBeforeIds.has(identity)) {
          return comment;
        }

        if (!nextCommentsById.has(identity)) {
          return null;
        }

        const nextComment = nextCommentsById.get(identity);
        nextCommentsById.delete(identity);
        return nextComment;
      })
      .filter(Boolean);
  });

  const newComments = Array.from(nextCommentsById.values());
  if (newComments.length > 0) {
    chapterComments[verseNumber] = [
      ...(chapterComments[verseNumber] || []),
      ...newComments,
    ];
  }

  removeEmptyChapterCommentKeys(chapterComments);

  if (Object.keys(chapterComments).length === 0) {
    delete allComments[bookIdUpper][chapterKey];
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
  const chapterComments = allComments[bookIdUpper]?.[chapterKey] || {};
  const nextCommentsById = new Map();

  verses.forEach((verse) => {
    if (Array.isArray(verse.comments) && verse.comments.length > 0) {
      verse.comments.forEach((comment) => {
        nextCommentsById.set(getCommentIdentity(comment, verse.verseNumber), {
          verseNumber: verse.verseNumber,
          comment,
        });
      });
    }
  });

  if (!allComments[bookIdUpper]) {
    allComments[bookIdUpper] = {};
  }
  if (!allComments[bookIdUpper][chapterKey]) {
    allComments[bookIdUpper][chapterKey] = {};
  }

  const nextChapterComments = allComments[bookIdUpper][chapterKey];

  Object.keys(chapterComments).forEach((commentKey) => {
    nextChapterComments[commentKey] = (chapterComments[commentKey] || [])
      .map((comment) => {
        const identity = getCommentIdentity(comment, commentKey);

        if (!nextCommentsById.has(identity)) {
          return comment;
        }

        const nextComment = nextCommentsById.get(identity).comment;
        nextCommentsById.delete(identity);
        return nextComment;
      });
  });

  Array.from(nextCommentsById.values()).forEach(({ verseNumber, comment }) => {
    if (!nextChapterComments[verseNumber]) {
      nextChapterComments[verseNumber] = [];
    }

    const identity = getCommentIdentity(comment, verseNumber);
    const alreadyExists = nextChapterComments[verseNumber].some(
      (existingComment) => getCommentIdentity(existingComment, verseNumber) === identity,
    );

    if (!alreadyExists) {
      nextChapterComments[verseNumber].push(comment);
    }
  });

  removeEmptyChapterCommentKeys(nextChapterComments);

  if (Object.keys(nextChapterComments).length === 0) {
    delete allComments[bookIdUpper][chapterKey];
  }

  fs.mkdirSync(path.dirname(commentsFile), { recursive: true });
  fs.writeFileSync(commentsFile, JSON.stringify(allComments, null, 2), 'utf8');
  updateCommentsIngredient(videoPath, bookId, commentsFile);
};
