/* eslint-disable no-useless-escape */
import { mergeAudio } from '@/components/AudioRecorder/core/audioUtils';
import * as logger from '../../../logger';

const md5 = require('md5');

const buildUpdatedUSFM = (originalUSFM, jsonChapterData, chapterNumber) => {
  try {
    logger.debug(`Building updated chapter ${chapterNumber}...`);

    const chapterMarker = `\\c ${chapterNumber}`;
    const chapterIndex = originalUSFM.indexOf(chapterMarker);

    if (chapterIndex === -1) {
      logger.warn(`Chapter ${chapterNumber} not found in USFM`);
      return originalUSFM;
    }

    const nextChapterPattern = new RegExp(`\\\\c\\s+${parseInt(chapterNumber, 10) + 1}`, 'm');
    const nextChapterMatch = nextChapterPattern.exec(originalUSFM);
    const nextChapterIndex = nextChapterMatch ? nextChapterMatch.index : originalUSFM.length;

    const beforeChapter = originalUSFM.substring(0, chapterIndex);
    const afterChapter = nextChapterIndex < originalUSFM.length
      ? originalUSFM.substring(nextChapterIndex)
      : '';

    let newChapterContent = `\\c ${chapterNumber}\n\\p\n`;

    const verses = jsonChapterData.verses.filter((v) => v.verseNumber && v.verseText !== undefined);

    verses.forEach((verse) => {
      const verseNum = verse.verseNumber;
      const verseText = verse.verseText || '';

      newChapterContent += `\\v ${verseNum} ${verseText}\n`;
    });

    const updatedUSFM = beforeChapter + newChapterContent + afterChapter;

    logger.debug(`Built updated chapter ${chapterNumber}`);
    return updatedUSFM;
  } catch (err) {
    logger.error('Error building updated USFM:', err);
    return originalUSFM;
  }
};

const mergeUSFMWithJSON = (originalUSFM, jsonData, bookId) => {
  try {
    logger.debug(`Merging USFM with JSON updates for ${bookId}...`);

    const updatedChapterNumbers = Object.keys(jsonData);
    logger.debug(`Chapters to update: ${updatedChapterNumbers.join(', ')}`);

    let mergedUSFM = originalUSFM;

    updatedChapterNumbers.forEach((chapterNum) => {
      const jsonChapter = jsonData[chapterNum];

      if (jsonChapter.verses) {
        mergedUSFM = buildUpdatedUSFM(mergedUSFM, jsonChapter, chapterNum);
        logger.debug(`Updated chapter ${chapterNum} for ${bookId}`);
      }
    });

    return mergedUSFM;
  } catch (err) {
    logger.error('Error merging USFM with JSON:', err);
    return originalUSFM;
  }
};

const updateUSFMFromJSON = async (folder, exportPath, path, fs) => {
  try {
    logger.debug('Starting USFM update from bookId.json files...');

    const audioIngredientsPath = path.join(folder, 'audio', 'ingredients');
    const textIngredientsPath = path.join(exportPath, 'text-1', 'ingredients');

    if (!fs.existsSync(textIngredientsPath)) {
      logger.debug('No text-1 folder in export, skipping USFM update');
      return;
    }

    if (!fs.existsSync(audioIngredientsPath)) {
      logger.debug('No audio ingredients, skipping USFM update');
      return;
    }

    const bookFolders = fs.readdirSync(audioIngredientsPath);

    bookFolders.forEach((bookFolder) => {
      const bookFolderPath = path.join(audioIngredientsPath, bookFolder);
      const jsonFilePath = path.join(bookFolderPath, `${bookFolder.toLowerCase()}.json`);

      if (fs.existsSync(jsonFilePath) && fs.statSync(bookFolderPath).isDirectory()) {
        try {
          const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

          if (jsonData[bookFolder]) {
            const usfmPath = path.join(textIngredientsPath, `${bookFolder}.usfm`);

            if (fs.existsSync(usfmPath)) {
              const originalUSFM = fs.readFileSync(usfmPath, 'utf8');
              const updatedUSFM = mergeUSFMWithJSON(
                originalUSFM,
                jsonData[bookFolder],
                bookFolder,
              );

              fs.writeFileSync(usfmPath, updatedUSFM, 'utf8');
              logger.debug(`Updated USFM for ${bookFolder}`);
            } else {
              logger.debug(`No USFM found for ${bookFolder}, skipping`);
            }
          }
        } catch (err) {
          logger.error(`Error processing ${bookFolder}:`, err);
        }
      }
    });

    logger.debug('USFM update completed');
  } catch (err) {
    logger.error('Error updating USFM from JSON:', err);
  }
};

export async function writeRecfile(file, filePath, fs) {
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
}

// function to walkthough the directory and identify audios
export async function walk(dir, path, fs) {
  logger.debug('ExportProjectUtils.js', `in walk through dir : ${dir} : ${path}`);
  let files = await fs.readdirSync(dir);
  files = await Promise.all(files.map(async (file) => {
    const filePath = path.join(dir, file);
    const stats = await fs.statSync(filePath);
    if (stats.isDirectory()) { return walk(filePath, path, fs); }
    if (stats.isFile()) { return filePath; }
  }));
  return files.reduce((all, folderContents) => all.concat(folderContents), []);
}

// util Function for default export Audio
const writeAndUpdateBurritoDefaultExport = async (audio, path, mp3ExportPath, fs, fse, book, verse, burrito, folderPath, project) => {
  await fse.copy(audio, path.join(folderPath, project.name, mp3ExportPath))
    .then(async () => {
      logger.debug('ExportProjectUtils.js', 'Creating the ingredients.');
      const content = fs.readFileSync(path.join(folderPath, project.name, mp3ExportPath), 'utf8');
      const stats = fs.statSync(path.join(folderPath, project.name, mp3ExportPath));
      burrito.ingredients[mp3ExportPath] = {
        checksum: {
          md5: md5(content),
        },
        mimeType: 'audio/mp3',
        size: stats.size,
        scope: {},
      };
      burrito.ingredients[mp3ExportPath].scope[book] = [verse.replace('_', ':')];
    }).catch((err) => logger.error('ExportProjectUtils.js', `${err}`));
};

// export audio project FUll Zip
export const exportFullAudio = async (metadata, folder, path, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ExportProjectUtils.js', 'In export Full zip for audio');
  ExportActions.setTotalExported((curr) => curr + 1);
  const AdmZip = window.require('adm-zip');
  const fse = window.require('fs-extra');
  const burrito = metadata;
  const dir = path.join(ExportStates.folderPath, ExportStates.project.name, 'audio', 'ingredients');
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
  logger.debug('ExportProjectUtils.js', 'write zip completed');
  ExportActions.setTotalExported((curr) => curr + 1);

  const audioIngredientsPath = path.join(folder, 'audio', 'ingredients');
  const rootFiles = fs.readdirSync(audioIngredientsPath, { withFileTypes: true })
    .filter((item) => item.isFile() && !item.name.includes('.mp3') && !item.name.includes('.wav'))
    .map((item) => item.name);

  rootFiles.forEach((file) => {
    fse.copySync(path.join(audioIngredientsPath, file), path.join(dir, file));
  });

  logger.debug('ExportProjectUtils.js', 'copied all files');
  const renames = Object.keys(burrito.ingredients).filter((key) => key.includes('audio'));
  await renames?.forEach((rename) => {
    burrito.ingredients[rename.replace(/audio[\/\\]/, 'audio/ingredients/')] = burrito.ingredients[rename];
    delete burrito.ingredients[rename];
  });
  const content = fs.readFileSync(path.join(dir, 'ag_internal_audio.zip'), 'utf8');
  const stats = fs.statSync(path.join(dir, 'ag_internal_audio.zip'));
  burrito.ingredients['audio/ingredients/ag_internal_audio.zip'] = {
    checksum: {
      md5: md5(content),
    },
    mimeType: 'application/zip',
    size: stats.size,
  };
  ExportActions.setTotalExported((curr) => curr + 1);
  await fs.writeFileSync(path.join(ExportStates.folderPath, ExportStates.project.name, 'metadata.json'), JSON.stringify(burrito));
  if (ExportStates.checkText && fs.existsSync(path.join(folder, 'text-1'))) {
    await fse.copySync(
      path.join(folder, 'text-1'),
      path.join(ExportStates.folderPath, ExportStates.project.name, 'text-1'),
    );

    await updateUSFMFromJSON(
      folder,
      path.join(ExportStates.folderPath, ExportStates.project.name),
      path,
      fs,
    );
  }
  logger.debug('ExportProjectPopUp.js', 'Exported Successfully');
  ExportActions.resetExportProgress();
  ExportActions.setNotify('success');
  ExportActions.setSnackText(t('dynamic-msg-export-success'));
  ExportActions.setOpenSnackBar(true);
  closePopUp(false);
};

// Function for Chapter Level Export DEFAULT - Verse Wise / MERGE CHAPTER LEVEL
const exportChapterAudio = async (defaultAudio, burrito, fs, path, folder, folderPath, project, ExportActions) => {
  logger.debug('ExportProjectUtils.js', 'In export Chapter level audio');
  const audioObj = {};
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
  // loop the book and chapter to generate merged audio of chapter
  // eslint-disable-next-line no-restricted-syntax
  for (const bk in audioObj) {
    if (Object.prototype.hasOwnProperty.call(audioObj, bk)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const ch in audioObj[bk]) {
        if (Object.prototype.hasOwnProperty.call(audioObj[bk], ch)) {
          const extension = audioObj[bk][ch][0].split('.').pop();
          const audioName = `${ch}.${extension}`;
          const audioExportPath = path.join(folderPath, project.name, 'ingredients', bk);
          // eslint-disable-next-line no-await-in-loop
          await mergeAudio(audioObj[bk][ch], path.join(folder, 'audio', 'ingredients', bk, ch), path, bk, ch)
            .then(async ([mergedAudioBlob, timeStampData]) => {
              logger.debug('ExportProjectPopUp.js', `generated merged audio for ${bk} : ${ch}`);
              // console.log('audio created ==== : ', `generated merged audio for => ${bk} : ${ch}`);
              ExportActions.setTotalExported((curr) => curr + audioObj[bk][ch].length);
              // Write Merge Audio
              fs.mkdirSync(audioExportPath, { recursive: true });
              await writeRecfile(mergedAudioBlob, path.join(audioExportPath, audioName), fs)
                .then(async (convertedBlob) => {
                  logger.debug('ExportProjectPopUp.js', 'Generated audio written to folder');
                  const stats = fs.statSync(path.join(audioExportPath, audioName));
                  burrito.ingredients[path.join('ingredients', bk, audioName)] = {
                    checksum: {
                      md5: md5(convertedBlob),
                    },
                    mimeType: 'audio/mp3',
                    size: stats.size,
                    scope: {},
                  };
                  burrito.ingredients[path.join('ingredients', bk, audioName)].scope[bk] = [ch.toString()];
                  logger.debug('ExportProjectPopUp.js', 'Burrito updated for generated Audio');
                  // Write TimeStamp
                  fs.mkdirSync(path.join(folderPath, project.name, 'time stamps'), { recursive: true });
                  await fs.writeFileSync(path.join(folderPath, project.name, 'time stamps', timeStampData[0]), timeStampData[1], 'utf-8');
                });
            });
        }
      }
    }
  }
};

export const exportDefaultAudio = async (metadata, folder, path, fs, ExportActions, ExportStates, closePopUp, t) => {
  logger.debug('ExportProjectUtils.js', 'in Export Audio Common Function ');
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
      const verse = mp3.replace('.mp3', '');
      const mp3ExportPath = path.join('ingredients', book, chapter, mp3);
      // eslint-disable-next-line
      await writeAndUpdateBurritoDefaultExport(audio, path, mp3ExportPath, fs, fse, book, verse, burrito, ExportStates.folderPath, ExportStates.project);
      ExportActions.setTotalExported((prev) => prev + 1);
    }
  } else if (ExportStates.audioExport === 'chapter') {
    await exportChapterAudio(defaultAudio, burrito, fs, path, folder, ExportStates.folderPath, ExportStates.project, ExportActions);
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

    await updateUSFMFromJSON(
      folder,
      path.join(ExportStates.folderPath, ExportStates.project.name),
      path,
      fs,
    );
  }
  // if (audioExport === 'chapter') {
  //   pushNotification('Export Project', `${t('dynamic-msg-export-success')} ${project.name} project`);
  // }
  logger.debug('ExportProjectPopUp.js', 'Exported Successfully');
  ExportActions.resetExportProgress(); // finish export reset all states of export
  ExportActions.setNotify('success');
  ExportActions.setSnackText(t('dynamic-msg-export-success'));
  ExportActions.setOpenSnackBar(true);
  closePopUp(false);
  ExportActions.setCheckText(false);
};
