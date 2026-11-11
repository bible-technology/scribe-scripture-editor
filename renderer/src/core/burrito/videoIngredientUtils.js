const VIDEO_MIME_TYPES = {
  mp4: 'video/mp4',
  webm: 'video/webm',
};

// Take file names written by the video editor:
//   <chapter>_<verse>.<ext>          one verse
//   <chapter>_<first>-<last>.<ext>   joined verses
//   <chapter>_<verse>_<n>.<ext>      comment video
const TAKE_FILE_NAME = /^(\d+)_(\d+(?:-\d+)?)(?:_(\d+))?\.(mp4|webm)$/i;

/**
 * Joins path parts into a Scripture Burrito path: forward slashes on every OS.
 * Ingredient keys must be built with this, never with path.join.
 * @param {...string} parts
 * @returns {string}
 */
export const toBurritoPath = (...parts) => parts.join('/').replace(/\\/g, '/');

/**
 * @param {string} fileName
 * @returns {string|undefined} 'video/mp4' or 'video/webm'; undefined for any other file
 */
export const videoMimeType = (fileName) => {
  const match = /\.(mp4|webm)$/i.exec(fileName);
  return match ? VIDEO_MIME_TYPES[match[1].toLowerCase()] : undefined;
};

export const isVideoFile = (fileName) => videoMimeType(fileName) !== undefined;

/**
 * The static part of the ingredient entry for a video file: mimeType, and scope or role.
 * checksum and size are added by the caller.
 * @param {string} bookId upper-case book code, e.g. 'JHN'
 * @param {string} fileName e.g. '1_3-4.webm'
 * @returns {{mimeType: string, scope?: object, role?: string}}
 */
export const describeVideoFile = (bookId, fileName) => {
  const entry = { mimeType: videoMimeType(fileName) };
  const match = TAKE_FILE_NAME.exec(fileName);
  if (!match) {
    return entry;
  }
  const [, chapter, verse, commentNumber] = match;
  if (commentNumber) {
    // A comment video is a working file, not scripture content: no scope.
    entry.role = 'x-scribe';
  } else {
    entry.scope = { [bookId]: [`${chapter}:${verse}`] };
  }
  return entry;
};
