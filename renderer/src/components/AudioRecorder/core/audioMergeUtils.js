import * as logger from '../../../logger';

const toWav = require('audiobuffer-to-wav');

export function getDefaultAudioForVerse(chapter, verseNumber, audioPath) {
  try {
    const fs = window.require('fs');
    const path = require('path');

    if (!fs.existsSync(audioPath)) {
      return { exists: false };
    }

    const files = fs.readdirSync(audioPath);
    const escapedVerse = String(verseNumber).replace(/[-]/g, '\\-');
    const defaultPattern = new RegExp(`^${chapter}_${escapedVerse}_(\\d+)_default\\.(mp3|wav|webm)$`);

    const defaultFile = files.find((file) => defaultPattern.test(file));

    if (defaultFile) {
      const match = defaultFile.match(defaultPattern);
      const takeNumber = match ? match[1] : '1';

      return {
        exists: true,
        filename: defaultFile,
        path: path.join(audioPath, defaultFile),
        takeNumber,
      };
    }

    return { exists: false };
  } catch (err) {
    logger.error('Error checking default audio:', err);
    return { exists: false };
  }
}

export function getAllAudioForVerse(chapter, verseNumber, audioPath) {
  try {
    const fs = window.require('fs');
    const path = require('path');

    if (!fs.existsSync(audioPath)) {
      return [];
    }

    const files = fs.readdirSync(audioPath);
    const escapedVerse = String(verseNumber).replace(/[-]/g, '\\-');
    const versePattern = new RegExp(`^${chapter}_${escapedVerse}_(\\d+)(_default)?\\.(mp3|wav|webm)$`);

    const verseFiles = files
      .filter((file) => versePattern.test(file))
      .map((file) => {
        const match = file.match(versePattern);
        const takeNumber = match[1];
        const isDefault = !!match[2];

        return {
          filename: file,
          path: path.join(audioPath, file),
          takeNumber,
          isDefault,
        };
      });

    return verseFiles;
  } catch (err) {
    logger.error('Error getting all audio for verse:', err);
    return [];
  }
}

export function deleteAllAudioForVerse(chapter, verseNumber, audioPath) {
  try {
    const fs = window.require('fs');
    const path = require('path');

    if (!fs.existsSync(audioPath)) {
      return false;
    }

    const files = fs.readdirSync(audioPath);
    const escapedVerse = String(verseNumber).replace(/[-]/g, '\\-');
    const pattern = new RegExp(`^${chapter}_${escapedVerse}_.*\\.(mp3|wav|webm|m4a)$`);

    let deletedCount = 0;
    files.forEach((file) => {
      if (pattern.test(file)) {
        const filePath = path.join(audioPath, file);
        fs.unlinkSync(filePath);
        logger.debug(`Deleted audio: ${file}`);
        deletedCount += 1;
      }
    });

    logger.debug(`Deleted ${deletedCount} audio file(s) for verse ${verseNumber}`);
    return deletedCount > 0;
  } catch (err) {
    logger.error('Error deleting audio:', err);
    return false;
  }
}

export function hasAnyAudioForVerse(chapter, verseNumber, audioPath) {
  const audioFiles = getAllAudioForVerse(chapter, verseNumber, audioPath);
  return audioFiles.length > 0;
}

export async function mergeAudioFiles(
  audioFiles,
  chapter,
  audioPath,
  newVerseNumber,
  allVerseNumbers,
) {
  logger.debug('=== Starting Audio Merge ===', {
    audioFiles,
    newVerseNumber,
    allVerseNumbers,
  });

  try {
    const path = require('path');
    const fs = window.require('fs');
    const context = new window.AudioContext();

    if (!audioFiles || audioFiles.length === 0) {
      logger.warn('No audio files provided for merge');
      return {
        success: false,
        error: 'No audio files provided',
        hasAudio: false,
      };
    }

    const loadedBuffers = await Promise.all(
      audioFiles.map(async (audioFile) => {
        if (!fs.existsSync(audioFile.path)) {
          logger.warn(`Audio file not found: ${audioFile.path}`);
          return null;
        }

        try {
          const response = await fetch(`file://${audioFile.path}`);
          const arrayBuffer = await response.arrayBuffer();
          const audioBuffer = await context.decodeAudioData(arrayBuffer);

          logger.debug(`Loaded: ${audioFile.filename || audioFile.path} (${audioBuffer.duration}s)`);

          return {
            buffer: audioBuffer,
            verseNumber: audioFile.verseNumber,
            timestamps: audioFile.timestamps || null,
            isMerged: audioFile.isMerged || false,
          };
        } catch (err) {
          logger.error(`Failed to load: ${audioFile.path}`, err);
          return null;
        }
      }),
    );

    const buffers = loadedBuffers.filter(Boolean);

    if (buffers.length === 0) {
      return {
        success: false,
        error: 'No valid audio files loaded',
      };
    }

    const totalLength = buffers.reduce(
      (total, item) => total + item.buffer.length,
      0,
    );

    const output = context.createBuffer(
      buffers[0].buffer.numberOfChannels,
      totalLength,
      buffers[0].buffer.sampleRate,
    );

    const timestamps = [];
    let offset = 0;
    let currentTime = 0;

    allVerseNumbers.forEach((verseNum) => {
      const matching = buffers.find((item) => {
        const itemVerse = item.verseNumber;

        if (itemVerse.toString() === verseNum.toString()) {
          return true;
        }

        if (typeof itemVerse === 'string' && itemVerse.includes('-')) {
          const [start, end] = itemVerse.split('-').map(Number);
          return verseNum >= start && verseNum <= end;
        }

        return false;
      });

      if (matching) {
        const { buffer, timestamps: itemTimestamps, isMerged } = matching;

        if (isMerged && itemTimestamps) {
          const verseTimestamp = itemTimestamps.find((t) => t.verse === verseNum);

          if (verseTimestamp) {
            timestamps.push({
              verse: verseNum,
              start: currentTime,
              duration: verseTimestamp.duration,
            });

            const startFrame = Math.floor(verseTimestamp.start * buffer.sampleRate);
            const frameCount = Math.floor(verseTimestamp.duration * buffer.sampleRate);
            const actualFrameCount = Math.min(
              frameCount,
              buffer.length - startFrame,
            );

            for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
              const sourceData = buffer.getChannelData(channel);
              const targetData = output.getChannelData(channel);

              for (let i = 0; i < actualFrameCount; i += 1) {
                targetData[offset + i] = sourceData[startFrame + i];
              }
            }

            offset += actualFrameCount;
            currentTime += verseTimestamp.duration;
          }
        } else {
          const duration = buffer.duration;

          timestamps.push({
            verse: verseNum,
            start: currentTime,
            duration,
          });

          for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
            output.copyToChannel(buffer.getChannelData(channel), channel, offset);
          }

          offset += buffer.length;
          currentTime += duration;
        }
      } else {
        logger.warn(`No audio for verse ${verseNum} - verse will have no audio in merge`);
      }
    });

    logger.debug('Generated timestamps:', timestamps);

    const wavData = toWav(output);
    const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });

    const mergedFilename = `${chapter}_${newVerseNumber}_1_default.mp3`;
    const mergedPath = path.join(audioPath, mergedFilename);

    const arrayBuffer = await blob.arrayBuffer();
    fs.writeFileSync(mergedPath, Buffer.from(arrayBuffer));

    logger.debug(`Merged audio saved: ${mergedFilename} (${output.duration}s)`);

    return {
      success: true,
      filename: mergedFilename,
      path: mergedPath,
      duration: output.duration,
      timestamps,
    };
  } catch (err) {
    logger.error('Error merging audio files:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}

export async function splitMergedAudio(
  mergedAudioPath,
  timestamps,
  chapter,
  audioPath,
) {
  logger.debug('=== Starting Audio Split ===', { mergedAudioPath, timestamps });

  try {
    const context = new window.AudioContext();

    const response = await fetch(`file://${mergedAudioPath}`);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    logger.debug(`Loaded merged audio: ${audioBuffer.duration}s`);

    const splitJobs = timestamps
      .map((timestamp) => {
        const { verse, start, duration } = timestamp;

        const startOffset = Math.floor(start * audioBuffer.sampleRate);
        const frameCount = Math.floor(duration * audioBuffer.sampleRate);
        const actualFrameCount = Math.min(
          frameCount,
          audioBuffer.length - startOffset,
        );

        if (actualFrameCount <= 0) {
          logger.warn(`Invalid frame count for verse ${verse}, skipping`);
          return null;
        }

        const verseBuffer = context.createBuffer(
          audioBuffer.numberOfChannels,
          actualFrameCount,
          audioBuffer.sampleRate,
        );

        for (let channel = 0; channel < audioBuffer.numberOfChannels; channel += 1) {
          const sourceData = audioBuffer.getChannelData(channel);
          const targetData = verseBuffer.getChannelData(channel);

          for (let i = 0; i < actualFrameCount; i += 1) {
            targetData[i] = sourceData[startOffset + i];
          }
        }

        const wavData = toWav(verseBuffer);
        const blob = new Blob([new DataView(wavData)], { type: 'audio/wav' });

        return {
          verseNumber: verse,
          filename: `${chapter}_${verse}_1_default.mp3`,
          duration: verseBuffer.duration,
          blob,
        };
      })
      .filter(Boolean);

    const path = require('path');
    const fs = window.require('fs');

    await Promise.all(
      splitJobs.map(async (job) => {
        const filePath = path.join(audioPath, job.filename);
        const buffer = Buffer.from(await job.blob.arrayBuffer());
        fs.writeFileSync(filePath, buffer);
        logger.debug(`Split audio saved: ${job.filename}`);
      }),
    );

    logger.debug(`Split complete: ${splitJobs.length} files created`);

    return {
      success: true,
      files: splitJobs.map((f) => ({
        verseNumber: f.verseNumber,
        filename: f.filename,
        duration: f.duration,
      })),
    };
  } catch (err) {
    logger.error('Error splitting audio:', err);
    return {
      success: false,
      error: err.message,
    };
  }
}
