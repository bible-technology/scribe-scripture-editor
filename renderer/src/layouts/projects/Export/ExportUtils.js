/* eslint-disable no-useless-escape */
import { mergeAudio } from '@/components/AudioRecorder/core/audioUtils';
import * as logger from '../../../logger';
import loadFFmpeg, { transcodeSingleWavToMp3 } from './ffmpegAudioCore';

const md5 = require('md5');

export async function writeRecfile(file, filePath, fs) {
  try {
    logger.debug('ExportProjectUtils.js', `in Chapter level file write : ${filePath}`);
    return new Promise((resolve) => {
    const fileReader = new FileReader();
    // eslint-disable-next-line func-names
    fileReader.onload = async function () {
      await fs.writeFileSync(filePath, Buffer.from(new Uint8Array(this.result)));
      resolve(Buffer.from(new Uint8Array(this.result)));
    };
    fileReader.readAsArrayBuffer(file);
    });
  } catch (err) {
    throw new Error(err);
  }
}

// fucntion to walkthough the directory and identify audios
export async function walk(dir, path, fs) {
  try {
    logger.debug('ExportUtils.js', `in wlak thorugh dir : ${dir} : ${path}`);
    let files = await fs.readdirSync(dir);
    files = await Promise.all(files.map(async (file) => {
        const filePath = path.join(dir, file);
        const stats = await fs.statSync(filePath);
        if (stats.isDirectory()) { return walk(filePath, path, fs); }
        if (stats.isFile()) { return filePath; }
    }));
    return files.reduce((all, folderContents) => all.concat(folderContents), []);
  } catch (err) {
    throw new Error(err);
  }
}

// util Function for default export Audio wav
const writeAndUpdateBurritoDefaultExportWav = async (audio, path, mp3ExportPath, fs, fse, book, verse, burrito, folderPath, project, selectedAudioExt) => {
  await fse.copy(audio, path.join(folderPath, project.name, mp3ExportPath))
    .then(async () => {
      logger.debug('ExportUtilss.js', 'Creating the ingredients.');
      const content = fs.readFileSync(path.join(folderPath, project.name, mp3ExportPath), 'utf8');
      const stats = fs.statSync(path.join(folderPath, project.name, mp3ExportPath));
      burrito.ingredients[mp3ExportPath] = {
          checksum: {
          md5: md5(content),
          },
          mimeType: selectedAudioExt.mimeType,
          size: stats.size,
          scope: {},
      };
      burrito.ingredients[mp3ExportPath].scope[book] = [verse.replace('_', ':')];
    }).catch((err) => {
      logger.error('ExportUtilss.js', `${err}`);
      throw new Error(err);
  });
};

async function convertWavToMp3(inputFilePath, path) {
  try {
    logger.debug('ExportUtils.js', 'convertWavToMp3 : in convert indivudual wav to mp3');
    let ffmpeg;
    if (!ffmpeg) {
      ffmpeg = await loadFFmpeg();
    }
    if (ffmpeg) {
      const mp3Blob = await transcodeSingleWavToMp3(path.join('file://', inputFilePath));
      return mp3Blob;
    }
    throw new Error('Error load converter. Export failed');
  } catch (error) {
    logger.debug('ExportUtils.js', `convertWavToMp3 : error in convert indivudual wav to mp3 ${error}`);
    throw new Error(error?.message || error);
  }
}

// utils fucnton for default export Audio mp3
const writeAndUpdateBurritoDefaultExportMp3 = async (audio, path, mp3ExportPath, fs, fse, book, verse, burrito, folderPath, project, selectedAudioExt) => {
  // update new file path mostly in target
  try {
    const outputFilePath = path.join(folderPath, project.name, mp3ExportPath);
    const mp3Blob = await convertWavToMp3(audio, path);
    await writeRecfile(mp3Blob, outputFilePath, fs)
    .then(async (convertedBlob) => {
      logger.debug('ExportUtils.js', 'Generated wav audio written to folder');
      const stats = fs.statSync(outputFilePath);
      burrito.ingredients[mp3ExportPath] = {
        checksum: {
          md5: md5(convertedBlob),
        },
        mimeType: selectedAudioExt.mimeType,
        size: stats.size,
        scope: {},
      };
    });
    burrito.ingredients[mp3ExportPath].scope[book] = [verse.replace('_', ':')];
  } catch (err) {
    throw new Error(err?.message || err);
  }
};

// export audio project FUll Zip
export const exportFullAudio = async (metadata, folder, path, fs, ExportActions, ExportStates, closePopUp, t) => {
  try {
    logger.debug('ExportUtils.js', 'In export Full zip for audio');
    ExportActions.setTotalExported((curr) => curr + 1);
    const AdmZip = window.require('adm-zip');
    const fse = window.require('fs-extra');
    const burrito = metadata;
    const dir = path.join(ExportStates.folderPath, ExportStates.project.name, 'ingredients');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const zip = new AdmZip();
    const directories = fs.readdirSync(path.join(folder, 'audio', 'ingredients'), { withFileTypes: true })
      .filter((item) => item.isDirectory())
      .map((item) => item.name);
    directories.forEach((sourceDir) => {
      zip.addLocalFolder(path.join(folder, 'audio', 'ingredients', sourceDir), sourceDir);
    });
    zip.writeZip(path.join(dir, 'ag_internal_audio.zip'));
    logger.debug('ExportUtils.js', 'write zip completed');
    ExportActions.setTotalExported((curr) => curr + 1);
    const list = await walk(path.join(folder, 'audio', 'ingredients'), path, fs);
    const otherFiles = list.filter((name) => !name.includes('.mp3') && !name.includes('.wav'));
    await otherFiles.forEach(async (file) => {
      const filePath = file.split(/[\/\\]ingredients[\/\\]/)[1];
      await fse.copy(file, path.join(ExportStates.folderPath, ExportStates.project.name, 'ingredients', filePath));
    });
    logger.debug('ExportUtils.js', 'copied all files');
    const renames = Object.keys(burrito.ingredients).filter((key) => key.includes('audio'));
    await renames?.forEach((rename) => {
      burrito.ingredients[rename.replace(/audio[\/\\]/, '')] = burrito.ingredients[rename];
      delete burrito.ingredients[rename];
    });
    const content = fs.readFileSync(path.join(dir, 'ag_internal_audio.zip'), 'utf8');
    const stats = fs.statSync(path.join(dir, 'ag_internal_audio.zip'));
    burrito.ingredients[path.join('ingredients', 'ag_internal_audio.zip')] = {
      checksum: {
        md5: md5(content),
      },
      mimeType: 'application/zip',
      size: stats.size,
    };
    ExportActions.setTotalExported((curr) => curr + 1);
    await fs.writeFileSync(path.join(ExportStates.folderPath, ExportStates.project.name, 'metadata.json'), JSON.stringify(burrito));
    logger.debug('ExportUtils.js', 'Exported Successfully');
    ExportActions.resetExportProgress();
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
  } catch (err) {
    logger.debug('ExportUtils.js', `Exported failed ${err}`);
    ExportActions.resetExportProgress(); // finish export reset all states of export
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
  }
};

// Function for Chapter Level Export DEFAULT - Verse Wise / MERGE CHAPTER LEVEL
const exportChapterAudio = async (defaultAudio, burrito, fs, path, folder, folderPath, project, ExportActions, selectedAudioExt) => {
    try {
      logger.debug('ExportUtils.js', 'In export Chapter level audio');
      const audioObj = {};
      // load ffmpeg
      const ffmpeg = await loadFFmpeg();

      // delete verse vice ingredients exist in burrito
      const audioExtensions = ['.mp3', '.wav'];
      // eslint-disable-next-line no-unused-vars
      Object.entries(burrito.ingredients).forEach(([_k, _v]) => {
        if (audioExtensions.some((ext) => _k.toLocaleLowerCase().includes(ext.toLocaleLowerCase()))) { delete burrito.ingredients[_k]; }
      });
      // eslint-disable-next-line
      for (const audio of defaultAudio) {
        const book = audio.split(/[\/\\]/).slice(-3)[0];
        const chapter = audio.split(/[\/\\]/).slice(-2)[0];
        const url = audio.split(/[\/\\]/).slice(-1)[0];
        // eslint-disable-next-line no-await-in-loop
        if (book in audioObj && chapter in audioObj[book]) {
            audioObj[book][chapter].push(url);
        } else if (!(book in audioObj)) {
            audioObj[book] = { [chapter]: new Array(url) };
        } else if (book in audioObj && !(chapter in audioObj[book])) {
            audioObj[book][chapter] = new Array(url);
        }
      }
      // loop the book and chapter  to generate merged audio of chapter
      if (ffmpeg) {
        // eslint-disable-next-line no-restricted-syntax
        for (const bk in audioObj) {
          if (Object.prototype.hasOwnProperty.call(audioObj, bk)) {
            // eslint-disable-next-line no-restricted-syntax
            for (const ch in audioObj[bk]) {
              if (Object.prototype.hasOwnProperty.call(audioObj[bk], ch)) {
                // const extension = audioObj[bk][ch][0].split('.').pop();
                const audioName = `${ch}.${selectedAudioExt.ext}`;
                const audioExportPath = path.join(folderPath, project.name, 'ingredients', bk);
                // eslint-disable-next-line no-await-in-loop
                await mergeAudio(audioObj[bk][ch], path.join(folder, 'audio', 'ingredients', bk, ch), path, bk, ch, selectedAudioExt.ext, ffmpeg)
                .then(async ([mergedAudioBlob, timeStampData]) => {
                  logger.debug('ExportUtils.js', `generated merged audio for ${bk} : ${ch}`);
                  // console.log('audio created ==== : ', `generated merged audio for => ${bk} : ${ch}`);
                  ExportActions.setTotalExported((curr) => curr + audioObj[bk][ch].length);
                  // Write Merge Audio
                  fs.mkdirSync(audioExportPath, { recursive: true });
                  await writeRecfile(mergedAudioBlob, path.join(audioExportPath, audioName), fs)
                  .then(async (convertedBlob) => {
                  logger.debug('ExportUtils.js', 'Generated audio written to folder');
                  const stats = fs.statSync(path.join(audioExportPath, audioName));
                  burrito.ingredients[path.join('ingredients', bk, audioName)] = {
                    checksum: {
                      md5: md5(convertedBlob),
                    },
                    mimeType: selectedAudioExt.ext === 'mp3' ? 'audio/mpeg' : 'audio/wav',
                    size: stats.size,
                    scope: {},
                  };
                  burrito.ingredients[path.join('ingredients', bk, audioName)].scope[bk] = [ch.toString()];
                  logger.debug('ExportUtils.js', 'Burrito updated for generated Audio');
                  // Write TimeStamp
                  fs.mkdirSync(path.join(folderPath, project.name, 'time stamps'), { recursive: true });
                  await fs.writeFileSync(path.join(folderPath, project.name, 'time stamps', timeStampData[0]), timeStampData[1], 'utf-8');
                });
                });
              }
            }
          }
        }
      } else {
        throw new Error('failed to convert. Converted not loaded');
      }
    } catch (err) {
      throw new Error(`audio generation failed : ${err}`);
    }
  };

export const exportDefaultAudio = async (metadata, folder, path, fs, ExportActions, ExportStates, closePopUp, t, selectedAudioExt) => {
  try {
    logger.debug('ExportUtils.js', 'in Export Audio Common Function ');
    const fse = window.require('fs-extra');
    const burrito = metadata;
    const list = await walk(path.join(folder, 'audio', 'ingredients'), path, fs);
    const defaultAudio = list.filter((name) => name.includes('_default'));
    const otherFiles = list.filter((name) => !name.includes('.mp3') && !name.includes('.wav'));
    ExportActions.setTotalExports((ExportStates.checkText ? 1 : 0) + list.length); // total audios items to export + common process later
    if (ExportStates.audioExport === 'default') {
      // Unable to use forEach, since forEach doesn't wait to finish the loop
    // eslint-disable-next-line
      for (const audio of defaultAudio) {
        const book = audio.split(/[\/\\]/).slice(-3)[0];
        const chapter = audio.split(/[\/\\]/).slice(-2)[0];
        const url = audio.split(/[\/\\]/).slice(-1)[0];
        const mp3 = url.replace(/_\d_default/, '');
        const verse = mp3.replace('.mp3', ''); // change this when backend change default to wav
        // const mp3ExportPath = path.join('ingredients', book, chapter, mp3);
        const mp3ExportPath = path.join('ingredients', book, chapter, `${verse}.${selectedAudioExt.ext}`);
        const exportFolderPath = path.join(ExportStates.folderPath, ExportStates.project.name, 'ingredients', book, chapter);
        if (selectedAudioExt.ext === 'wav') {
          // eslint-disable-next-line
          await writeAndUpdateBurritoDefaultExportWav(audio, path, mp3ExportPath, fs, fse, book, verse, burrito, ExportStates.folderPath, ExportStates.project, selectedAudioExt);
        } else if (selectedAudioExt.ext === 'mp3') {
          fs.mkdirSync(exportFolderPath, { recursive: true });
          // eslint-disable-next-line
          await writeAndUpdateBurritoDefaultExportMp3(audio, path, mp3ExportPath, fs, fse, book, verse, burrito, ExportStates.folderPath, ExportStates.project, selectedAudioExt);
        }
        ExportActions.setTotalExported((prev) => prev + 1);
      }
    } else if (ExportStates.audioExport === 'chapter') {
        await exportChapterAudio(defaultAudio, burrito, fs, path, folder, ExportStates.folderPath, ExportStates.project, ExportActions, selectedAudioExt);
    }
    // We need to execute these loop before going to next line so 'for' is used instead of 'forEach'
    // eslint-disable-next-line no-restricted-syntax
    for (const file of otherFiles) {
      const filePath = file.split(/[\/\\]ingredients[\/\\]/)[1];
      fse.copySync(file, path.join(ExportStates.folderPath, ExportStates.project.name, 'ingredients', filePath));
      ExportActions.setTotalExported((curr) => curr + 1);
    }
    // Wants to export the TEXT along with the project so not updating the file path
    if (!ExportStates.checkText) {
      const renames = Object.keys(burrito.ingredients).filter((key) => key.includes('audio'));
      await renames?.forEach((rename) => {
        burrito.ingredients[rename.replace(/audio[\/\\]/, '')] = burrito.ingredients[rename];
        delete burrito.ingredients[rename];
      });
    }
    await fs.writeFileSync(path.join(ExportStates.folderPath, ExportStates.project.name, 'metadata.json'), JSON.stringify(burrito));
    if (ExportStates.checkText && fs.existsSync(path.join(folder, 'text-1'))) {
      ExportActions.setTotalExported((prev) => prev + 1);
      await fse.copySync(path.join(ExportStates.folderPath, ExportStates.project.name, 'ingredients'), path.join(ExportStates.folderPath, ExportStates.project.name, 'audio', 'ingredients'));
      await fse.copySync(path.join(folder, 'text-1'), path.join(ExportStates.folderPath, ExportStates.project.name, 'text-1'));
      await fs.rmSync(path.join(ExportStates.folderPath, ExportStates.project.name, 'ingredients'), { recursive: true, force: true });
    }
    logger.debug('ExportUtils.js', 'Exported Successfully');
    ExportActions.resetExportProgress(); // finish export reset all states of export
    ExportActions.setNotify('success');
    ExportActions.setSnackText(t('dynamic-msg-export-success'));
    ExportActions.setOpenSnackBar(true);
    closePopUp(false);
    ExportActions.setCheckText(false);
  } catch (err) {
    logger.debug('ExportUtils.js', `Exported failed ${err}`);
    ExportActions.resetExportProgress(); // finish export reset all states of export
    ExportActions.setNotify('failure');
    ExportActions.setSnackText(t('dynamic-msg-export-fail'));
    ExportActions.setOpenSnackBar(true);
  }
};
