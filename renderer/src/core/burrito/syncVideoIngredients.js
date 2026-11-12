import * as logger from '../../logger';
import { VIDEO_INTERNAL_FLAVOR, flavorKey } from './flavors';
import migrateVideoBurrito from './migrateVideoBurrito';
import { describeVideoFile, isVideoFile, toBurritoPath } from './videoIngredientUtils';

const BOOK_FOLDER = /^[A-Z0-9]{3}$/i;
const MD5_HEX = /^[0-9a-f]{32}$/;
const INGREDIENTS_PREFIX = 'video/ingredients/';

// MD5 of the file's bytes, read as a stream so a large video is never held in memory.
const hashFile = (fs, crypto, filePath) => new Promise((resolve, reject) => {
  const hash = crypto.createHash('md5');
  fs.createReadStream(filePath)
    .on('error', reject)
    .on('data', (chunk) => hash.update(chunk))
    .on('end', () => resolve(hash.digest('hex')));
});

const readMetadata = (fs, metadataPath) => JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// Files under video/ingredients/<BOOK>/ that belong in the burrito:
// the book's .json files, and the videos in each chapter folder.
const scanBookFiles = (fs, path, ingredientsDir) => {
  const files = [];
  fs.readdirSync(ingredientsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && BOOK_FOLDER.test(entry.name))
    .forEach((bookDir) => {
      const bookId = bookDir.name.toUpperCase();
      const bookPath = path.join(ingredientsDir, bookDir.name);
      fs.readdirSync(bookPath, { withFileTypes: true }).forEach((entry) => {
        if (entry.isFile() && /\.json$/i.test(entry.name)) {
          files.push({
            key: toBurritoPath('video', 'ingredients', bookDir.name, entry.name),
            filePath: path.join(bookPath, entry.name),
            base: { mimeType: 'application/json', role: 'x-scribe' },
          });
        } else if (entry.isDirectory()) {
          const chapterPath = path.join(bookPath, entry.name);
          fs.readdirSync(chapterPath, { withFileTypes: true })
            .filter((file) => file.isFile() && isVideoFile(file.name))
            .forEach((file) => {
              files.push({
                key: toBurritoPath('video', 'ingredients', bookDir.name, entry.name, file.name),
                filePath: path.join(chapterPath, file.name),
                base: describeVideoFile(bookId, file.name),
              });
            });
        }
      });
    });
  return files;
};

const runSync = async (projectPath, { changedFile, rehashAll } = {}) => {
  try {
    const fs = window.require('fs');
    const path = window.require('path');
    const crypto = window.require('crypto');

    const metadataPath = path.join(projectPath, 'metadata.json');
    const ingredientsDir = path.join(projectPath, 'video', 'ingredients');
    if (!fs.existsSync(metadataPath) || !fs.existsSync(ingredientsDir)) {
      return false;
    }

    const snapshot = readMetadata(fs, metadataPath);
    if (flavorKey(snapshot?.type?.flavorType?.flavor?.name) !== VIDEO_INTERNAL_FLAVOR) {
      return false;
    }
    // In memory only: lets entries written with backslash keys be found by their normalized key.
    migrateVideoBurrito(snapshot);
    const known = snapshot.ingredients || {};

    // Files directly in video/ingredients/ that are already listed (versification.json, license.md,
    // ag-settings.json) are re-hashed every time: they are small and change without changing size.
    const listedTopLevel = Object.keys(known)
      .filter((key) => key.startsWith(INGREDIENTS_PREFIX) && key.split('/').length === 3)
      .map((key) => ({ key, filePath: path.join(projectPath, key), base: null }));
    const jobs = [...scanBookFiles(fs, path, ingredientsDir), ...listedTopLevel];

    // Hash one file at a time, so a project with hundreds of takes never opens them all at once.
    const results = [];
    await jobs.reduce((chain, job) => chain.then(async () => {
      try {
        const stat = fs.statSync(job.filePath);
        const previous = known[job.key];
        const isVideo = Boolean(job.base?.mimeType?.startsWith('video/'));
        const justWritten = changedFile && path.resolve(changedFile) === path.resolve(job.filePath);
        // A video whose size is unchanged is not read again, unless it was just written or a full
        // re-hash was asked for.
        const reuse = isVideo && !rehashAll && !justWritten && previous
          && previous.size === stat.size && MD5_HEX.test(previous.checksum?.md5 || '');
        const md5 = reuse ? previous.checksum.md5 : await hashFile(fs, crypto, job.filePath);
        results.push({ ...job, size: stat.size, md5 });
      } catch (err) {
        logger.warn('syncVideoIngredients.js', `Skipped ${job.key}: ${err.message}`);
      }
    }), Promise.resolve());

    // Everything below is synchronous: re-read the file right before writing it, so changes made by
    // other code while the hashing was running (for example a comments file) are not lost.
    const latest = readMetadata(fs, metadataPath);
    let changed = migrateVideoBurrito(latest);
    latest.ingredients = latest.ingredients || {};
    const { ingredients } = latest;

    results.forEach((result) => {
      if (!fs.existsSync(result.filePath)) {
        return; // deleted while it was being hashed
      }
      const existing = ingredients[result.key] || {};
      const entry = {
        ...existing,
        checksum: { md5: result.md5 },
        size: result.size,
        ...result.base,
      };
      if (JSON.stringify(existing) !== JSON.stringify(entry)) {
        ingredients[result.key] = entry;
        changed = true;
      }
    });

    // Drop entries inside a book folder whose file no longer exists (deleted or re-recorded takes).
    Object.keys(ingredients).forEach((key) => {
      const insideBookFolder = key.startsWith(INGREDIENTS_PREFIX) && key.split('/').length > 3;
      if (insideBookFolder && !fs.existsSync(path.join(projectPath, key))) {
        delete ingredients[key];
        changed = true;
      }
    });

    if (changed) {
      fs.writeFileSync(metadataPath, JSON.stringify(latest));
      logger.debug('syncVideoIngredients.js', 'Updated the ingredients in metadata.json');
    }
    return changed;
  } catch (err) {
    logger.error('syncVideoIngredients.js', `Could not sync the video ingredients: ${err?.message || err}`);
    return false;
  }
};

// One sync at a time per project, so two overlapping calls cannot interleave.
const queues = new Map();

/**
 * Makes the ingredients of a video project's metadata.json match the files on disk: lists every
 * video and book .json file with its MD5, size and scope, removes entries for files that are gone,
 * refreshes the small listed files, and brings old metadata up to the current flavor.
 * Never rejects: a failure is logged and the result is false.
 * @param {string} projectPath folder that contains metadata.json and video/
 * @param {object} [options]
 * @param {string} [options.changedFile] absolute path of a file that was just written
 * @param {boolean} [options.rehashAll] re-read every video, even if its size is unchanged
 * @returns {Promise<boolean>} true when metadata.json was written
 */
const syncVideoIngredients = (projectPath, options = {}) => {
  const previous = queues.get(projectPath) || Promise.resolve();
  const next = previous.then(() => runSync(projectPath, options));
  queues.set(projectPath, next);
  return next;
};

export default syncVideoIngredients;
