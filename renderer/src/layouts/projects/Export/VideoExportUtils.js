import * as logger from '../../../logger';

const buildUpdatedUSFM = (originalUSFM, jsonChapterData, chapterNumber) => {
  try {
    logger.info(`Building updated chapter ${chapterNumber}...`);

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
      let verseText = '';

      if (verse.verseSegments && verse.verseSegments.length > 0) {
        verseText = verse.verseSegments
          .map((seg) => seg.text.trim())
          .join(' ');
      } else {
        verseText = verse.verseText || '';
      }

      newChapterContent += `\\v ${verseNum} ${verseText}\n`;
    });

    const updatedUSFM = beforeChapter + newChapterContent + afterChapter;

    logger.info(`Built updated chapter ${chapterNumber}`);
    return updatedUSFM;
  } catch (err) {
    logger.error('Error building updated USFM:', err);
    return originalUSFM;
  }
};

const mergeUSFMWithJSON = (originalUSFM, jsonData) => {
  try {
    logger.info('Merging USFM with JSON updates...');

    const updatedChapterNumbers = Object.keys(jsonData);
    logger.info(`Chapters to update: ${updatedChapterNumbers.join(', ')}`);

    let mergedUSFM = originalUSFM;

    updatedChapterNumbers.forEach((chapterNum) => {
      const jsonChapter = jsonData[chapterNum];

      if (jsonChapter.verses) {
        mergedUSFM = buildUpdatedUSFM(mergedUSFM, jsonChapter, chapterNum);
        logger.info(`Updated chapter ${chapterNum}`);
      }
    });

    return mergedUSFM;
  } catch (err) {
    logger.error('Error merging USFM with JSON:', err);
    return originalUSFM;
  }
};

export const exportVideoNormal = async (
  metadata,
  folder,
  path,
  fs,
  ExportActions,
  ExportStates,
  closePopUp,
  t,
) => {
  const {
    setNotify, setSnackText, setOpenSnackBar, setTotalExported,
    setTotalExports, resetExportProgress,
  } = ExportActions;
  const { folderPath, project, checkZip } = ExportStates;

  try {
    logger.info('Starting video export (Normal - as-is)...');
    setTotalExports(3);
    setTotalExported(1);

    const fse = window.require('fs-extra');
    const exportPath = path.join(folderPath, project.name);

    await fse.copy(folder, exportPath);
    setTotalExported(2);

    const gitPath = path.join(exportPath, '.git');
    if (fs.existsSync(gitPath)) {
      await fs.rmdirSync(gitPath, { recursive: true });
    }

    setTotalExported(3);

    if (checkZip) {
      const AdmZip = window.require('adm-zip');
      const zip = new AdmZip();
      zip.addLocalFolder(exportPath);
      zip.writeZip(path.join(folderPath, `${project.name}.zip`));

      await fs.rmdirSync(exportPath, { recursive: true });
    }

    resetExportProgress();
    setNotify('success');
    setSnackText(t('dynamic-msg-export-success'));
    setOpenSnackBar(true);
    closePopUp(false);
  } catch (err) {
    logger.error('Video export (Normal) failed:', err);
    resetExportProgress();
    setNotify('failure');
    setSnackText(t('dynamic-msg-export-fail'));
    setOpenSnackBar(true);
    closePopUp(false);
  }
};

export const exportVideoSynchronized = async (
  metadata,
  folder,
  path,
  fs,
  ExportActions,
  ExportStates,
  closePopUp,
  t,
) => {
  const {
    setNotify, setSnackText, setOpenSnackBar, setTotalExported,
    setTotalExports, resetExportProgress,
  } = ExportActions;
  const { folderPath, project, checkZip } = ExportStates;

  try {
    logger.info('Starting video export (Synchronized - USFM with \\vp markers)...');
    setTotalExports(6);
    setTotalExported(1);

    const fse = window.require('fs-extra');
    const exportPath = path.join(folderPath, project.name);

    await fse.copy(folder, exportPath);
    setTotalExported(2);

    const videoIngredientsPath = path.join(folder, 'video', 'ingredients');
    const textIngredientsPath = path.join(exportPath, 'text-1', 'ingredients');

    if (fs.existsSync(videoIngredientsPath)) {
      const bookFolders = fs.readdirSync(videoIngredientsPath);

      bookFolders.forEach((bookFolder) => {
        const bookFolderPath = path.join(videoIngredientsPath, bookFolder);
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
                logger.info(`✓ Updated USFM for ${bookFolder} (with \\vp markers)`);
              } else {
                logger.warn(`No original USFM found for ${bookFolder}, skipping`);
              }
            }
          } catch (err) {
            logger.error(`Error processing ${bookFolder}:`, err);
          }
        }
      });
    }
    setTotalExported(3);

    logger.info('Removing JSON structure files from export...');
    const exportVideoPath = path.join(exportPath, 'video', 'ingredients');
    if (fs.existsSync(exportVideoPath)) {
      const bookFolders = fs.readdirSync(exportVideoPath);
      bookFolders.forEach((bookFolder) => {
        const jsonFilePath = path.join(exportVideoPath, bookFolder, `${bookFolder.toLowerCase()}.json`);
        if (fs.existsSync(jsonFilePath)) {
          fs.unlinkSync(jsonFilePath);
          logger.info(`Deleted ${bookFolder.toLowerCase()}.json from export`);
        }
      });
    }
    setTotalExported(4);

    const gitPath = path.join(exportPath, '.git');
    if (fs.existsSync(gitPath)) {
      await fs.rmdirSync(gitPath, { recursive: true });
    }
    setTotalExported(5);

    if (checkZip) {
      const AdmZip = window.require('adm-zip');
      const zip = new AdmZip();
      zip.addLocalFolder(exportPath);
      zip.writeZip(path.join(folderPath, `${project.name}.zip`));

      await fs.rmdirSync(exportPath, { recursive: true });
    }
    setTotalExported(6);

    resetExportProgress();
    setNotify('success');
    setSnackText(t('dynamic-msg-export-success'));
    setOpenSnackBar(true);
    closePopUp(false);
  } catch (err) {
    logger.error('Video export (Synchronized) failed:', err);
    resetExportProgress();
    setNotify('failure');
    setSnackText(t('dynamic-msg-export-fail'));
    setOpenSnackBar(true);
    closePopUp(false);
  }
};
