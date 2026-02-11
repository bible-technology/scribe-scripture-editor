import * as logger from '../../../../logger';

const path = require('path');

export function detectDefaultAudioExport(incomingPath, fs) {
  const markerPath = path.join(
    incomingPath,
    'ingredients',
    '.scribe_default_audio_export',
  );
  return fs.existsSync(markerPath);
}

function getAudioFilesInDir(audioDir, fs) {
  if (!fs.existsSync(audioDir)) { return []; }
  return fs
    .readdirSync(audioDir)
    .filter((file) => file.endsWith('.mp3') || file.endsWith('.wav'));
}

function parseAudioFilename(filename) {
  const nameWithoutExt = filename.replace(/\.(mp3|wav)$/i, '');
  const extension = filename.match(/\.(mp3|wav)$/i)?.[0] || '.mp3';

  const isDefault = nameWithoutExt.endsWith('_default');
  const baseName = isDefault
    ? nameWithoutExt.replace('_default', '')
    : nameWithoutExt;

  const parts = baseName.split('_');
  if (parts.length < 3) { return null; }

  return {
    storyNum: parts[0],
    segmentNum: parts[1],
    takeNum: parts[2],
    isDefault,
    extension,
    originalFilename: filename,
  };
}

function segmentHasAudio(currentAudioDir, segmentNum, fs) {
  if (!fs.existsSync(currentAudioDir)) { return false; }

  return getAudioFilesInDir(currentAudioDir, fs).some((file) => {
    const parsed = parseAudioFilename(file);
    return parsed && parsed.segmentNum === segmentNum;
  });
}

function generateDefaultFilename(parsed) {
  return `${parsed.storyNum}_${parsed.segmentNum}_1_default${parsed.extension}`;
}

export async function importMissingDefaultAudio(
  incomingPath,
  currentProjectPath,
  fs,
  fse,
) {
  logger.debug(
    'mergeObsAudioUtils.js',
    'Starting import of missing default audio files',
  );

  const result = {
    success: true,
    importedCount: 0,
    skippedCount: 0,
    errors: [],
  };

  try {
    if (!detectDefaultAudioExport(incomingPath, fs)) {
      logger.debug(
        'mergeObsAudioUtils.js',
        'No default audio export marker found',
      );
      return result;
    }

    const incomingAudioBase = path.join(
      incomingPath,
      'ingredients',
      'audio',
    );
    const currentAudioBase = path.join(
      currentProjectPath,
      'ingredients',
      'audio',
    );

    if (!fs.existsSync(incomingAudioBase)) { return result; }

    const storyDirs = fs
      .readdirSync(incomingAudioBase, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const copyTasks = [];

    storyDirs.forEach((storyNum) => {
      const incomingStoryPath = path.join(incomingAudioBase, storyNum);
      const currentStoryPath = path.join(currentAudioBase, storyNum);

      const incomingFiles = getAudioFilesInDir(incomingStoryPath, fs);

      incomingFiles.forEach((audioFile) => {
        const parsed = parseAudioFilename(audioFile);

        if (!parsed) {
          logger.warn(
            'mergeObsAudioUtils.js',
            `Could not parse filename: ${audioFile}`,
          );
          result.errors.push(`Could not parse filename: ${audioFile}`);
          return;
        }

        if (segmentHasAudio(currentStoryPath, parsed.segmentNum, fs)) {
          result.skippedCount += 1;
          return;
        }

        if (!fs.existsSync(currentStoryPath)) {
          fs.mkdirSync(currentStoryPath, { recursive: true });
        }

        const destFilename = generateDefaultFilename(parsed);
        const sourcePath = path.join(incomingStoryPath, audioFile);
        const destPath = path.join(currentStoryPath, destFilename);

        copyTasks.push(
          fse.copy(sourcePath, destPath).then(() => {
            result.importedCount += 1;
            logger.debug(
              'mergeObsAudioUtils.js',
              `Imported ${audioFile} → ${destFilename}`,
            );
          }),
        );
      });
    });

    await Promise.all(copyTasks);

    logger.debug(
      'mergeObsAudioUtils.js',
      `Audio import completed: ${result.importedCount} imported, ${result.skippedCount} skipped`,
    );
  } catch (error) {
    logger.error(
      'mergeObsAudioUtils.js',
      `Error during audio import: ${error}`,
    );
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

export async function replaceWithDefaultAudio(
  incomingPath,
  currentProjectPath,
  fs,
  fse,
) {
  logger.debug(
    'obsAudioUtils.js',
    'Starting REPLACE with default audio files',
  );

  const result = {
    success: true,
    replacedCount: 0,
    errors: [],
  };

  try {
    if (!detectDefaultAudioExport(incomingPath, fs)) {
      logger.debug(
        'obsAudioUtils.js',
        'No default audio export marker found',
      );
      return result;
    }

    const incomingAudioBase = path.join(
      incomingPath,
      'ingredients',
      'audio',
    );
    const currentAudioBase = path.join(
      currentProjectPath,
      'ingredients',
      'audio',
    );

    if (!fs.existsSync(incomingAudioBase)) {
      logger.warn('obsAudioUtils.js', 'No incoming audio directory found');
      return result;
    }

    if (fs.existsSync(currentAudioBase)) {
      logger.debug('obsAudioUtils.js', 'Clearing existing audio folder');
      fs.rmSync(currentAudioBase, { recursive: true, force: true });
    }

    fs.mkdirSync(currentAudioBase, { recursive: true });

    const storyDirs = fs
      .readdirSync(incomingAudioBase, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    const copyTasks = [];

    storyDirs.forEach((storyNum) => {
      const incomingStoryPath = path.join(incomingAudioBase, storyNum);
      const currentStoryPath = path.join(currentAudioBase, storyNum);

      if (!fs.existsSync(currentStoryPath)) {
        fs.mkdirSync(currentStoryPath, { recursive: true });
      }

      const incomingFiles = getAudioFilesInDir(incomingStoryPath, fs);

      incomingFiles.forEach((audioFile) => {
        const parsed = parseAudioFilename(audioFile);

        if (!parsed) {
          logger.warn(
            'obsAudioUtils.js',
            `Could not parse filename: ${audioFile}`,
          );
          result.errors.push(`Could not parse filename: ${audioFile}`);
          return;
        }

        const destFilename = generateDefaultFilename(parsed);
        const sourcePath = path.join(incomingStoryPath, audioFile);
        const destPath = path.join(currentStoryPath, destFilename);

        copyTasks.push(
          fse.copy(sourcePath, destPath).then(() => {
            result.replacedCount += 1;
            logger.debug(
              'obsAudioUtils.js',
              `Replaced ${audioFile} → ${destFilename}`,
            );
          }),
        );
      });
    });

    await Promise.all(copyTasks);

    logger.debug(
      'obsAudioUtils.js',
      `Audio replacement completed: ${result.replacedCount} files imported`,
    );
  } catch (error) {
    logger.error(
      'obsAudioUtils.js',
      `Error during audio replacement: ${error}`,
    );
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}

export async function renameToDefaultAudio(
  projectPath,
  fs,
) {
  logger.debug(
    'obsAudioUtils.js',
    'Starting renaming audio files to default format (NEW import)',
  );

  const result = {
    success: true,
    renamedCount: 0,
    errors: [],
  };

  try {
    if (!detectDefaultAudioExport(projectPath, fs)) {
      logger.debug(
        'obsAudioUtils.js',
        'No default audio export marker found',
      );
      return result;
    }

    const audioBasePath = path.join(projectPath, 'ingredients', 'audio');

    if (!fs.existsSync(audioBasePath)) {
      logger.warn('obsAudioUtils.js', 'No audio directory found');
      return result;
    }

    const storyDirs = fs
      .readdirSync(audioBasePath, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    storyDirs.forEach((storyNum) => {
      const storyPath = path.join(audioBasePath, storyNum);
      const audioFiles = getAudioFilesInDir(storyPath, fs);

      audioFiles.forEach((audioFile) => {
        const parsed = parseAudioFilename(audioFile);

        if (!parsed) {
          logger.warn(
            'obsAudioUtils.js',
            `Could not parse filename: ${audioFile}`,
          );
          result.errors.push(`Could not parse filename: ${audioFile}`);
          return;
        }

        if (!parsed.isDefault) {
          const newFilename = generateDefaultFilename(parsed);
          const oldPath = path.join(storyPath, audioFile);
          const newPath = path.join(storyPath, newFilename);

          try {
            fs.renameSync(oldPath, newPath);
            result.renamedCount += 1;
            logger.debug(
              'obsAudioUtils.js',
              `Renamed ${audioFile} → ${newFilename}`,
            );
          } catch (error) {
            logger.error(
              'obsAudioUtils.js',
              `Failed to rename ${audioFile}: ${error}`,
            );
            result.errors.push(`Failed to rename ${audioFile}: ${error.message}`);
          }
        }
      });
    });

    const markerPath = path.join(projectPath, 'ingredients', '.scribe_default_audio_export');
    if (fs.existsSync(markerPath)) {
      fs.unlinkSync(markerPath);
      logger.debug('obsAudioUtils.js', 'Removed default audio export marker');
    }

    logger.debug(
      'obsAudioUtils.js',
      `Audio renaming completed: ${result.renamedCount} files renamed`,
    );
  } catch (error) {
    logger.error(
      'obsAudioUtils.js',
      `Error during audio renaming: ${error}`,
    );
    result.success = false;
    result.errors.push(error.message);
  }

  return result;
}
