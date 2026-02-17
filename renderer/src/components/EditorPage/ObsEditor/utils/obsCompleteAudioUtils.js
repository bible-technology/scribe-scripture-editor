import * as logger from '../../../../logger';

const path = require('path');

export function detectObsCompleteAudio(metadata) {
  if (!metadata?.ingredients) { return false; }

  return 'ingredients/obs_internal_audio.zip' in metadata.ingredients
    || 'ingredients\\obs_internal_audio.zip' in metadata.ingredients;
}

export async function extractObsAudioZipToDestination(zipSourcePath, audioDestinationPath, fs) {
  try {
    const AdmZip = window.require('adm-zip');

    if (!fs.existsSync(zipSourcePath)) {
      logger.warn('obsCompleteAudioUtils.js', `obs_internal_audio.zip not found at ${zipSourcePath}`);
      return { success: false, error: 'Audio zip not found' };
    }

    logger.debug('obsCompleteAudioUtils.js', `Extracting to ${audioDestinationPath}`);

    if (!fs.existsSync(audioDestinationPath)) {
      fs.mkdirSync(audioDestinationPath, { recursive: true });
    }

    const zip = new AdmZip(zipSourcePath);
    zip.extractAllTo(audioDestinationPath, true);

    let extractedCount = 0;
    const storyDirs = fs.readdirSync(audioDestinationPath, { withFileTypes: true })
      .filter((item) => item.isDirectory());

    storyDirs.forEach((dir) => {
      const storyPath = path.join(audioDestinationPath, dir.name);
      const files = fs.readdirSync(storyPath).filter((f) => /\.(mp3|wav)$/i.test(f));
      extractedCount += files.length;
    });

    logger.debug('obsCompleteAudioUtils.js', `Extracted ${extractedCount} audio files`);
    return { success: true, extractedCount };
  } catch (error) {
    logger.error('obsCompleteAudioUtils.js', `Error extracting: ${error}`);
    return { success: false, error: error.message };
  }
}

export async function extractAndCleanupObsAudio(projectPath, fs) {
  const zipPath = path.join(projectPath, 'ingredients', 'obs_internal_audio.zip');
  const audioDestPath = path.join(projectPath, 'ingredients', 'audio');

  if (!fs.existsSync(zipPath)) {
    logger.warn('obsCompleteAudioUtils.js', 'No zip to extract');
    return { success: false, error: 'Zip not found' };
  }

  logger.debug('obsCompleteAudioUtils.js', 'Extracting and cleaning up OBS complete audio');

  try {
    const extractResult = await extractObsAudioZipToDestination(zipPath, audioDestPath, fs);

    if (!extractResult.success) { return extractResult; }

    fs.unlinkSync(zipPath);
    logger.debug('obsCompleteAudioUtils.js', 'Deleted obs_internal_audio.zip');

    const metadataPath = path.join(projectPath, 'metadata.json');
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

    delete metadata.ingredients['ingredients/obs_internal_audio.zip'];
    delete metadata.ingredients['ingredients\\obs_internal_audio.zip'];

    fs.writeFileSync(metadataPath, JSON.stringify(metadata));
    logger.debug('obsCompleteAudioUtils.js', 'Updated metadata');

    return { success: true, extractedCount: extractResult.extractedCount };
  } catch (error) {
    logger.error('obsCompleteAudioUtils.js', `Error: ${error}`);
    return { success: false, error: error.message };
  }
}

export async function replaceObsCompleteAudio(incomingPath, existingProjectPath, fs) {
  try {
    logger.debug('obsCompleteAudioUtils.js', 'Starting audio replacement');

    const zipPath = path.join(incomingPath, 'ingredients', 'obs_internal_audio.zip');
    const existingAudioPath = path.join(existingProjectPath, 'ingredients', 'audio');

    if (!fs.existsSync(zipPath)) {
      return { success: false, error: 'Audio zip not found' };
    }

    if (fs.existsSync(existingAudioPath)) {
      logger.debug('obsCompleteAudioUtils.js', 'Deleting existing audio');
      fs.rmSync(existingAudioPath, { recursive: true, force: true });
    }

    const extractResult = await extractObsAudioZipToDestination(zipPath, existingAudioPath, fs);

    if (extractResult.success) {
      logger.debug('obsCompleteAudioUtils.js', `Replaced with ${extractResult.extractedCount} files`);
      return { success: true, replacedCount: extractResult.extractedCount };
    }

    return extractResult;
  } catch (error) {
    logger.error('obsCompleteAudioUtils.js', `Error in replace: ${error}`);
    return { success: false, error: error.message };
  }
}

function parseAudioFileName(filename) {
  const nameWithoutExt = filename.replace(/\.(mp3|wav)$/i, '');
  const parts = nameWithoutExt.split('_');
  if (parts.length < 3) { return null; }

  return {
    storyNum: parts[0],
    segmentNum: parts[1],
    takeNum: parts[2],
    isDefault: parts.length > 3 && parts[3] === 'default',
    filename,
  };
}

function getStoryAudioFiles(storyPath, fs) {
  try {
    if (!fs.existsSync(storyPath)) { return []; }
    return fs.readdirSync(storyPath)
      .filter((file) => /\.(mp3|wav)$/i.test(file))
      .map((file) => parseAudioFileName(file))
      .filter(Boolean);
  } catch (error) {
    logger.error('obsCompleteAudioUtils.js', `Error reading story audio: ${error}`);
    return [];
  }
}

export async function mergeObsCompleteAudio(incomingPath, existingPath, fs, fse) {
  try {
    logger.debug('obsCompleteAudioUtils.js', 'Starting audio merge');

    const zipPath = path.join(incomingPath, 'ingredients', 'obs_internal_audio.zip');
    const existingAudioPath = path.join(existingPath, 'ingredients', 'audio');

    if (!fs.existsSync(zipPath)) {
      logger.debug('obsCompleteAudioUtils.js', 'No zip to merge');
      return {
        success: true, importedCount: 0, modifiedCount: 0, errors: [],
      };
    }

    const tempExtractPath = path.join(existingPath, '.temp_audio_extract');

    if (fs.existsSync(tempExtractPath)) {
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
    }

    const extractResult = await extractObsAudioZipToDestination(zipPath, tempExtractPath, fs);

    if (!extractResult.success) {
      logger.error('obsCompleteAudioUtils.js', 'Failed to extract for merge');
      return {
        success: false, importedCount: 0, modifiedCount: 0, errors: [{ error: extractResult.error }],
      };
    }

    if (!fs.existsSync(existingAudioPath)) {
      fs.mkdirSync(existingAudioPath, { recursive: true });
    }

    const storyDirs = fs.readdirSync(tempExtractPath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    let importedCount = 0;
    let modifiedCount = 0;
    const errors = [];

    await Promise.all(
      storyDirs.map(async (storyNum) => {
        const incomingStoryPath = path.join(tempExtractPath, storyNum);
        const existingStoryPath = path.join(existingAudioPath, storyNum);

        if (!fs.existsSync(existingStoryPath)) {
          fs.mkdirSync(existingStoryPath, { recursive: true });
        }

        const incomingAudioFiles = getStoryAudioFiles(incomingStoryPath, fs);
        const existingAudioFiles = getStoryAudioFiles(existingStoryPath, fs);

        const existingSegments = new Map();

        existingAudioFiles.forEach((file) => {
          const segmentKey = `${file.storyNum}_${file.segmentNum}`;
          if (!existingSegments.has(segmentKey)) {
            existingSegments.set(segmentKey, { takes: [], hasDefault: false });
          }
          const segment = existingSegments.get(segmentKey);
          segment.takes.push(parseInt(file.takeNum, 10));
          if (file.isDefault) { segment.hasDefault = true; }
        });

        await Promise.all(
          incomingAudioFiles.map(async (incomingFile) => {
            try {
              const segmentKey = `${incomingFile.storyNum}_${incomingFile.segmentNum}`;
              const existingSegment = existingSegments.get(segmentKey);
              const incomingTakeNum = parseInt(incomingFile.takeNum, 10);

              const takeExists = existingSegment?.takes.includes(incomingTakeNum);

              if (!takeExists) {
                let newFilename = incomingFile.filename;

                if (incomingFile.isDefault && existingSegment?.hasDefault) {
                  newFilename = newFilename.replace('_default', '');
                  modifiedCount += 1;
                }

                const sourcePath = path.join(incomingStoryPath, incomingFile.filename);
                const destPath = path.join(existingStoryPath, newFilename);

                await fse.copy(sourcePath, destPath);

                importedCount += 1;

                if (!existingSegment) {
                  existingSegments.set(segmentKey, {
                    takes: [incomingTakeNum],
                    hasDefault: incomingFile.isDefault,
                  });
                } else {
                  existingSegment.takes.push(incomingTakeNum);
                  if (incomingFile.isDefault && !existingSegment.hasDefault) {
                    existingSegment.hasDefault = true;
                  }
                }
              }
            } catch (err) {
              errors.push({ file: incomingFile.filename, error: err.message });
            }
          }),
        );
      }),
    );

    if (fs.existsSync(tempExtractPath)) {
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
    }

    const existingZipPath = path.join(existingPath, 'ingredients', 'obs_internal_audio.zip');

    if (fs.existsSync(existingZipPath)) {
      try {
        fs.unlinkSync(existingZipPath);
        logger.debug('obsCompleteAudioUtils.js', 'Deleted obs_internal_audio.zip from existing project after merge');

        const metadataPath = path.join(existingPath, 'metadata.json');
        if (fs.existsSync(metadataPath)) {
          const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

          delete metadata.ingredients['ingredients/obs_internal_audio.zip'];
          delete metadata.ingredients['ingredients\\obs_internal_audio.zip'];

          fs.writeFileSync(metadataPath, JSON.stringify(metadata));
          logger.debug('obsCompleteAudioUtils.js', 'Updated metadata after zip deletion');
        }
      } catch (cleanupError) {
        logger.error('obsCompleteAudioUtils.js', `Failed to delete zip: ${cleanupError}`);
      }
    }

    logger.debug('obsCompleteAudioUtils.js', `Merge complete. Imported: ${importedCount}, Modified: ${modifiedCount}`);
    return {
      success: true, importedCount, modifiedCount, errors,
    };
  } catch (error) {
    logger.error('obsCompleteAudioUtils.js', `Error in merge: ${error}`);

    const tempExtractPath = path.join(existingPath, '.temp_audio_extract');
    if (fs.existsSync(tempExtractPath)) {
      fs.rmSync(tempExtractPath, { recursive: true, force: true });
    }

    return {
      success: false, importedCount: 0, modifiedCount: 0, errors: [{ error: error.message }],
    };
  }
}
