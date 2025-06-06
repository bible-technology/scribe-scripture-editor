/* eslint-disable no-useless-escape */
import { mergeAudio } from '@/components/AudioRecorder/core/audioUtils';
import * as logger from '../../../logger';

const md5 = require('md5');
const path = require('path');

// Function to walk through OBS audio directory structure
export async function walkObsAudio(dir, pathModule, fs) {
  logger.debug('ObsExportUtils.js', `Walking through OBS audio dir: ${dir}`);
  let files = await fs.readdirSync(dir);
  files = await Promise.all(files.map(async (file) => {
    const filePath = pathModule.join(dir, file);
    const stats = await fs.statSync(filePath);
    if (stats.isDirectory()) {
      return walkObsAudio(filePath, pathModule, fs);
    }
    if (stats.isFile()) {
      return filePath;
    }
    return null;
  }));
  return files.reduce((all, folderContents) => all.concat(folderContents), []).filter(Boolean);
}

// Function to copy MD files for OBS text export
const copyObsTextFiles = async (folder, destinationPath, fs, fse) => {
  logger.debug('ObsExportUtils.js', 'Copying OBS text files');
  const ingredientsPath = path.join(folder, 'ingredients');
  const files = await fs.readdirSync(ingredientsPath);

  // Copy all .md files except LICENSE.md and scribe-settings.json
  const textFiles = files.filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');

  await Promise.all(textFiles.map(async (file) => {
    await fse.copy(
      path.join(ingredientsPath, file),
      path.join(destinationPath, 'ingredients', file),
    );
  }));
};

// Export OBS Text Only (MD files)
export const exportObsTextOnly = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS text only');
  const fse = window.require('fs-extra');
  const burrito = { ...metadata };

  // Remove audio-related ingredients from burrito
  Object.keys(burrito.ingredients).forEach((key) => {
    if (key.includes('audio/') || key.includes('.mp3') || key.includes('.wav')) {
      delete burrito.ingredients[key];
    }
  });

  try {
    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);

    // Copy text files
    await copyObsTextFiles(folder, exportPath, fs, fse);

    // Update burrito for text files only
    const ingredientsPath = pathModule.join(folder, 'ingredients');
    const files = await fs.readdirSync(ingredientsPath);
    const textFiles = files.filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');

    await Promise.all(textFiles.map(async (file) => {
      const filePath = pathModule.join(ingredientsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      burrito.ingredients[pathModule.join('ingredients', file)] = {
        checksum: {
          md5: md5(content),
        },
        mimeType: file.endsWith('.md') ? 'text/markdown' : 'application/json',
        size: stats.size,
        role: file === 'LICENSE.md' ? 'x-licence' : undefined,
      };
    }));

    // Write updated metadata
    await fs.writeFileSync(pathModule.join(exportPath, 'metadata.json'), JSON.stringify(burrito));

    ExportActions.resetExportProgress();
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  } catch (error) {
    logger.error('ObsExportUtils.js', `Failed to export OBS text only: ${error}`);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  }
};

// Export OBS Complete (Audio + Text)
export const exportObsComplete = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS complete project');
  const fse = window.require('fs-extra');
  const burrito = { ...metadata };

  try {
    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);

    // Copy everything
    await fse.copy(pathModule.join(folder, 'ingredients'), pathModule.join(exportPath, 'ingredients'));

    // Update burrito checksums for all files
    const allFiles = await walkObsAudio(pathModule.join(folder, 'ingredients'), pathModule, fs);

    ExportActions.setTotalExports(allFiles.length + 1);

    await Promise.all(allFiles.map(async (file) => {
      const relativePath = file.split(/[\/\\]ingredients[\/\\]/)[1];
      const content = fs.readFileSync(file, 'utf8');
      const stats = fs.statSync(file);

      burrito.ingredients[pathModule.join('ingredients', relativePath)] = {
        checksum: {
          md5: md5(content),
        },
        mimeType: (() => {
          if (file.endsWith('.mp3') || file.endsWith('.wav')) {
            return 'audio/mp3';
          }
          if (file.endsWith('.md')) {
            return 'text/markdown';
          }
          return 'application/json';
        })(),
        size: stats.size,
        role: file.endsWith('LICENSE.md') ? 'x-licence' : undefined,
      };

      ExportActions.setTotalExported((prev) => prev + 1);
    }));

    // Write updated metadata
    await fs.writeFileSync(pathModule.join(exportPath, 'metadata.json'), JSON.stringify(burrito));

    ExportActions.setTotalExported((prev) => prev + 1);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  } catch (error) {
    logger.error('ObsExportUtils.js', `Failed to export OBS complete: ${error}`);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  }
};

// Helper function to write audio file (reused from existing code)
export async function writeRecfile(file, filePath, fs) {
  logger.debug('ObsExportUtils.js', `Writing audio file: ${filePath}`);
  return new Promise((resolve) => {
    const fileReader = new FileReader();
    fileReader.onload = async function fileReaderOnLoad() {
      await fs.writeFileSync(filePath, Buffer.from(new Uint8Array(this.result)));
      resolve(Buffer.from(new Uint8Array(this.result)));
    };
    fileReader.readAsArrayBuffer(file);
  });
}

// Export OBS Combined Stories Audio (merge segments per story)
export const exportObsCombinedStories = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS combined stories audio');
  const fse = window.require('fs-extra');
  const burrito = { ...metadata };

  try {
    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);
    const audioBasePath = pathModule.join(folder, 'ingredients', 'audio');

    // First copy text files
    await copyObsTextFiles(folder, exportPath, fs, fse);

    // Remove existing audio ingredients from burrito
    Object.keys(burrito.ingredients).forEach((key) => {
      if (key.includes('audio/')) {
        delete burrito.ingredients[key];
      }
    });

    // Get all story directories
    const storyDirs = await fs.readdirSync(audioBasePath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    ExportActions.setTotalExports(storyDirs.length * 2); // Processing + writing for each story

    // Process each story
    await Promise.all(storyDirs.map(async (storyNum) => {
      const storyPath = pathModule.join(audioBasePath, storyNum);
      const audioFiles = await fs.readdirSync(storyPath);

      // Get all default audio files for this story, sorted by segment
      const defaultAudioFiles = audioFiles
        .filter((file) => file.includes('_default.'))
        .sort((a, b) => {
          const segmentA = parseInt(a.split('_')[1], 10);
          const segmentB = parseInt(b.split('_')[1], 10);
          return segmentA - segmentB;
        });

      if (defaultAudioFiles.length > 0) {
        ExportActions.setTotalExported((prev) => prev + 1);

        // Merge audio files for this story
        const mergedResult = await mergeAudio(
          defaultAudioFiles,
          storyPath,
          pathModule,
          storyNum,
          storyNum,
        );

        const [mergedAudioBlob, timeStampData] = mergedResult;

        // Create audio export directory
        const audioExportPath = pathModule.join(exportPath, 'ingredients', 'audio', storyNum);
        fs.mkdirSync(audioExportPath, { recursive: true });

        // Write merged audio file
        const mergedFileName = `${storyNum.padStart(2, '0')}.mp3`;
        const mergedFilePath = pathModule.join(audioExportPath, mergedFileName);

        await writeRecfile(mergedAudioBlob, mergedFilePath, fs);

        // Update burrito for merged audio
        const audioContent = fs.readFileSync(mergedFilePath, 'utf8');
        const audioStats = fs.statSync(mergedFilePath);

        burrito.ingredients[pathModule.join('ingredients', 'audio', storyNum, mergedFileName)] = {
          checksum: {
            md5: md5(audioContent),
          },
          mimeType: 'audio/mp3',
          size: audioStats.size,
          scope: {
            [storyNum]: [storyNum],
          },
        };

        // Write timestamp file
        const timestampDir = pathModule.join(exportPath, 'time stamps');
        fs.mkdirSync(timestampDir, { recursive: true });
        await fs.writeFileSync(
          pathModule.join(timestampDir, timeStampData[0]),
          timeStampData[1],
          'utf-8',
        );

        ExportActions.setTotalExported((prev) => prev + 1);
      }
    }));

    // Update text file ingredients in burrito
    const ingredientsPath = pathModule.join(folder, 'ingredients');
    const textFiles = await fs.readdirSync(ingredientsPath)
      .filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');

    await Promise.all(textFiles.map(async (file) => {
      const filePath = pathModule.join(ingredientsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      burrito.ingredients[pathModule.join('ingredients', file)] = {
        checksum: {
          md5: md5(content),
        },
        mimeType: file.endsWith('.md') ? 'text/markdown' : 'application/json',
        size: stats.size,
        role: file === 'LICENSE.md' ? 'x-licence' : undefined,
      };
    }));

    // Write updated metadata
    await fs.writeFileSync(pathModule.join(exportPath, 'metadata.json'), JSON.stringify(burrito));

    ExportActions.resetExportProgress();
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  } catch (error) {
    logger.error('ObsExportUtils.js', `Failed to export OBS combined stories: ${error}`);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  }
};

// Export OBS Default Audio + Text
export const exportObsDefaultAudio = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS default audio + text');
  const fse = window.require('fs-extra');
  const burrito = { ...metadata };

  try {
    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);
    const audioBasePath = pathModule.join(folder, 'ingredients', 'audio');

    // Copy text files
    await copyObsTextFiles(folder, exportPath, fs, fse);

    // Remove existing audio ingredients from burrito
    Object.keys(burrito.ingredients).forEach((key) => {
      if (key.includes('audio/')) {
        delete burrito.ingredients[key];
      }
    });

    // Get all audio files
    const allAudioFiles = await walkObsAudio(audioBasePath, pathModule, fs);
    const defaultAudioFiles = allAudioFiles.filter((file) => file.includes('_default.'));

    ExportActions.setTotalExports(defaultAudioFiles.length + 5); // Audio files + text processing

    // Copy only default audio files
    await Promise.all(defaultAudioFiles.map(async (audioFile) => {
      const relativePath = audioFile.split(/[\/\\]ingredients[\/\\]/)[1];
      const destinationPath = pathModule.join(exportPath, 'ingredients', relativePath);

      // Create directory if it doesn't exist
      const destinationDir = pathModule.dirname(destinationPath);
      fs.mkdirSync(destinationDir, { recursive: true });

      // Copy the file
      await fse.copy(audioFile, destinationPath);

      // Update burrito
      const content = fs.readFileSync(audioFile, 'utf8');
      const stats = fs.statSync(audioFile);
      const fileName = pathModule.basename(audioFile);
      const storyNum = fileName.split('_')[0];
      const segmentNum = fileName.split('_')[1];

      burrito.ingredients[pathModule.join('ingredients', relativePath)] = {
        checksum: {
          md5: md5(content),
        },
        mimeType: 'audio/mp3',
        size: stats.size,
        scope: {
          [storyNum]: [`${segmentNum}`],
        },
      };

      ExportActions.setTotalExported((prev) => prev + 1);
    }));

    // Update text file ingredients in burrito
    const ingredientsPath = pathModule.join(folder, 'ingredients');
    const textFiles = await fs.readdirSync(ingredientsPath)
      .filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');

    await Promise.all(textFiles.map(async (file) => {
      const filePath = pathModule.join(ingredientsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      burrito.ingredients[pathModule.join('ingredients', file)] = {
        checksum: {
          md5: md5(content),
        },
        mimeType: file.endsWith('.md') ? 'text/markdown' : 'application/json',
        size: stats.size,
        role: file === 'LICENSE.md' ? 'x-licence' : undefined,
      };

      ExportActions.setTotalExported((prev) => prev + 1);
    }));

    // Write updated metadata
    await fs.writeFileSync(pathModule.join(exportPath, 'metadata.json'), JSON.stringify(burrito));

    ExportActions.setTotalExported((prev) => prev + 1);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  } catch (error) {
    logger.error('ObsExportUtils.js', `Failed to export OBS default audio: ${error}`);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  }
};
