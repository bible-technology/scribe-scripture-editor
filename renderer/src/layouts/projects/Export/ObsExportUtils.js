/* eslint-disable no-useless-escape */
import { mergeAudio } from '@/components/AudioRecorder/core/audioUtils';
import * as logger from '../../../logger';
import updateObsSB from '../../../core/burrito/createObsSB';

const md5 = require('md5');
const path = require('path');

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

const copyObsTextFiles = async (folder, destinationPath, fs, fse) => {
  logger.debug('ObsExportUtils.js', 'Copying OBS text files');
  const ingredientsPath = path.join(folder, 'ingredients');
  const files = await fs.readdirSync(ingredientsPath);

  const textFiles = files.filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');

  await Promise.all(textFiles.map(async (file) => {
    await fse.copy(
      path.join(ingredientsPath, file),
      path.join(destinationPath, 'ingredients', file),
    );
  }));
};

const updateMetadataForExport = async (exportPath, username, project, updateBurrito = false) => {
  logger.debug('ObsExportUtils.js', 'Updating metadata using updateObsSB');

  const originalUserPath = localStorage.getItem('userPath');
  const exportUserPath = path.dirname(path.dirname(path.dirname(exportPath)));
  localStorage.setItem('userPath', path.dirname(path.dirname(path.dirname(exportUserPath))));

  try {
    const result = await updateObsSB(username, project, updateBurrito);
    return result;
  } finally {
    if (originalUserPath) {
      localStorage.setItem('userPath', originalUserPath);
    } else {
      localStorage.removeItem('userPath');
    }
  }
};

export const exportObsTextOnly = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS text only');
  const fse = window.require('fs-extra');
  const burrito = { ...metadata };

  Object.keys(burrito.ingredients).forEach((key) => {
    if (key.includes('audio/') || key.includes('.mp3') || key.includes('.wav')) {
      delete burrito.ingredients[key];
    }
  });

  try {
    ExportActions.resetExportProgress();

    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);
    const ingredientsPath = pathModule.join(folder, 'ingredients');
    const files = await fs.readdirSync(ingredientsPath);
    const textFiles = files.filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');

    const totalSteps = 1 + textFiles.length + 1;
    ExportActions.setTotalExports(totalSteps);

    let currentStep = 0;

    await copyObsTextFiles(folder, exportPath, fs, fse);
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

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
      currentStep += 1;
      ExportActions.setTotalExported(currentStep);
    }));

    await fs.writeFileSync(pathModule.join(exportPath, 'metadata.json'), JSON.stringify(burrito));
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

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

export const exportObsComplete = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS complete project with audio zipping');
  const fse = window.require('fs-extra');
  const AdmZip = window.require('adm-zip');
  const burrito = { ...metadata };

  try {
    ExportActions.resetExportProgress();

    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);
    const ingredientsDir = pathModule.join(exportPath, 'ingredients');

    const audioSourcePath = pathModule.join(folder, 'ingredients', 'audio');
    const ingredientsPath = pathModule.join(folder, 'ingredients');
    const allFiles = await fs.readdirSync(ingredientsPath);
    const textFiles = allFiles.filter((file) => file.endsWith('.md') || file === 'scribe-settings.json');
    const otherFiles = allFiles.filter((file) => file !== 'audio' && !file.endsWith('.md') && file !== 'scribe-settings.json');

    const totalSteps = 1 + 1 + 1 + otherFiles.length + textFiles.length + 1;
    ExportActions.setTotalExports(totalSteps);

    let currentStep = 0;

    if (!fs.existsSync(ingredientsDir)) {
      fs.mkdirSync(ingredientsDir, { recursive: true });
    }
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    await copyObsTextFiles(folder, exportPath, fs, fse);
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    const zip = new AdmZip();
    if (fs.existsSync(audioSourcePath)) {
      logger.debug('ObsExportUtils.js', 'Adding audio directories to zip');
      const audioDirectories = fs.readdirSync(audioSourcePath, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => item.name);

      audioDirectories.forEach((sourceDir) => {
        zip.addLocalFolder(pathModule.join(audioSourcePath, sourceDir), sourceDir);
      });

      const zipPath = pathModule.join(ingredientsDir, 'obs_internal_audio.zip');
      zip.writeZip(zipPath);
      logger.debug('ObsExportUtils.js', 'Audio zip file created successfully');

      const zipContent = fs.readFileSync(zipPath, 'utf8');
      const zipStats = fs.statSync(zipPath);
      burrito.ingredients[pathModule.join('ingredients', 'obs_internal_audio.zip')] = {
        checksum: { md5: md5(zipContent) },
        mimeType: 'application/zip',
        size: zipStats.size,
      };
    }
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    await Promise.all(otherFiles.map(async (file) => {
      const sourcePath = pathModule.join(ingredientsPath, file);
      const destPath = pathModule.join(ingredientsDir, file);
      await fse.copy(sourcePath, destPath);
      currentStep += 1;
      ExportActions.setTotalExported(currentStep);
    }));

    await Promise.all(textFiles.map(async (file) => {
      const filePath = pathModule.join(ingredientsPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const stats = fs.statSync(filePath);

      burrito.ingredients[pathModule.join('ingredients', file)] = {
        checksum: { md5: md5(content) },
        mimeType: file.endsWith('.md') ? 'text/markdown' : 'application/json',
        size: stats.size,
        role: file === 'LICENSE.md' ? 'x-licence' : undefined,
      };
      currentStep += 1;
      ExportActions.setTotalExported(currentStep);
    }));

    const audioExtensions = ['.mp3', '.wav'];
    Object.keys(burrito.ingredients).forEach((key) => {
      if (key.includes('audio/') || audioExtensions.some((ext) => key.toLowerCase().includes(ext.toLowerCase()))) {
        delete burrito.ingredients[key];
      }
    });

    await fs.writeFileSync(pathModule.join(exportPath, 'metadata.json'), JSON.stringify(burrito));
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    logger.debug('ObsExportUtils.js', 'OBS Complete export with zipping completed successfully');
    ExportActions.resetExportProgress();
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  } catch (error) {
    logger.error('ObsExportUtils.js', `Failed to export OBS complete with zipping: ${error}`);
    ExportActions.resetExportProgress();
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  }
};

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

export const exportObsCombinedStories = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS combined stories audio');
  const fse = window.require('fs-extra');

  try {
    ExportActions.resetExportProgress();

    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);
    const audioBasePath = pathModule.join(folder, 'ingredients', 'audio');

    const storyDirs = await fs.readdirSync(audioBasePath, { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);

    const totalSteps = 1 + 1 + (storyDirs.length * 2) + 1;
    ExportActions.setTotalExports(totalSteps);

    let currentStep = 0;

    await copyObsTextFiles(folder, exportPath, fs, fse);
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    await fse.copy(pathModule.join(folder, 'metadata.json'), pathModule.join(exportPath, 'metadata.json'));
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    await Promise.all(storyDirs.map(async (storyNum) => {
      const storyPath = pathModule.join(audioBasePath, storyNum);
      const audioFiles = await fs.readdirSync(storyPath);

      const defaultAudioFiles = audioFiles
        .filter((file) => file.includes('_default.'))
        .sort((a, b) => {
          const segmentA = parseInt(a.split('_')[1], 10);
          const segmentB = parseInt(b.split('_')[1], 10);
          return segmentA - segmentB;
        });

      if (defaultAudioFiles.length > 0) {
        currentStep += 1;
        ExportActions.setTotalExported(currentStep);

        const mergedResult = await mergeAudio(
          defaultAudioFiles,
          storyPath,
          pathModule,
          storyNum,
          storyNum,
        );

        const [mergedAudioBlob, timeStampData] = mergedResult;

        const audioExportPath = pathModule.join(exportPath, 'ingredients', 'audio', storyNum);
        fs.mkdirSync(audioExportPath, { recursive: true });

        const mergedFileName = `${storyNum.padStart(2, '0')}.mp3`;
        const mergedFilePath = pathModule.join(audioExportPath, mergedFileName);

        await writeRecfile(mergedAudioBlob, mergedFilePath, fs);
        const timestampDir = pathModule.join(exportPath, 'time stamps');
        fs.mkdirSync(timestampDir, { recursive: true });
        await fs.writeFileSync(
          pathModule.join(timestampDir, timeStampData[0]),
          timeStampData[1],
          'utf-8',
        );

        currentStep += 1;
        ExportActions.setTotalExported(currentStep);
      } else {
        currentStep += 2;
        ExportActions.setTotalExported(currentStep);
      }
    }));

    const username = ExportStates.username || 'default';
    const project = ExportStates.project;
    const updateResult = await updateMetadataForExport(exportPath, username, project, false);
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    if (updateResult) {
      ExportActions.resetExportProgress();
      ExportActions.setNotify('success');
      ExportActions.setSnackText(t('dynamic-msg-export-success'));
      ExportActions.setOpenSnackBar(true);
    } else {
      throw new Error('Failed to update metadata');
    }
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

export const exportObsDefaultAudio = async (metadata, folder, pathModule, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ObsExportUtils.js', 'Exporting OBS default audio + text');
  const fse = window.require('fs-extra');

  try {
    ExportActions.resetExportProgress();

    const exportPath = pathModule.join(ExportStates.folderPath, ExportStates.project.name);
    const audioBasePath = pathModule.join(folder, 'ingredients', 'audio');

    const allAudioFiles = await walkObsAudio(audioBasePath, pathModule, fs);
    const defaultAudioFiles = allAudioFiles.filter((file) => file.includes('_default.'));

    const totalSteps = 1 + 1 + defaultAudioFiles.length + 1;
    ExportActions.setTotalExports(totalSteps);

    let currentStep = 0;

    await copyObsTextFiles(folder, exportPath, fs, fse);
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    await fse.copy(pathModule.join(folder, 'metadata.json'), pathModule.join(exportPath, 'metadata.json'));
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    await Promise.all(defaultAudioFiles.map(async (audioFile) => {
      const relativePath = audioFile.split(/[\/\\]ingredients[\/\\]/)[1];
      const fileName = pathModule.basename(audioFile);
      const newFileName = fileName.replace('_default', '');
      const newRelativePath = relativePath.replace(fileName, newFileName);
      const destinationPath = pathModule.join(exportPath, 'ingredients', newRelativePath);

      const destinationDir = pathModule.dirname(destinationPath);
      fs.mkdirSync(destinationDir, { recursive: true });

      await fse.copy(audioFile, destinationPath);
      currentStep += 1;
      ExportActions.setTotalExported(currentStep);
    }));

    const username = ExportStates.username || 'default';
    const project = ExportStates.project;
    const updateResult = await updateMetadataForExport(exportPath, username, project, false);
    currentStep += 1;
    ExportActions.setTotalExported(currentStep);

    if (updateResult) {
      ExportActions.resetExportProgress();
      ExportActions.setNotify('success');
      ExportActions.setSnackText(t('dynamic-msg-export-success'));
      ExportActions.setOpenSnackBar(true);
    } else {
      throw new Error('Failed to update metadata');
    }

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
